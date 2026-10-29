import pkg from 'pg';
import dotenv from 'dotenv';
import { readFile } from 'node:fs/promises';

dotenv.config();

const { Pool } = pkg;

// Pool compartilhado para os pontos de composicao da aplicacao.
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 5000,
});

const SCHEMA_LOCK_KEY = 'verzel-leilao-schema-initialization';

export async function initializeDatabase(database = pool) {
  const schema = await readFile(new URL('./init.sql', import.meta.url), 'utf8');
  const client = await database.connect();

  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [SCHEMA_LOCK_KEY]);
    await client.query(schema);
    await client.query('COMMIT');
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch {
      // Preserva o erro original que causou a falha na inicializacao.
    }
    throw error;
  } finally {
    client.release();
  }
}

pool.on('connect', () => {
  console.log('Conexao com o banco de dados PostgreSQL estabelecida.');
});

pool.on('error', (error) => {
  console.error('Erro inesperado em uma conexao inativa do PostgreSQL:', error);
});
