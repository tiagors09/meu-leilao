import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { createApp } from './app.js';
import { pool } from './config/db.js';
import { UserController } from './controllers/UserController.js';
import { WalletController } from './controllers/WalletController.js';
import { AuctionLotController } from './controllers/AuctionLotController.js';
import { ItemController } from './controllers/ItemController.js';
import { createAuthMiddleware, createRoleMiddleware } from './middlewares/authMiddleware.js';
import { AuctionLotRepository } from './repositories/AuctionLotRepository.js';
import { ItemRepository } from './repositories/ItemRepository.js';
import { UserRepository } from './repositories/UserRepository.js';
import { WalletRepository } from './repositories/WalletRepository.js';
import { AuctionLotService } from './services/AuctionLotService.js';
import { ItemService } from './services/ItemService.js';
import { UserService } from './services/UserService.js';
import { WalletService } from './services/WalletService.js';

dotenv.config();

const { JWT_SECRET, PORT_BACKEND = 3000 } = process.env;
if (!JWT_SECRET) {
  throw new Error('A variavel JWT_SECRET deve ser configurada.');
}

const userRepository = new UserRepository(pool);
const walletRepository = new WalletRepository(pool);
const itemRepository = new ItemRepository(pool);
const auctionLotRepository = new AuctionLotRepository(pool);
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
const userController = new UserController({ userService });
const walletController = new WalletController({ walletService });
const itemController = new ItemController({ itemService });
const auctionLotController = new AuctionLotController({ auctionLotService });
const authenticate = createAuthMiddleware({ tokenVerifier: jwt, jwtSecret: JWT_SECRET });
const checkRole = createRoleMiddleware;
const app = createApp({
  userController,
  walletController,
  itemController,
  auctionLotController,
  authenticate,
  checkRole,
});

app.listen(PORT_BACKEND, () => {
  console.log(`Servidor iniciado na porta ${PORT_BACKEND}.`);
});
