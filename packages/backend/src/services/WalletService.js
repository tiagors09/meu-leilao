export class WalletService {
  constructor({ walletRepository }) {
    if (!walletRepository) {
      throw new Error('A dependencia de carteira e obrigatoria.');
    }

    this.walletRepository = walletRepository;
  }

  async getBalance(userId) {
    const wallet = await this.walletRepository.findByUserId(userId);

    if (!wallet) {
      throw this.createError('Carteira nao encontrada.', 404);
    }

    const balanceTotal = Number(wallet.balance_total);
    const balancePledged = Number(wallet.balance_pledged);

    return {
      balance_total: balanceTotal,
      balance_pledged: balancePledged,
      balance_available: Number((balanceTotal - balancePledged).toFixed(2)),
    };
  }

  async deposit(userId, amount) {
    const amountText = typeof amount === 'number'
      ? String(amount)
      : typeof amount === 'string'
        ? amount.trim()
        : null;
    if (typeof amountText !== 'string' || !/^\d+(?:\.\d{1,2})?$/.test(amountText)) {
      throw this.createError('Informe um valor valido com no maximo duas casas decimais.', 400);
    }

    const numericAmount = Number(amountText);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      throw this.createError('O valor do deposito deve ser maior que zero.', 400);
    }

    const wallet = await this.walletRepository.increaseBalance(
      userId,
      numericAmount.toFixed(2),
    );
    if (!wallet) {
      throw this.createError('Carteira nao encontrada.', 404);
    }

    return this.getBalance(userId);
  }

  createError(message, statusCode) {
    return Object.assign(new Error(message), { statusCode });
  }
}
