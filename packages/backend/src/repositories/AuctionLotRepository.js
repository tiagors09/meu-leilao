export class AuctionLotRepository {
  constructor(database) {
    if (!database) {
      throw new Error('A dependencia de banco de dados e obrigatoria.');
    }

    this.database = database;
  }

  async createLot({
    sellerId,
    itemId,
    title,
    initialPrice,
    minIncrement,
    startTime,
    endTime,
    status,
  }) {
    const result = await this.database.query(
      `INSERT INTO auction_lots (
         seller_id, item_id, title, initial_price, min_increment,
         start_time, end_time, status
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, seller_id, item_id, title, initial_price,
         min_increment, start_time, end_time, status, created_at`,
      [sellerId, itemId, title, initialPrice, minIncrement, startTime, endTime, status],
    );

    return result.rows[0];
  }

  async listLots(status) {
    const result = await this.database.query(
      `SELECT id, seller_id, item_id, title, initial_price, min_increment,
         start_time, end_time, status, created_at
       FROM auction_lots
       WHERE ($1::VARCHAR IS NULL OR status = $1)
       ORDER BY start_time ASC, id ASC`,
      [status ?? null],
    );

    return result.rows;
  }

  async findLotById(lotId) {
    const result = await this.database.query(
      `SELECT l.id, l.seller_id, l.item_id, l.title, l.initial_price,
              l.min_increment, l.start_time, l.end_time, l.status,
              l.winner_id, l.created_at, i.image_url,
              b.id AS current_bid_id, b.bidder_id AS current_bidder_id,
              b.amount AS current_bid_amount, b.created_at AS current_bid_created_at
       FROM auction_lots l
       LEFT JOIN items i ON i.id = l.item_id
       LEFT JOIN LATERAL (
         SELECT id, bidder_id, amount, created_at FROM bids
         WHERE lot_id = l.id ORDER BY amount DESC, id DESC LIMIT 1
       ) b ON TRUE
       WHERE l.id = $1`,
      [lotId],
    );
    const lot = result.rows[0];
    if (!lot) return null;
    return {
      ...lot,
      current_bid: lot.current_bid_id ? {
        id: lot.current_bid_id,
        bidder_id: lot.current_bidder_id,
        amount: lot.current_bid_amount,
        created_at: lot.current_bid_created_at,
      } : null,
    };
  }
}
