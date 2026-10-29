import { createHash } from 'node:crypto';

const ZERO_HASH = '0'.repeat(64);

export class AuditService {
  constructor({ auditRepository }) {
    if (!auditRepository) throw new Error('A dependencia de auditoria e obrigatoria.');
    this.auditRepository = auditRepository;
  }

  async auditLot(lotId) {
    const parsedLotId = Number(lotId);
    if (!Number.isInteger(parsedLotId) || parsedLotId <= 0) {
      throw Object.assign(new Error('O identificador do lote e invalido.'), { statusCode: 400 });
    }

    const bids = await this.auditRepository.findLotBids(parsedLotId);
    let expectedPreviousHash = ZERO_HASH;
    let isValid = true;
    const chain = bids.map((bid) => {
      const createdAt = new Date(bid.created_at).toISOString();
      const amount = Number(bid.amount).toFixed(2);
      const expectedHash = createHash('sha256')
        .update(`${bid.lot_id}-${bid.bidder_id}-${amount}-${createdAt}-${expectedPreviousHash}`)
        .digest('hex');
      const bidIsValid = bid.previous_hash === expectedPreviousHash && bid.hash === expectedHash;
      if (!bidIsValid) isValid = false;
      expectedPreviousHash = bid.hash;
      return {
        id: Number(bid.id),
        amount: Number(amount),
        created_at: createdAt,
        bidder: `Licitante #${bid.bidder_id}`,
        previous_hash: bid.previous_hash,
        hash: bid.hash,
        is_valid: bidIsValid,
      };
    });

    return { lot_id: parsedLotId, is_valid: isValid, is_tampered: !isValid, chain };
  }
}
