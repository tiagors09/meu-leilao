export class WalletRepository {
  constructor(database) {
    if (!database) {
      throw new Error('A dependencia de banco de dados e obrigatoria.');
    }

    this.database = database;
  }

  async findByUserId(userId) {
    const result = await this.database.query(
      `SELECT user_id, balance_total, balance_pledged
       FROM wallets
       WHERE user_id = $1`,
      [userId],
    );

    return result.rows[0] ?? null;
  }

  async increaseBalance(userId, amount) {
    const result = await this.database.query(
      `UPDATE wallets
       SET balance_total = balance_total + $2
       WHERE user_id = $1
       RETURNING user_id, balance_total, balance_pledged`,
      [userId, amount],
    );

    return result.rows[0] ?? null;
  }
}
