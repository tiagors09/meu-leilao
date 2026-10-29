export class AuditRepository {
  constructor(database) {
    if (!database) throw new Error('A dependencia de banco de dados e obrigatoria.');
    this.database = database;
  }

  async findLotBids(lotId) {
    const result = await this.database.query(
      `SELECT b.id, b.lot_id, b.bidder_id, b.amount, b.created_at,
              b.previous_hash, b.hash
       FROM bids b WHERE b.lot_id = $1 ORDER BY b.id ASC`,
      [lotId],
    );
    return result.rows;
  }
}
