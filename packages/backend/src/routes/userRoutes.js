import { Router } from 'express';

export function createUserRoutes({ userController }) {
  const router = Router();

  router.post('/register', userController.register.bind(userController));
  router.post('/login', userController.login.bind(userController));

  return router;
}
