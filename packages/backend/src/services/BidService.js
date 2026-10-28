const ANTI_SNIPING_WINDOW_MS = 2 * 60 * 1000;
const ANTI_SNIPING_EXTENSION_MS = 2 * 60 * 1000;
const MAX_AMOUNT_CENTS = 999999999999;
const ZERO_HASH = '0'.repeat(64);

export class BidService {
  constructor({ bidRepository, clock = () => new Date() }) {
    if (!bidRepository) {
      throw new Error('A dependencia de lances e obrigatoria.');
    }

    this.bidRepository = bidRepository;
    this.clock = clock;
  }

  async placeBid(lotId, bidderId, amount) {
    const parsedLotId = Number(lotId);
    const parsedBidderId = Number(bidderId);
    if (!Number.isInteger(parsedLotId) || parsedLotId <= 0) {
      throw this.createError('O identificador do lote e invalido.', 400);
    }
    if (!Number.isInteger(parsedBidderId) || parsedBidderId <= 0) {
      throw this.createError('O identificador do licitante e invalido.', 401);
    }

    const amountCents = this.parseAmount(amount);
    const amountText = (amountCents / 100).toFixed(2);

    return this.bidRepository.withLotTransaction(parsedLotId, async (transaction) => {
      const { lot, highestBid } = transaction;
      if (!lot) {
        throw this.createError('Lote nao encontrado.', 404);
      }

      const now = this.clock();
      const startTime = new Date(lot.start_time);
      const endTime = new Date(lot.end_time);
      if (lot.status !== 'LIVE' || now < startTime || now >= endTime) {
        throw this.createError('O lote nao esta recebendo lances.', 409);
      }
      if (highestBid && Number(highestBid.bidder_id) === parsedBidderId) {
        throw this.createError('O lider atual nao pode cobrir o proprio lance.', 409);
      }

      const minimumCents = highestBid
        ? this.toCents(highestBid.amount) + this.toCents(lot.min_increment)
        : this.toCents(lot.initial_price);
      if (amountCents < minimumCents) {
        throw this.createError(
          `O lance minimo permitido e ${(minimumCents / 100).toFixed(2)}.`,
          400,
        );
      }

      const userIds = highestBid
        ? [parsedBidderId, Number(highestBid.bidder_id)]
        : [parsedBidderId];
      const wallets = await transaction.getWalletsForUpdate([...new Set(userIds)].sort((a, b) => a - b));
      const bidderWallet = wallets.get(parsedBidderId);
      if (!bidderWallet) {
        throw this.createError('Carteira do licitante nao encontrada.', 404);
      }

      const availableCents = this.toCents(bidderWallet.balance_total)
        - this.toCents(bidderWallet.balance_pledged);
      if (availableCents < amountCents) {
        throw this.createError('Saldo disponivel insuficiente para este lance.', 409);
      }

      if (highestBid) {
        const previousWallet = wallets.get(Number(highestBid.bidder_id));
        if (!previousWallet) {
          throw this.createError('Carteira do lider atual nao encontrada.', 409);
        }

        const releasedAmount = (-this.toCents(highestBid.amount) / 100).toFixed(2);
        await transaction.updatePledgedBalance(highestBid.bidder_id, releasedAmount);
      }
      await transaction.updatePledgedBalance(parsedBidderId, amountText);

      const bid = await transaction.createBid({
        bidderId: parsedBidderId,
        amount: amountText,
        createdAt: now,
        previousHash: highestBid?.hash ?? ZERO_HASH,
      });

      const remainingMs = endTime.getTime() - now.getTime();
      const extendedEndTime = remainingMs < ANTI_SNIPING_WINDOW_MS
        ? await transaction.extendLotEndTime(ANTI_SNIPING_EXTENSION_MS)
        : lot.end_time;

      return { bid, end_time: extendedEndTime };
    });
  }

  parseAmount(value) {
    const amountText = typeof value === 'number' ? String(value) : value;
    if (typeof amountText !== 'string' || !/^\d+(?:\.\d{1,2})?$/.test(amountText.trim())) {
      throw this.createError('O valor do lance deve ser maior que zero e ter no maximo duas casas decimais.', 400);
    }

    const amountCents = this.toCents(amountText);
    if (amountCents <= 0 || amountCents > MAX_AMOUNT_CENTS) {
      throw this.createError('O valor do lance esta fora do intervalo permitido.', 400);
    }

    return amountCents;
  }

  toCents(value) {
    const normalized = String(value).trim();
    if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) {
      throw this.createError('Foi encontrado um valor monetario invalido.', 409);
    }

    const [whole, fraction = ''] = normalized.split('.');
    return Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
  }

  createError(message, statusCode) {
    return Object.assign(new Error(message), { statusCode });
  }
}
