import { createHash } from 'node:crypto';

export class BidRepository {
  constructor(database) {
    if (!database) {
      throw new Error('A dependencia de banco de dados e obrigatoria.');
    }

    this.database = database;
  }

  async withLotTransaction(lotId, operation) {
    const client = await this.database.connect();

    try {
      await client.query('BEGIN');

      const lotResult = await client.query(
        `SELECT id, initial_price, min_increment, start_time, end_time, status
         FROM auction_lots
         WHERE id = $1
         FOR UPDATE`,
        [lotId],
      );
      const lot = lotResult.rows[0] ?? null;
      const highestBidResult = lot
        ? await client.query(
          `SELECT id, bidder_id, amount, created_at, hash
           FROM bids
           WHERE lot_id = $1
           ORDER BY amount DESC, id DESC
           LIMIT 1`,
          [lotId],
        )
        : { rows: [] };
      const latestBidResult = lot
        ? await client.query(
          `SELECT hash FROM bids WHERE lot_id = $1 ORDER BY id DESC LIMIT 1`,
          [lotId],
        )
        : { rows: [] };

      const transaction = {
        lot,
        highestBid: highestBidResult.rows[0] ?? null,
        latestBid: latestBidResult.rows[0] ?? null,
        getWalletsForUpdate: async (userIds) => {
          const result = await client.query(
            `SELECT user_id, balance_total, balance_pledged
             FROM wallets
             WHERE user_id = ANY($1::INT[])
             ORDER BY user_id ASC
             FOR UPDATE`,
            [userIds],
          );

          return new Map(result.rows.map((wallet) => [Number(wallet.user_id), wallet]));
        },
        updatePledgedBalance: async (userId, amountDelta) => {
          const result = await client.query(
            `UPDATE wallets
             SET balance_pledged = balance_pledged + $2
             WHERE user_id = $1
             RETURNING user_id, balance_total, balance_pledged`,
            [userId, amountDelta],
          );

          return result.rows[0] ?? null;
        },
        createBid: async ({ bidderId, amount, createdAt, previousHash }) => {
          const hash = createHash('sha256')
            .update(`${lotId}-${bidderId}-${amount}-${createdAt.toISOString()}-${previousHash}`)
            .digest('hex');
          const result = await client.query(
            `INSERT INTO bids (lot_id, bidder_id, amount, created_at, previous_hash, hash)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING id, lot_id, bidder_id, amount, created_at, previous_hash, hash`,
            [lotId, bidderId, amount, createdAt, previousHash, hash],
          );

          return result.rows[0];
        },
        extendLotEndTime: async (milliseconds) => {
          const result = await client.query(
            `UPDATE auction_lots
             SET end_time = end_time + ($2::DOUBLE PRECISION * INTERVAL '1 millisecond')
             WHERE id = $1
             RETURNING end_time`,
            [lotId, milliseconds],
          );

          return result.rows[0]?.end_time ?? null;
        },
      };

      const result = await operation(transaction);
      await client.query('COMMIT');

      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
