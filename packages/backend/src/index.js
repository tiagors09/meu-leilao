import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import backendPackage from '../package.json' with { type: 'json' };
import { createApp } from './app.js';
import { pool } from './config/db.js';
import { UserController } from './controllers/UserController.js';
import { WalletController } from './controllers/WalletController.js';
import { BidController } from './controllers/BidController.js';
import { AuditController } from './controllers/AuditController.js';
import { ReceiptController } from './controllers/ReceiptController.js';
import { AuctionLotController } from './controllers/AuctionLotController.js';
import { ItemController } from './controllers/ItemController.js';
import { createAuthMiddleware, createRoleMiddleware } from './middlewares/authMiddleware.js';
import { AuctionLotRepository } from './repositories/AuctionLotRepository.js';
import { BidRepository } from './repositories/BidRepository.js';
import { AuditRepository } from './repositories/AuditRepository.js';
import { ReceiptRepository } from './repositories/ReceiptRepository.js';
import { ItemRepository } from './repositories/ItemRepository.js';
import { UserRepository } from './repositories/UserRepository.js';
import { WalletRepository } from './repositories/WalletRepository.js';
import { AuctionLotService } from './services/AuctionLotService.js';
import { BidService } from './services/BidService.js';
import { AuditService } from './services/AuditService.js';
import { ReceiptService } from './services/ReceiptService.js';
import { ItemService } from './services/ItemService.js';
import { UserService } from './services/UserService.js';
import { WalletService } from './services/WalletService.js';

dotenv.config();

const { JWT_SECRET } = process.env;
const port = process.env.PORT_BACKEND || process.env.PORT || 3000;
if (!JWT_SECRET) {
  throw new Error('A variavel JWT_SECRET deve ser configurada.');
}

const userRepository = new UserRepository(pool);
const walletRepository = new WalletRepository(pool);
const itemRepository = new ItemRepository(pool);
const auctionLotRepository = new AuctionLotRepository(pool);
const bidRepository = new BidRepository(pool);
const auditRepository = new AuditRepository(pool);
const receiptRepository = new ReceiptRepository(pool);
const userService = new UserService({
  userRepository,
  passwordHasher: bcrypt,
  tokenSigner: jwt,
  jwtSecret: JWT_SECRET,
});
const walletService = new WalletService({ walletRepository });
const itemService = new ItemService({
  itemRepository,
  httpClient: fetch,
  apiBaseUrl: process.env.EXTERNAL_ITEMS_API_URL,
});
const auctionLotService = new AuctionLotService({ auctionLotRepository, itemRepository });
const bidService = new BidService({ bidRepository });
const auditService = new AuditService({ auditRepository });
const receiptService = new ReceiptService({ receiptRepository });
const userController = new UserController({ userService });
const walletController = new WalletController({ walletService });
const itemController = new ItemController({ itemService });
const auctionLotController = new AuctionLotController({ auctionLotService });
const bidController = new BidController({ bidService });
const auditController = new AuditController({ auditService });
const receiptController = new ReceiptController({ receiptService });
const authenticate = createAuthMiddleware({ tokenVerifier: jwt, jwtSecret: JWT_SECRET });
const checkRole = createRoleMiddleware;
const app = createApp({
  userController,
  walletController,
  itemController,
  auctionLotController,
  bidController,
  auditController,
  receiptController,
  authenticate,
  checkRole,
  appVersion: backendPackage.version,
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Servidor iniciado na porta ${port}.`);
});
