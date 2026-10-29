import { describe, expect, jest, test } from '@jest/globals';
import { createApp } from '../app.js';

describe('rota de favicon', () => {
  test('responde imediatamente com 204 sem executar outras camadas', () => {
    const noop = () => {};
    const controller = {
      register: noop, login: noop, getBalance: noop, deposit: noop, search: noop,
      create: noop, list: noop, get: noop, place: noop, auditLot: noop,
      closeLot: noop, listMine: noop, getShared: noop,
    };
    const app = createApp({
      userController: controller,
      walletController: controller,
      itemController: controller,
      auctionLotController: controller,
      bidController: controller,
      auditController: controller,
      receiptController: controller,
      authenticate: (request, response, next) => next(),
      checkRole: () => (request, response, next) => next(),
    });
    const faviconRoute = app._router.stack.find((layer) => layer.route?.path === '/favicon.ico');
    const response = { status: jest.fn(() => response), end: jest.fn() };

    faviconRoute.route.stack[0].handle({}, response);

    expect(response.status).toHaveBeenCalledWith(204);
    expect(response.end).toHaveBeenCalledTimes(1);
  });

  test('rota raiz responde com o estado online da API', () => {
    const noop = () => {};
    const controller = {
      register: noop, login: noop, getBalance: noop, deposit: noop, search: noop,
      create: noop, list: noop, get: noop, place: noop, auditLot: noop,
      closeLot: noop, listMine: noop, getShared: noop,
    };
    const app = createApp({
      userController: controller,
      walletController: controller,
      itemController: controller,
      auctionLotController: controller,
      bidController: controller,
      auditController: controller,
      receiptController: controller,
      authenticate: (request, response, next) => next(),
      checkRole: () => (request, response, next) => next(),
    });
    const rootRoute = app._router.stack.find((layer) => layer.route?.path === '/');
    const response = { status: jest.fn(() => response), json: jest.fn() };

    rootRoute.route.stack[0].handle({}, response);

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith({ status: 'online', message: 'Verzel Leilao API' });
  });
});
