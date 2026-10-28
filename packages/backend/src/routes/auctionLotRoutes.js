import { Router } from 'express';

export function createAuctionLotRoutes({
  auctionLotController,
  bidController,
  authenticate,
  checkRole,
}) {
  const router = Router();

  router.get('/', auctionLotController.list.bind(auctionLotController));
  router.post(
    '/',
    authenticate,
    checkRole(['LEILOEIRO', 'ADMIN']),
    auctionLotController.create.bind(auctionLotController),
  );
  router.post(
    '/:id/bids',
    authenticate,
    checkRole(['LICITANTE']),
    bidController.place.bind(bidController),
  );

  return router;
}
