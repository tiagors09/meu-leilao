export class WalletController {
  constructor({ walletService }) {
    if (!walletService) {
      throw new Error('A dependencia de carteira e obrigatoria.');
    }

    this.walletService = walletService;
  }

  async getBalance(request, response, next) {
    try {
      const balance = await this.walletService.getBalance(request.user.id);
      response.status(200).json(balance);
    } catch (error) {
      next(error);
    }
  }

  async deposit(request, response, next) {
    try {
      const balance = await this.walletService.deposit(
        request.user.id,
        request.body.amount,
      );
      response.status(200).json(balance);
    } catch (error) {
      next(error);
    }
  }
}
