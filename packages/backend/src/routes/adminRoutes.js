import { Router } from 'express';

export function createAdminRoutes({ adminController, authenticate, checkRole }) {
  const router = Router();
  const adminOnly = [authenticate, checkRole(['ADMIN'])];

  router.get('/overview', ...adminOnly, adminController.getOverview.bind(adminController));
  router.get('/users', ...adminOnly, adminController.listUsers.bind(adminController));
  router.patch('/users/:id/role', ...adminOnly, adminController.updateUserRole.bind(adminController));
  router.get('/lots', ...adminOnly, adminController.listLots.bind(adminController));
  router.post('/lots', ...adminOnly, adminController.createLot.bind(adminController));
  router.patch('/lots/:id', ...adminOnly, adminController.updateLot.bind(adminController));
  router.post('/lots/:id/open', ...adminOnly, adminController.openLot.bind(adminController));
  router.delete('/lots/:id', ...adminOnly, adminController.deleteLot.bind(adminController));
  router.get('/transactions', ...adminOnly, adminController.listTransactions.bind(adminController));

  return router;
}
