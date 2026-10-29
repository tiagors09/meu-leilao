export class AuditController {
  constructor({ auditService }) {
    if (!auditService) throw new Error('A dependencia de auditoria e obrigatoria.');
    this.auditService = auditService;
  }

  async auditLot(request, response, next) {
    try {
      response.status(200).json(await this.auditService.auditLot(request.params.id));
    } catch (error) { next(error); }
  }
}
