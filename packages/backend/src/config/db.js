import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

// Pool compartilhado para os pontos de composicao da aplicacao.
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 5000,
});

pool.on('connect', () => {
  console.log('Conexao com o banco de dados PostgreSQL estabelecida.');
});

pool.on('error', (error) => {
  console.error('Erro inesperado em uma conexao inativa do PostgreSQL:', error);
});
