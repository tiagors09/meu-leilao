import { Router } from 'express';

export function createAuctionLotRoutes({ auctionLotController, authenticate, checkRole }) {
  const router = Router();

  router.get('/', auctionLotController.list.bind(auctionLotController));
  router.post(
    '/',
    authenticate,
    checkRole(['LEILOEIRO', 'ADMIN']),
    auctionLotController.create.bind(auctionLotController),
  );

  return router;
}
