const ROLE_CHANGE_LOCK = 'verzel-admin-role-change';

export class AdminRepository {
  constructor(database) {
    if (!database) throw new Error('A dependencia de banco de dados e obrigatoria.');
    this.database = database;
  }

  async getOverview() {
    const result = await this.database.query(
      `SELECT
         (SELECT COUNT(*)::INT FROM users) AS users_total,
         (SELECT COUNT(*)::INT FROM users WHERE role = 'ADMIN') AS admins_total,
         (SELECT COUNT(*)::INT FROM users WHERE role = 'LEILOEIRO') AS auctioneers_total,
         (SELECT COUNT(*)::INT FROM users WHERE role = 'LICITANTE') AS bidders_total,
         (SELECT COUNT(*)::INT FROM auction_lots) AS lots_total,
         (SELECT COUNT(*)::INT FROM auction_lots WHERE status = 'LIVE') AS lots_live,
         (SELECT COUNT(*)::INT FROM auction_lots WHERE status = 'SCHEDULED') AS lots_scheduled,
         (SELECT COUNT(*)::INT FROM auction_lots WHERE status = 'CLOSED') AS lots_closed,
         (SELECT COUNT(*)::INT FROM bids) AS bids_total,
         (SELECT COUNT(*)::INT FROM receipts) AS receipts_total,
         (SELECT COALESCE(SUM(amount), 0)::NUMERIC(14,2) FROM receipts) AS settled_total`,
    );
    return result.rows[0];
  }

  async listUsers({ search, limit, offset }) {
    const values = [`%${search}%`, limit, offset];
    const [usersResult, countResult] = await Promise.all([
      this.database.query(
        `SELECT u.id, u.name, u.email, u.role, u.created_at,
                COALESCE(w.balance_total, 0) AS balance_total,
                COALESCE(w.balance_pledged, 0) AS balance_pledged
         FROM users u LEFT JOIN wallets w ON w.user_id = u.id
         WHERE ($1 = '%%' OR u.name ILIKE $1 OR u.email ILIKE $1)
         ORDER BY u.created_at DESC, u.id DESC LIMIT $2 OFFSET $3`,
        values,
      ),
      this.database.query(
        `SELECT COUNT(*)::INT AS total FROM users u
         WHERE ($1 = '%%' OR u.name ILIKE $1 OR u.email ILIKE $1)`,
        [values[0]],
      ),
    ]);
    return { users: usersResult.rows, total: countResult.rows[0].total };
  }

