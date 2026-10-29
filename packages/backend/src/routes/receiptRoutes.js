import { Router } from 'express';

export function createReceiptRoutes({ receiptController, authenticate, checkRole }) {
  const router = Router();
  router.get('/me', authenticate, checkRole(['LICITANTE']), receiptController.listMine.bind(receiptController));
  router.get('/:shareCode', receiptController.getShared.bind(receiptController));
  return router;
}
