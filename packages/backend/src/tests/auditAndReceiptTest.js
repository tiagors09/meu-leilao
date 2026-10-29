import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { AuditService } from '../services/AuditService.js';
import { ReceiptService } from '../services/ReceiptService.js';

const ZERO_HASH = '0'.repeat(64);
const createdAt = new Date('2026-10-29T12:00:00.000Z');
const createBid = (previousHash, amount = '25.00') => ({
  id: 1,
  lot_id: 8,
  bidder_id: 13,
  amount,
  created_at: createdAt,
  previous_hash: previousHash,
  hash: createHash('sha256')
    .update(`8-13-${amount}-${createdAt.toISOString()}-${previousHash}`)
    .digest('hex'),
});

test('audita cadeia integra e nao expoe dados pessoais', async () => {
  const bid = createBid(ZERO_HASH);
  const service = new AuditService({ auditRepository: { findLotBids: async () => [bid] } });
  const result = await service.auditLot('8');

  assert.equal(result.is_valid, true);
  assert.equal(result.is_tampered, false);
  assert.equal(result.chain[0].bidder, 'Licitante #13');
  assert.equal('bidder_id' in result.chain[0], false);
});

test('identifica adulteracao no lance e no encadeamento', async () => {
  const bid = { ...createBid(ZERO_HASH), amount: '26.00' };
  const service = new AuditService({ auditRepository: { findLotBids: async () => [bid] } });
  const result = await service.auditLot(8);

  assert.equal(result.is_valid, false);
  assert.equal(result.is_tampered, true);
  assert.equal(result.chain[0].is_valid, false);
});

test('gera comprovante ao encerrar lote e lista comprovantes do vencedor', async () => {
  const expectedReceipt = { lot_id: 8, share_code: 'codigo' };
  const service = new ReceiptService({
    receiptRepository: {
      closeLot: async (lotId, code) => ({ lot: { id: lotId }, receipt: { ...expectedReceipt, share_code: code } }),
      listByWinner: async (userId) => [{ winner_id: userId }],
    },
  });
  const closed = await service.closeLot('8');

  assert.equal(closed.lot.id, 8);
  assert.match(closed.receipt.share_code, /^[0-9a-f-]{36}$/);
  assert.deepEqual(await service.listMyReceipts(13), [{ winner_id: 13 }]);
});
