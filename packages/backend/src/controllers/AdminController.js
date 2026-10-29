export class AdminController {
  constructor({ adminService }) {
    if (!adminService) throw new Error('A dependencia administrativa e obrigatoria.');
    this.adminService = adminService;
  }

  async getOverview(request, response, next) {
    try { response.status(200).json({ metrics: await this.adminService.getOverview() }); }
    catch (error) { next(error); }
  }

  async listUsers(request, response, next) {
    try { response.status(200).json(await this.adminService.listUsers(request.query)); }
    catch (error) { next(error); }
  }

  async updateUserRole(request, response, next) {
    try {
      const user = await this.adminService.updateUserRole(
        request.params.id,
        request.body?.role,
        request.user.id,
      );
      response.status(200).json({ user });
    } catch (error) { next(error); }
  }

  async listLots(request, response, next) {
    try { response.status(200).json(await this.adminService.listLots(request.query)); }
    catch (error) { next(error); }
  }

  async createLot(request, response, next) {
    try {
      const lot = await this.adminService.createLot(request.user.id, request.body);
      response.status(201).json({ lot });
    } catch (error) { next(error); }
  }

  async updateLot(request, response, next) {
    try {
      const lot = await this.adminService.updateLot(request.params.id, request.body);
      response.status(200).json({ lot });
    } catch (error) { next(error); }
  }

  async openLot(request, response, next) {
    try { response.status(200).json({ lot: await this.adminService.openLot(request.params.id) }); }
    catch (error) { next(error); }
  }

  async deleteLot(request, response, next) {
    try { response.status(200).json({ lot: await this.adminService.deleteLot(request.params.id) }); }
    catch (error) { next(error); }
  }

  async listTransactions(request, response, next) {
    try { response.status(200).json(await this.adminService.listTransactions(request.query)); }
    catch (error) { next(error); }
  }
}
