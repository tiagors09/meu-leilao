import bcrypt from 'bcrypt';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { pool } from './config/db.js';

const SEED_LOCK_KEY = 'verzel-leilao-seed-v1';
const PASSWORD = '123456';
const SEED_ITEM = {
  externalId: 'verzel-seed-live-lot',
  title: 'Relogio classico de colecao',
  imageUrl: 'https://dummyjson.com/image/400x300/ddd6fe/111111?text=Verzel+Leiloes',
  rawPayload: { source: 'verzel-seed', condition: 'Muito bom', category: 'colecionaveis' },
};
const SEED_LOT_TITLE = 'Relogio classico de colecao - lote demonstrativo';

async function upsertUser(client, { name, email, passwordHash, role, initialBalance = '0.00' }) {
  const result = await client.query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (email) DO UPDATE SET
       name = EXCLUDED.name,
       password_hash = EXCLUDED.password_hash,
       role = EXCLUDED.role
     RETURNING id`,
    [name, email, passwordHash, role],
  );
  const userId = result.rows[0].id;
  await client.query(
    `INSERT INTO wallets (user_id, balance_total, balance_pledged)
     VALUES ($1, $2, 0)
     ON CONFLICT (user_id) DO NOTHING`,
    [userId, initialBalance],
  );
  return userId;
}

export async function seedDatabase(database = pool) {
  const passwordHash = await bcrypt.hash(PASSWORD, 12);
  const client = await database.connect();

  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [SEED_LOCK_KEY]);
    const schema = await readFile(new URL('./config/init.sql', import.meta.url), 'utf8');
    await client.query(schema);

    const sellerId = await upsertUser(client, {
      name: 'Leiloeiro Verzel', email: 'leiloeiro@verzel.com', passwordHash, role: 'LEILOEIRO',
    });
    const firstBidderId = await upsertUser(client, {
      name: 'Cliente Verzel 1', email: 'cliente1@verzel.com', passwordHash, role: 'LICITANTE', initialBalance: '5000.00',
    });
    const secondBidderId = await upsertUser(client, {
      name: 'Cliente Verzel 2', email: 'cliente2@verzel.com', passwordHash, role: 'LICITANTE', initialBalance: '5000.00',
    });

    const itemResult = await client.query(
      `INSERT INTO items (id_externo, title, image_url, raw_payload)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (id_externo) DO UPDATE SET
         title = EXCLUDED.title,
         image_url = EXCLUDED.image_url,
         raw_payload = EXCLUDED.raw_payload
       RETURNING id`,
      [SEED_ITEM.externalId, SEED_ITEM.title, SEED_ITEM.imageUrl, SEED_ITEM.rawPayload],
    );
    const itemId = itemResult.rows[0].id;
    const existingLot = await client.query(
      `SELECT id FROM auction_lots
       WHERE seller_id = $1 AND item_id = $2 AND title = $3
       ORDER BY id ASC LIMIT 1`,
      [sellerId, itemId, SEED_LOT_TITLE],
    );
    let lotId = existingLot.rows[0]?.id;

    if (!lotId) {
      const now = new Date();
      const startTime = new Date(now.getTime() - 60_000);
      const endTime = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const lotResult = await client.query(
        `INSERT INTO auction_lots (
           seller_id, item_id, title, initial_price, min_increment,
           start_time, end_time, status
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'LIVE')
         RETURNING id`,
        [sellerId, itemId, SEED_LOT_TITLE, '100.00', '10.00', startTime, endTime],
      );
      lotId = lotResult.rows[0].id;
    }

    await client.query('COMMIT');
    return { sellerId, bidderIds: [firstBidderId, secondBidderId], itemId, lotId };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    await seedDatabase();
    console.log('Seeds Verzel aplicadas com sucesso.');
  } catch (error) {
    console.error('Falha ao aplicar seeds Verzel:', error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}
