import cors from 'cors';
import express from 'express';
import { createUserRoutes } from './routes/userRoutes.js';
import { createWalletRoutes } from './routes/walletRoutes.js';

export function createApp({
  userController,
  walletController,
  authenticate,
  checkRole,
}) {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use('/api/users', createUserRoutes({ userController }));
  app.use(
    '/api/wallets',
    createWalletRoutes({ walletController, authenticate, checkRole }),
  );

  app.use((error, request, response, next) => {
    if (response.headersSent) {
      return next(error);
    }

    const statusCode = error.statusCode ?? 500;
    const message = statusCode === 500 ? 'Erro interno do servidor.' : error.message;
    if (statusCode === 500) {
      console.error('Erro interno do servidor:', error);
    }

    return response.status(statusCode).json({ error: message });
  });

  return app;
}
