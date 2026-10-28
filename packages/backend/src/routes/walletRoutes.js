import { Router } from 'express';

export function createWalletRoutes({ walletController, authenticate, checkRole }) {
  const router = Router();

  router.get('/me', authenticate, walletController.getBalance.bind(walletController));
  router.post(
    '/deposit',
    authenticate,
    checkRole(['LICITANTE']),
    walletController.deposit.bind(walletController),
  );

  return router;
}
