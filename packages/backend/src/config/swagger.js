import { fileURLToPath } from 'node:url';
import swaggerJsdoc from 'swagger-jsdoc';

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'API Verzel Leilao',
      version: '1.0.0',
      description: 'API de autenticacao, carteiras, lotes, lances e auditoria.',
    },
    servers: [{ url: '/', description: 'API do ambiente atual' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
      schemas: {
        ApiError: {
          type: 'object', required: ['error'],
          properties: { error: { type: 'string', example: 'Saldo disponivel insuficiente para este lance.' } },
        },
        UserCredentials: {
          type: 'object', required: ['email', 'password'],
          properties: {
            name: { type: 'string', example: 'Maria Silva' },
            email: { type: 'string', format: 'email', example: 'maria@example.com' },
            password: { type: 'string', format: 'password', example: 'senha-segura' },
            role: { type: 'string', enum: ['LICITANTE', 'LEILOEIRO', 'ADMIN'], default: 'LICITANTE' },
          },
        },
        Wallet: {
          type: 'object',
          properties: {
            balance_total: { type: 'number', example: 5000 },
            balance_pledged: { type: 'number', example: 100 },
            balance_available: { type: 'number', example: 4900 },
          },
        },
        Lot: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            title: { type: 'string', example: 'Relogio de colecao' },
            status: { type: 'string', enum: ['SCHEDULED', 'LIVE', 'CLOSED', 'CANCELLED'] },
            initial_price: { type: 'number', example: 100 },
            min_increment: { type: 'number', example: 10 },
          },
        },
        Bid: {
          type: 'object',
          properties: {
            id: { type: 'integer' }, lot_id: { type: 'integer' }, amount: { type: 'number' },
            previous_hash: { type: 'string', nullable: true }, hash: { type: 'string' }, created_at: { type: 'string', format: 'date-time' },
          },
        },
        Audit: {
          type: 'object',
          properties: {
            lot_id: { type: 'integer' }, is_valid: { type: 'boolean' }, is_tampered: { type: 'boolean' },
            chain: { type: 'array', items: { allOf: [{ $ref: '#/components/schemas/Bid' }, { type: 'object', properties: { is_valid: { type: 'boolean' }, bidder: { type: 'string' } } }] } },
          },
        },
        Receipt: {
          type: 'object',
          properties: {
            id: { type: 'integer' }, lot_id: { type: 'integer' }, winner_id: { type: 'integer' },
            amount: { type: 'number' }, share_code: { type: 'string' }, created_at: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    tags: [
      { name: 'Autenticacao' }, { name: 'Carteira' }, { name: 'Lotes' },
      { name: 'Lances' }, { name: 'Auditoria' }, { name: 'Recibos' },
    ],
  },
  apis: [fileURLToPath(new URL('../docs/*.js', import.meta.url))],
});
