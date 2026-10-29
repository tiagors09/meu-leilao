import { describe, expect, test, jest } from '@jest/globals';
import { BidService } from '../services/BidService.js';

const fixedNow = new Date('2026-10-29T12:00:00.000Z');
const createHarness = ({
  bidderId = 1,
  wallet = { user_id: 1, balance_total: '1000.00', balance_pledged: '0.00' },
  highestBid = null,
  lot = {
    id: 7,
    initial_price: '100.00',
    min_increment: '10.00',
    start_time: new Date(fixedNow.getTime() - 60_000),
    end_time: new Date(fixedNow.getTime() + 10 * 60_000),
    status: 'LIVE',
  },
} = {}) => {
  const updatePledgedBalance = jest.fn(async (_userId, delta) => {
    wallet.balance_pledged = (Number(wallet.balance_pledged) + Number(delta)).toFixed(2);
  });
  const createBid = jest.fn(async (bid) => ({ id: 20, ...bid, hash: 'b'.repeat(64) }));
  const getWalletsForUpdate = jest.fn(async (userIds) => new Map(userIds.map((userId) => [
    Number(userId), Number(userId) === Number(wallet.user_id)
      ? wallet
      : { user_id: Number(userId), balance_total: '1000.00', balance_pledged: String(highestBid?.amount || 0) },
  ])));
  const transaction = {
    lot,
    highestBid,
    latestBid: highestBid ? { hash: 'a'.repeat(64) } : null,
    getWalletsForUpdate,
    updatePledgedBalance,
    createBid,
    extendLotEndTime: jest.fn(async () => new Date(lot.end_time.getTime() + 120_000)),
  };
  const bidRepository = { withLotTransaction: jest.fn((_id, operation) => operation(transaction)) };
  return {
    service: new BidService({ bidRepository, clock: () => fixedNow }),
    bidRepository,
    getWalletsForUpdate,
    updatePledgedBalance,
    createBid,
    transaction,
    wallet,
  };
};

describe('BidService', () => {
  test('aceita lance valido e compromete o saldo do licitante', async () => {
    const harness = createHarness();
    const result = await harness.service.placeBid(7, 1, '100.00');

    expect(result.bid.amount).toBe('100.00');
    expect(harness.wallet.balance_pledged).toBe('100.00');
    expect(harness.updatePledgedBalance).toHaveBeenCalledWith(1, '100.00');
    expect(harness.createBid).toHaveBeenCalledWith(expect.objectContaining({
      bidderId: 1,
      previousHash: '0'.repeat(64),
      createdAt: fixedNow,
    }));
  });

  test('devolve a reserva do lider anterior e exige o incremento minimo', async () => {
    const previousWallet = { user_id: 2, balance_total: '1000.00', balance_pledged: '120.00' };
    const harness = createHarness({
      highestBid: { bidder_id: 2, amount: '120.00', hash: 'a'.repeat(64) },
    });
    harness.transaction.getWalletsForUpdate = jest.fn(async () => new Map([[1, harness.wallet], [2, previousWallet]]));

    await harness.service.placeBid(7, 1, '130.00');

    expect(harness.transaction.getWalletsForUpdate).toHaveBeenCalled();
    expect(harness.updatePledgedBalance).toHaveBeenNthCalledWith(1, 2, '-120.00');
    expect(harness.updatePledgedBalance).toHaveBeenNthCalledWith(2, 1, '130.00');
    expect(harness.createBid).toHaveBeenCalledWith(expect.objectContaining({ previousHash: 'a'.repeat(64) }));
  });

  test('rejeita valor abaixo do minimo sem alterar carteiras', async () => {
    const harness = createHarness({ highestBid: { bidder_id: 2, amount: '120.00', hash: 'a'.repeat(64) } });

    await expect(harness.service.placeBid(7, 1, '129.99')).rejects.toMatchObject({ statusCode: 400 });
    expect(harness.updatePledgedBalance).not.toHaveBeenCalled();
    expect(harness.createBid).not.toHaveBeenCalled();
  });

  test('impede que o lider atual cubra o proprio lance', async () => {
    const harness = createHarness({ highestBid: { bidder_id: 1, amount: '120.00', hash: 'a'.repeat(64) } });

    await expect(harness.service.placeBid(7, 1, '130.00')).rejects.toMatchObject({ statusCode: 409 });
    expect(harness.getWalletsForUpdate).not.toHaveBeenCalled();
    expect(harness.createBid).not.toHaveBeenCalled();
  });

  test('rejeita lance sem saldo disponivel suficiente', async () => {
    const harness = createHarness({ wallet: { user_id: 1, balance_total: '90.00', balance_pledged: '0.00' } });

    await expect(harness.service.placeBid(7, 1, '100.00')).rejects.toMatchObject({ statusCode: 409 });
    expect(harness.updatePledgedBalance).not.toHaveBeenCalled();
    expect(harness.createBid).not.toHaveBeenCalled();
  });
});
