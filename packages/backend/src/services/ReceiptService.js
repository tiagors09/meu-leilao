import { randomUUID } from 'node:crypto';

export class ReceiptService {
  constructor({ receiptRepository }) {
    if (!receiptRepository) throw new Error('A dependencia de comprovantes e obrigatoria.');
    this.receiptRepository = receiptRepository;
  }

  async closeLot(lotId) {
    const parsedLotId = Number(lotId);
    if (!Number.isInteger(parsedLotId) || parsedLotId <= 0) {
      throw Object.assign(new Error('O identificador do lote e invalido.'), { statusCode: 400 });
    }
    return this.receiptRepository.closeLot(parsedLotId, randomUUID());
  }

  listMyReceipts(userId) {
    return this.receiptRepository.listByWinner(userId);
  }

  async getSharedReceipt(shareCode) {
    const receipt = await this.receiptRepository.findByShareCode(shareCode);
    if (!receipt) throw Object.assign(new Error('Comprovante nao encontrado.'), { statusCode: 404 });
    return receipt;
  }
}
