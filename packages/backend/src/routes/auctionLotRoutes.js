import { Router } from 'express';

export function createAuctionLotRoutes({
  auctionLotController,
  bidController,
  auditController,
  receiptController,
  authenticate,
  checkRole,
}) {
  const router = Router();

  router.get('/', auctionLotController.list.bind(auctionLotController));
  router.get('/:id', auctionLotController.get.bind(auctionLotController));
  router.get('/:id/audit', auditController.auditLot.bind(auditController));
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
  router.post(
    '/:id/close',
    authenticate,
    checkRole(['LEILOEIRO', 'ADMIN']),
    receiptController.closeLot.bind(receiptController),
  );

  return router;
}
