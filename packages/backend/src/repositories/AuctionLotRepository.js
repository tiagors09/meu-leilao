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
}
