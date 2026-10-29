import { describe, expect, jest, test } from '@jest/globals';
import { AdminService } from '../services/AdminService.js';

describe('AdminService', () => {
  test('aplica paginacao validada nas consultas globais', async () => {
    const adminRepository = {
      listUsers: jest.fn().mockResolvedValue({ users: [], total: 0 }),
      listLots: jest.fn().mockResolvedValue({ lots: [], total: 0 }),
      listTransactions: jest.fn().mockResolvedValue({ transactions: [], total: 0 }),
    };
    const service = new AdminService({ adminRepository });

    await service.listUsers({ search: ' ana ', page: '2', pageSize: '10' });
    expect(adminRepository.listUsers).toHaveBeenCalledWith({ search: 'ana', limit: 10, offset: 10 });
    await expect(service.listLots({ page: '0' })).rejects.toMatchObject({ statusCode: 400 });
    await expect(service.listTransactions({ pageSize: '101' })).rejects.toMatchObject({ statusCode: 400 });
  });

  test('valida papel e impede que o admin remova o proprio acesso', async () => {
    const adminRepository = { updateUserRole: jest.fn() };
    const service = new AdminService({ adminRepository });

    await expect(service.updateUserRole('2', 'ROOT', 1)).rejects.toMatchObject({ statusCode: 400 });
    await expect(service.updateUserRole('1', 'LEILOEIRO', 1)).rejects.toMatchObject({ statusCode: 409 });
    expect(adminRepository.updateUserRole).not.toHaveBeenCalled();
  });

  test('encaminha criacao e edicao para o servico de lotes e ações de ciclo ao repositorio', async () => {
    const adminRepository = { openLot: jest.fn().mockResolvedValue({ id: 4 }), deleteLot: jest.fn().mockResolvedValue({ id: 4 }) };
    const auctionLotService = { createLot: jest.fn(), updateLot: jest.fn() };
    const service = new AdminService({ adminRepository, auctionLotService });
    await service.createLot(1, { title: 'Lote' });
    await service.updateLot('4', { title: 'Atualizado' });
    await service.openLot('4');
    await service.deleteLot('4');
    expect(auctionLotService.createLot).toHaveBeenCalledWith(1, { title: 'Lote' });
    expect(auctionLotService.updateLot).toHaveBeenCalledWith('4', { title: 'Atualizado' });
    expect(adminRepository.openLot).toHaveBeenCalledWith(4);
    expect(adminRepository.deleteLot).toHaveBeenCalledWith(4);
    await expect(service.openLot('abc')).rejects.toMatchObject({ statusCode: 400 });
  });
});
