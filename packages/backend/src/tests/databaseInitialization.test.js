import { describe, expect, jest, test } from '@jest/globals';
import { initializeDatabase } from '../config/db.js';

function createDatabase({ failOnSchema = false } = {}) {
  const client = {
    query: jest.fn(async (sql) => {
      if (failOnSchema && sql.includes('CREATE TABLE IF NOT EXISTS users')) {
        throw new Error('falha de schema simulada');
      }
      return { rows: [] };
    }),
    release: jest.fn(),
  };

  return {
    connect: jest.fn(async () => client),
    client,
  };
}

describe('inicializacao do banco de dados', () => {
  test('cria o schema de forma transacional antes de liberar a conexao', async () => {
    const database = createDatabase();

    await initializeDatabase(database);

    const statements = database.client.query.mock.calls.map(([sql]) => sql);
    expect(statements[0]).toBe('BEGIN');
    expect(statements[1]).toContain('pg_advisory_xact_lock');
    expect(statements[2]).toContain('CREATE TABLE IF NOT EXISTS auction_lots');
    expect(statements.at(-1)).toBe('COMMIT');
    expect(database.client.release).toHaveBeenCalledTimes(1);
  });

  test('faz rollback e libera a conexao quando a criacao do schema falha', async () => {
    const database = createDatabase({ failOnSchema: true });

    await expect(initializeDatabase(database)).rejects.toThrow('falha de schema simulada');

    expect(database.client.query).toHaveBeenLastCalledWith('ROLLBACK');
    expect(database.client.release).toHaveBeenCalledTimes(1);
  });
});
