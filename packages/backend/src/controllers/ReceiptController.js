export class ReceiptController {
  constructor({ receiptService }) {
    if (!receiptService) throw new Error('A dependencia de comprovantes e obrigatoria.');
    this.receiptService = receiptService;
  }

  async closeLot(request, response, next) {
    try { response.status(200).json(await this.receiptService.closeLot(request.params.id)); }
    catch (error) { next(error); }
  }

  async listMine(request, response, next) {
    try { response.status(200).json({ receipts: await this.receiptService.listMyReceipts(request.user.id) }); }
    catch (error) { next(error); }
  }

  async getShared(request, response, next) {
    try { response.status(200).json(await this.receiptService.getSharedReceipt(request.params.shareCode)); }
    catch (error) { next(error); }
  }
}
