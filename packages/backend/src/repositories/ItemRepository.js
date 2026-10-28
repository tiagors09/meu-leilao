export class ItemRepository {
  constructor(database) {
    if (!database) {
      throw new Error('A dependencia de banco de dados e obrigatoria.');
    }

    this.database = database;
  }

  async findById(id) {
    const result = await this.database.query(
      `SELECT id, id_externo, title, image_url, raw_payload, created_at
       FROM items
       WHERE id = $1`,
      [id],
    );

    return result.rows[0] ?? null;
  }

  async upsertMany(items) {
    const savedItems = [];

    for (const item of items) {
      const result = await this.database.query(
        `INSERT INTO items (id_externo, title, image_url, raw_payload)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (id_externo) DO UPDATE SET
           title = EXCLUDED.title,
           image_url = EXCLUDED.image_url,
           raw_payload = EXCLUDED.raw_payload
         RETURNING id, id_externo, title, image_url, raw_payload, created_at`,
        [item.externalId, item.title, item.imageUrl, item.rawPayload],
      );
      savedItems.push(result.rows[0]);
    }

    return savedItems;
  }

  async searchCached(query, limit = 20) {
    const result = await this.database.query(
      `SELECT id, id_externo, title, image_url, raw_payload, created_at
       FROM items
       WHERE title ILIKE '%' || $1 || '%'
       ORDER BY title ASC
       LIMIT $2`,
      [query, limit],
    );

    return result.rows;
  }
}
