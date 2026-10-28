export class UserRepository {
  constructor(database) {
    if (!database) {
      throw new Error('A dependencia de banco de dados e obrigatoria.');
    }

    this.database = database;
  }

  async findByEmail(email) {
    const result = await this.database.query(
      `SELECT id, name, email, password_hash, role, created_at
       FROM users
       WHERE email = $1`,
      [email],
    );

    return result.rows[0] ?? null;
  }

  async createUser({ name, email, passwordHash, role }) {
    const client = await this.database.connect();

    try {
      await client.query('BEGIN');

      const userResult = await client.query(
        `INSERT INTO users (name, email, password_hash, role)
         VALUES ($1, $2, $3, $4)
         RETURNING id, name, email, role, created_at`,
        [name, email, passwordHash, role],
      );
      const user = userResult.rows[0];

      await client.query('INSERT INTO wallets (user_id) VALUES ($1)', [user.id]);
      await client.query('COMMIT');

      return user;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
