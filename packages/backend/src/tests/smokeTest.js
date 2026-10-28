import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { pool } from '../config/db.js';
import { UserRepository } from '../repositories/UserRepository.js';
import { WalletRepository } from '../repositories/WalletRepository.js';

const userRepository = new UserRepository(pool);
const walletRepository = new WalletRepository(pool);
let createdUserId;

try {
  await pool.query('SELECT 1');

  const user = await userRepository.createUser({
    name: 'Usuario de integracao',
    email: `smoke-${randomUUID()}@example.test`,
    passwordHash: 'hash-de-teste',
    role: 'LICITANTE',
  });
  createdUserId = user.id;

  const wallet = await walletRepository.findByUserId(user.id);
  assert.ok(wallet, 'A carteira do usuario deve ser criada junto com a conta.');
  assert.equal(Number(wallet.balance_total), 0);
  assert.equal(Number(wallet.balance_pledged), 0);

  console.log('Smoke test aprovado: conexao, usuario e carteira funcionaram.');
} catch (error) {
  console.error('Smoke test falhou. Verifique a conexao e a estrutura do banco.');
  process.exitCode = 1;
} finally {
  if (createdUserId) {
    try {
      await pool.query('DELETE FROM users WHERE id = $1', [createdUserId]);
    } catch (error) {
      console.error('Nao foi possivel remover o usuario temporario de integracao.');
      process.exitCode = 1;
    }
  }

  await pool.end();
}
