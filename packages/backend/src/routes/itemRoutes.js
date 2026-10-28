import { Router } from 'express';

export function createItemRoutes({ itemController }) {
  const router = Router();

  router.get('/search', itemController.search.bind(itemController));

  return router;
}
