export class ReceiptRepository {
  constructor(database) {
    if (!database) throw new Error('A dependencia de banco de dados e obrigatoria.');
    this.database = database;
  }

  async closeLot(lotId, shareCode) {
    const client = await this.database.connect();
    try {
      await client.query('BEGIN');
      const lotResult = await client.query(
        `SELECT id, seller_id, status FROM auction_lots WHERE id = $1 FOR UPDATE`, [lotId],
      );
      const lot = lotResult.rows[0];
      if (!lot) throw Object.assign(new Error('Lote nao encontrado.'), { statusCode: 404 });
      if (lot.status === 'CLOSED') {
        const receiptResult = await client.query('SELECT * FROM receipts WHERE lot_id = $1', [lotId]);
        await client.query('COMMIT');
        return { lot, receipt: receiptResult.rows[0] ?? null };
      }
      if (lot.status === 'CANCELLED') {
        throw Object.assign(new Error('Lotes cancelados nao podem ser encerrados.'), { statusCode: 409 });
      }

      const bidResult = await client.query(
        `SELECT bidder_id, amount FROM bids WHERE lot_id = $1 ORDER BY amount DESC, id DESC LIMIT 1`,
        [lotId],
      );
      const winnerBid = bidResult.rows[0] ?? null;
      if (winnerBid) {
        const walletIds = [...new Set([Number(winnerBid.bidder_id), Number(lot.seller_id)])].sort((a, b) => a - b);
        await client.query(
          'SELECT user_id FROM wallets WHERE user_id = ANY($1::INT[]) ORDER BY user_id FOR UPDATE',
          [walletIds],
        );
        const debitResult = await client.query(
          `UPDATE wallets SET balance_total = balance_total - $2,
                              balance_pledged = balance_pledged - $2
           WHERE user_id = $1 AND balance_total >= $2 AND balance_pledged >= $2 RETURNING user_id`,
          [winnerBid.bidder_id, winnerBid.amount],
        );
        if (!debitResult.rowCount) {
          throw Object.assign(new Error('O saldo comprometido do vencedor esta inconsistente.'), { statusCode: 409 });
        }
        await client.query('UPDATE wallets SET balance_total = balance_total + $2 WHERE user_id = $1',
          [lot.seller_id, winnerBid.amount]);
      }

      const updatedLot = await client.query(
        `UPDATE auction_lots SET status = 'CLOSED', winner_id = $2 WHERE id = $1
         RETURNING id, seller_id, winner_id, status`,
        [lotId, winnerBid?.bidder_id ?? null],
      );
      let receipt = null;
      if (winnerBid) {
        const receiptResult = await client.query(
          `INSERT INTO receipts (lot_id, winner_id, amount, share_code)
           VALUES ($1, $2, $3, $4)
           RETURNING id, lot_id, winner_id, amount, share_code, created_at`,
          [lotId, winnerBid.bidder_id, winnerBid.amount, shareCode],
        );
        receipt = receiptResult.rows[0];
      }
      await client.query('COMMIT');
      return { lot: updatedLot.rows[0], receipt };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async listByWinner(winnerId) {
    const result = await this.database.query(
      `SELECT r.id, r.lot_id, l.title AS lot_title, r.winner_id, r.amount,
              r.share_code, r.created_at
       FROM receipts r JOIN auction_lots l ON l.id = r.lot_id
       WHERE r.winner_id = $1 ORDER BY r.created_at DESC, r.id DESC`,
      [winnerId],
    );
    return result.rows;
  }

  async findByShareCode(shareCode) {
    const result = await this.database.query(
      `SELECT r.id, r.lot_id, l.title AS lot_title, r.winner_id, r.amount,
              r.share_code, r.created_at
       FROM receipts r JOIN auction_lots l ON l.id = r.lot_id WHERE r.share_code = $1`,
      [shareCode],
    );
    return result.rows[0] ?? null;
  }
}
