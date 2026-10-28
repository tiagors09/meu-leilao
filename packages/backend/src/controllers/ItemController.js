export class ItemController {
  constructor({ itemService }) {
    if (!itemService) {
      throw new Error('A dependencia de itens e obrigatoria.');
    }

    this.itemService = itemService;
  }

  async search(request, response, next) {
    try {
      const result = await this.itemService.search(request.query.q);
      response.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}
