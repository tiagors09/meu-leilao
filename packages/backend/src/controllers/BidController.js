export class BidController {
  constructor({ bidService }) {
    if (!bidService) {
      throw new Error('A dependencia de lances e obrigatoria.');
    }

    this.bidService = bidService;
  }

  async place(request, response, next) {
    try {
      const result = await this.bidService.placeBid(
        request.params.id,
        request.user.id,
        request.body?.amount,
      );
      response.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
}
