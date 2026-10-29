import cors from 'cors';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.js';
import { securityHeaders, swaggerSecurityHeaders } from './config/securityHeaders.js';
import { createAuctionLotRoutes } from './routes/auctionLotRoutes.js';
import { createItemRoutes } from './routes/itemRoutes.js';
import { createUserRoutes } from './routes/userRoutes.js';
import { createWalletRoutes } from './routes/walletRoutes.js';
import { createReceiptRoutes } from './routes/receiptRoutes.js';

export function createApp({
  userController,
  walletController,
  itemController,
  auctionLotController,
  bidController,
  auditController,
  receiptController,
  authenticate,
  checkRole,
}) {
  const app = express();

  app.use(cors());
  app.get('/favicon.ico', (request, response) => response.status(204).end());
  app.use(express.json());
  app.use((request, response, next) => {
    const isSwaggerUi = request.path === '/api-docs' || request.path.startsWith('/api-docs/');
    return (isSwaggerUi ? swaggerSecurityHeaders : securityHeaders)(request, response, next);
  });
  app.get('/', (request, response) => response.status(200).json({
    status: 'online',
    message: 'Verzel Leilao API',
  }));
  app.get('/api-docs.json', (request, response) => response.json(swaggerSpec));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.use('/api/users', createUserRoutes({ userController }));
  app.use('/api/external-items', createItemRoutes({ itemController }));
  app.use(
    '/api/lots',
    createAuctionLotRoutes({
      auctionLotController,
      bidController,
      auditController,
      receiptController,
      authenticate,
      checkRole,
    }),
  );
  app.use(
    '/api/wallets',
    createWalletRoutes({ walletController, authenticate, checkRole }),
  );
  app.use('/api/receipts', createReceiptRoutes({ receiptController, authenticate, checkRole }));

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