  async updateUserRole(userId, role) {
    const client = await this.database.connect();
    try {
      await client.query('BEGIN');
      await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [ROLE_CHANGE_LOCK]);
      const targetResult = await client.query(
        'SELECT id, role FROM users WHERE id = $1 FOR UPDATE', [userId],
      );
      const target = targetResult.rows[0];
      if (!target) throw Object.assign(new Error('Usuario nao encontrado.'), { statusCode: 404 });

      if (target.role === 'ADMIN' && role !== 'ADMIN') {
        const adminsResult = await client.query("SELECT COUNT(*)::INT AS total FROM users WHERE role = 'ADMIN'");
        if (adminsResult.rows[0].total <= 1) {
          throw Object.assign(new Error('Nao e permitido remover o ultimo administrador.'), { statusCode: 409 });
        }
      }

      const updated = await client.query(
        `UPDATE users SET role = $2 WHERE id = $1
         RETURNING id, name, email, role, created_at`,
        [userId, role],
      );
      await client.query('COMMIT');
      return updated.rows[0];
    } catch (error) {
      try { await client.query('ROLLBACK'); } catch { /* Mantem o erro original. */ }
      throw error;
    } finally {
      client.release();
    }
  }

  async listLots({ search, limit, offset }) {
    const values = [`%${search}%`, limit, offset];
    const [lotsResult, countResult] = await Promise.all([
      this.database.query(
        `SELECT l.id, l.item_id, l.title, l.status, l.initial_price, l.min_increment,
                l.start_time, l.end_time, l.created_at, seller.name AS seller_name,
                COUNT(b.id)::INT AS bids_count, MAX(b.amount) AS current_bid,
                (ARRAY_AGG(bidder.name ORDER BY b.amount DESC, b.id DESC)
                  FILTER (WHERE b.id IS NOT NULL))[1] AS leading_bidder
         FROM auction_lots l
         JOIN users seller ON seller.id = l.seller_id
         LEFT JOIN bids b ON b.lot_id = l.id
         LEFT JOIN users bidder ON bidder.id = b.bidder_id
         WHERE ($1 = '%%' OR l.title ILIKE $1 OR seller.name ILIKE $1)
         GROUP BY l.id, seller.name
         ORDER BY l.created_at DESC, l.id DESC LIMIT $2 OFFSET $3`,
        values,
      ),
      this.database.query(
        `SELECT COUNT(*)::INT AS total FROM auction_lots l
         JOIN users seller ON seller.id = l.seller_id
         WHERE ($1 = '%%' OR l.title ILIKE $1 OR seller.name ILIKE $1)`,
        [values[0]],
      ),
    ]);
    return { lots: lotsResult.rows, total: countResult.rows[0].total };
  }

  async openLot(lotId) {
    const client = await this.database.connect();
    try {
      await client.query('BEGIN');
      const selected = await client.query('SELECT id, status, end_time FROM auction_lots WHERE id=$1 FOR UPDATE', [lotId]);
      const lot = selected.rows[0];
      if (!lot) throw Object.assign(new Error('Lote nao encontrado.'), { statusCode: 404 });
      if (lot.status !== 'SCHEDULED' || new Date(lot.end_time) <= new Date()) {
        throw Object.assign(new Error('Somente lotes agendados e ainda validos podem ser abertos.'), { statusCode: 409 });
      }
      const bids = await client.query('SELECT 1 FROM bids WHERE lot_id=$1 LIMIT 1', [lotId]);
      if (bids.rowCount) throw Object.assign(new Error('Lote com lances nao pode ser reaberto.'), { statusCode: 409 });
      const result = await client.query(
        `UPDATE auction_lots SET status='LIVE', start_time=NOW() WHERE id=$1
         RETURNING id, seller_id, item_id, title, initial_price, min_increment, start_time, end_time, status, created_at`,
        [lotId],
      );
      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      try { await client.query('ROLLBACK'); } catch { /* Mantem o erro original. */ }
      throw error;
    } finally { client.release(); }
  }

  async deleteLot(lotId) {
    const client = await this.database.connect();
    try {
      await client.query('BEGIN');
      const selected = await client.query('SELECT id, status FROM auction_lots WHERE id=$1 FOR UPDATE', [lotId]);
      const lot = selected.rows[0];
      if (!lot) throw Object.assign(new Error('Lote nao encontrado.'), { statusCode: 404 });
      if (['CLOSED', 'CANCELLED'].includes(lot.status)) {
        throw Object.assign(new Error('Lotes encerrados ou cancelados nao podem ser removidos.'), { statusCode: 409 });
      }
      const bids = await client.query('SELECT 1 FROM bids WHERE lot_id=$1 LIMIT 1', [lotId]);
      const receipts = await client.query('SELECT 1 FROM receipts WHERE lot_id=$1 LIMIT 1', [lotId]);
      if (bids.rowCount || receipts.rowCount) {
        throw Object.assign(new Error('Lotes com lances ou recibos nao podem ser removidos.'), { statusCode: 409 });
      }
      await client.query('DELETE FROM auction_lots WHERE id=$1', [lotId]);
      await client.query('COMMIT');
      return { id: Number(lotId) };
    } catch (error) {
      try { await client.query('ROLLBACK'); } catch { /* Mantem o erro original. */ }
      throw error;
    } finally { client.release(); }
  }

  async listTransactions({ limit, offset }) {
    const [transactionsResult, countResult] = await Promise.all([
      this.database.query(
        `SELECT r.id, r.lot_id, l.title AS lot_title, r.winner_id,
                winner.name AS winner_name, winner.email AS winner_email,
                r.amount, r.share_code, r.created_at
         FROM receipts r
         JOIN auction_lots l ON l.id = r.lot_id
         JOIN users winner ON winner.id = r.winner_id
         ORDER BY r.created_at DESC, r.id DESC LIMIT $1 OFFSET $2`,
        [limit, offset],
      ),
      this.database.query('SELECT COUNT(*)::INT AS total FROM receipts'),
    ]);
    return { transactions: transactionsResult.rows, total: countResult.rows[0].total };
  }
}
