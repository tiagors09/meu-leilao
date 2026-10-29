import { Router } from 'express';

export function createAdminRoutes({ adminController, authenticate, checkRole }) {
  const router = Router();
  const adminOnly = [authenticate, checkRole(['ADMIN'])];

  router.get('/overview', ...adminOnly, adminController.getOverview.bind(adminController));
  router.get('/users', ...adminOnly, adminController.listUsers.bind(adminController));
  router.patch('/users/:id/role', ...adminOnly, adminController.updateUserRole.bind(adminController));
  router.get('/lots', ...adminOnly, adminController.listLots.bind(adminController));
  router.get('/transactions', ...adminOnly, adminController.listTransactions.bind(adminController));

  return router;
}
