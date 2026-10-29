import { createHash } from 'node:crypto';
import { describe, expect, test } from '@jest/globals';
import { AuditService } from '../services/AuditService.js';

const ZERO_HASH = '0'.repeat(64);
const timestamp = new Date('2026-10-29T12:00:00.000Z');

function createBid({ id, bidderId, amount, previousHash }) {
  const hash = createHash('sha256')
    .update(`8-${bidderId}-${Number(amount).toFixed(2)}-${timestamp.toISOString()}-${previousHash}`)
    .digest('hex');
  return {
    id, lot_id: 8, bidder_id: bidderId, amount: Number(amount).toFixed(2),
    created_at: timestamp, previous_hash: previousHash, hash,
  };
}

describe('AuditService', () => {
  test('valida hashes encadeados em ordem e anonimiza o licitante', async () => {
    const first = createBid({ id: 1, bidderId: 11, amount: 100, previousHash: ZERO_HASH });
    const second = createBid({ id: 2, bidderId: 12, amount: 110, previousHash: first.hash });
    const service = new AuditService({ auditRepository: { findLotBids: async () => [first, second] } });

    const result = await service.auditLot('8');

    expect(result).toMatchObject({ lot_id: 8, is_valid: true, is_tampered: false });
    expect(result.chain.map((bid) => bid.is_valid)).toEqual([true, true]);
    expect(result.chain[0].bidder).toBe('Licitante #11');
    expect(result.chain[0]).not.toHaveProperty('bidder_id');
  });

  test('detecta alteracao de valor e quebra do elo seguinte', async () => {
    const first = createBid({ id: 1, bidderId: 11, amount: 100, previousHash: ZERO_HASH });
    const second = createBid({ id: 2, bidderId: 12, amount: 110, previousHash: first.hash });
    const corruptedFirst = { ...first, amount: '101.00', hash: 'c'.repeat(64) };
    const service = new AuditService({ auditRepository: { findLotBids: async () => [corruptedFirst, second] } });

    const result = await service.auditLot(8);

    expect(result.is_valid).toBe(false);
    expect(result.is_tampered).toBe(true);
    expect(result.chain.map((bid) => bid.is_valid)).toEqual([false, false]);
  });

  test('rejeita identificador invalido antes de consultar o repositorio', async () => {
    const findLotBids = async () => { throw new Error('Nao deveria consultar'); };
    const service = new AuditService({ auditRepository: { findLotBids } });

    await expect(service.auditLot('abc')).rejects.toMatchObject({ statusCode: 400 });
  });
});
