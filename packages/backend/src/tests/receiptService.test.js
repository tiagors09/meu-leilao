import { describe, expect, test } from '@jest/globals';
import { ReceiptService } from '../services/ReceiptService.js';

describe('ReceiptService', () => {
  test('fecha lote com codigo compartilhavel e consulta recibos do usuario', async () => {
    const repository = {
      closeLot: async (lotId, shareCode) => ({ lot: { id: lotId }, receipt: { lot_id: lotId, share_code: shareCode } }),
      listByWinner: async (winnerId) => [{ winner_id: winnerId }],
    };
    const service = new ReceiptService({ receiptRepository: repository });
    const result = await service.closeLot('8');

    expect(result.lot.id).toBe(8);
    expect(result.receipt.share_code).toMatch(/^[0-9a-f-]{36}$/);
    await expect(service.listMyReceipts(13)).resolves.toEqual([{ winner_id: 13 }]);
  });

  test('retorna erro quando recibo compartilhado nao existe', async () => {
    const service = new ReceiptService({ receiptRepository: { findByShareCode: async () => null } });
    await expect(service.getSharedReceipt('invalido')).rejects.toMatchObject({ statusCode: 404 });
  });
});
