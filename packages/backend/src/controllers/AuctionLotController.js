export class AuctionLotController {
  constructor({ auctionLotService }) {
    if (!auctionLotService) {
      throw new Error('A dependencia de lotes e obrigatoria.');
    }

    this.auctionLotService = auctionLotService;
  }

  async create(request, response, next) {
    try {
      const lot = await this.auctionLotService.createLot(request.user.id, request.body ?? {});
      response.status(201).json(lot);
    } catch (error) {
      next(error);
    }
  }

  async list(request, response, next) {
    try {
      const lots = await this.auctionLotService.listLots(request.query.status);
      response.status(200).json({ lots });
    } catch (error) {
      next(error);
    }
  }
}
