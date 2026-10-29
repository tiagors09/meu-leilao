const ALLOWED_ROLES = new Set(['ADMIN', 'LEILOEIRO', 'LICITANTE']);
const MAX_PAGE_SIZE = 100;
const MAX_PAGE_NUMBER = 10_000;

export class AdminService {
  constructor({ adminRepository, auctionLotService }) {
    if (!adminRepository) throw new Error('A dependencia administrativa e obrigatoria.');
    this.adminRepository = adminRepository;
    this.auctionLotService = auctionLotService;
  }

  getOverview() {
    return this.adminRepository.getOverview();
  }

  async listUsers({ search = '', page = '1', pageSize = '25' } = {}) {
    return this.adminRepository.listUsers(this.buildPagination(search, page, pageSize));
  }

  async updateUserRole(userId, role, actorId) {
    const parsedId = Number(userId);
    if (!Number.isInteger(parsedId) || parsedId <= 0) {
      throw this.createError('O identificador do usuario e invalido.', 400);
    }
    if (!ALLOWED_ROLES.has(role)) {
      throw this.createError('O papel informado e invalido.', 400);
    }
    if (parsedId === Number(actorId)) {
      throw this.createError('Nao e permitido alterar o proprio papel.', 409);
    }
    return this.adminRepository.updateUserRole(parsedId, role);
  }

  async listLots({ search = '', page = '1', pageSize = '25' } = {}) {
    return this.adminRepository.listLots(this.buildPagination(search, page, pageSize));
  }

  createLot(actorId, input) {
    return this.auctionLotService.createLot(actorId, input);
  }

  updateLot(lotId, input) {
    return this.auctionLotService.updateLot(lotId, input);
  }

  async openLot(lotId) {
    return this.adminRepository.openLot(this.parseLotId(lotId));
  }

  async deleteLot(lotId) {
    return this.adminRepository.deleteLot(this.parseLotId(lotId));
  }

  parseLotId(lotId) {
    const parsedId = Number(lotId);
    if (!Number.isInteger(parsedId) || parsedId <= 0) {
      throw this.createError('O identificador do lote e invalido.', 400);
    }
    return parsedId;
  }

  async listTransactions({ page = '1', pageSize = '25' } = {}) {
    return this.adminRepository.listTransactions(this.buildPagination('', page, pageSize));
  }

  buildPagination(search, page, pageSize) {
    if (typeof search !== 'string' || search.length > 120) {
      throw this.createError('O filtro de busca e invalido.', 400);
    }
    const parsedPage = Number(page);
    const parsedPageSize = Number(pageSize);
    if (!Number.isSafeInteger(parsedPage) || parsedPage < 1 || parsedPage > MAX_PAGE_NUMBER
      || !Number.isInteger(parsedPageSize) || parsedPageSize < 1 || parsedPageSize > MAX_PAGE_SIZE) {
      throw this.createError('A paginacao informada e invalida.', 400);
    }
    return {
      search: search.trim(),
      limit: parsedPageSize,
      offset: (parsedPage - 1) * parsedPageSize,
    };
  }

  createError(message, statusCode) {
    return Object.assign(new Error(message), { statusCode });
  }
}
