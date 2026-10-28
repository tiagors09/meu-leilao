const ALLOWED_STATUSES = new Set(['SCHEDULED', 'LIVE', 'CLOSED', 'CANCELLED']);

export class AuctionLotService {
  constructor({ auctionLotRepository, itemRepository, clock = () => new Date() }) {
    if (!auctionLotRepository || !itemRepository) {
      throw new Error('As dependencias de lotes sao obrigatorias.');
    }

    this.auctionLotRepository = auctionLotRepository;
    this.itemRepository = itemRepository;
    this.clock = clock;
  }

  async createLot(sellerId, input = {}) {
    const {
      item_id: itemId,
      title,
      initial_price: initialPrice,
      min_increment: minIncrement,
      start_time: startTime,
      end_time: endTime,
    } = input;

    if (!Number.isInteger(Number(itemId)) || Number(itemId) <= 0) {
      throw this.createError('O identificador do item e invalido.', 400);
    }
    if (typeof title !== 'string' || !title.trim()) {
      throw this.createError('O titulo do lote e obrigatorio.', 400);
    }

    const parsedInitialPrice = this.parseAmount(initialPrice, 'O preco inicial');
    const parsedMinIncrement = this.parseAmount(minIncrement, 'O incremento minimo');
    if (parsedInitialPrice < 0 || parsedMinIncrement <= 0) {
      throw this.createError('Os valores do lote devem ser validos.', 400);
    }

    const parsedStartTime = this.parseDate(startTime, 'A data de inicio');
    const parsedEndTime = this.parseDate(endTime, 'A data de encerramento');
    const now = this.clock();
    if (parsedEndTime <= parsedStartTime || parsedEndTime <= now) {
      throw this.createError('O encerramento deve ocorrer depois do inicio e do horario atual.', 400);
    }

    const item = await this.itemRepository.findById(Number(itemId));
    if (!item) {
      throw this.createError('O item selecionado nao existe no cache local.', 404);
    }

    return this.auctionLotRepository.createLot({
      sellerId,
      itemId: Number(itemId),
      title: title.trim(),
      initialPrice: parsedInitialPrice.toFixed(2),
      minIncrement: parsedMinIncrement.toFixed(2),
      startTime: parsedStartTime,
      endTime: parsedEndTime,
      status: parsedStartTime > now ? 'SCHEDULED' : 'LIVE',
    });
  }

  async listLots(status) {
    if (status && !ALLOWED_STATUSES.has(status)) {
      throw this.createError('O filtro de status informado e invalido.', 400);
    }

    return this.auctionLotRepository.listLots(status ?? null);
  }

  parseAmount(value, label) {
    const amountText = typeof value === 'number' ? String(value) : value;
    if (typeof amountText !== 'string' || !/^\d+(?:\.\d{1,2})?$/.test(amountText.trim())) {
      throw this.createError(`${label} deve ter no maximo duas casas decimais.`, 400);
    }

    const amount = Number(amountText);
    if (!Number.isFinite(amount)) {
      throw this.createError(`${label} e invalido.`, 400);
    }

    return amount;
  }

  parseDate(value, label) {
    const parsedDate = new Date(value);
    if (typeof value !== 'string' || Number.isNaN(parsedDate.getTime())) {
      throw this.createError(`${label} e invalida.`, 400);
    }

    return parsedDate;
  }

  createError(message, statusCode) {
    return Object.assign(new Error(message), { statusCode });
  }
}
