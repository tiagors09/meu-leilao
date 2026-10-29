/**
 * @openapi
 * /api/users/register:
 *   post:
 *     tags: [Autenticacao]
 *     summary: Cria uma conta de licitante
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/UserCredentials'
 *               - type: object
 *                 required: [name]
 *     responses:
 *       '201': { description: Conta criada e token emitido }
 *       '400': { description: Dados invalidos }
 *       '409': { description: Email ja cadastrado }
 * /api/users/login:
 *   post:
 *     tags: [Autenticacao]
 *     summary: Autentica usuario e emite JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/UserCredentials' }
 *     responses:
 *       '200': { description: Usuario autenticado }
 *       '401': { description: Credenciais invalidas }
 * /api/wallets/me:
 *   get:
 *     tags: [Carteira]
 *     summary: Consulta saldos da carteira autenticada
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       '200':
 *         description: Saldos total, comprometido e disponivel
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Wallet' }
 *       '401': { description: Token ausente ou invalido }
 * /api/wallets/deposit:
 *   post:
 *     tags: [Carteira]
 *     summary: Realiza deposito simulado (papel LICITANTE)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount]
 *             properties: { amount: { type: number, minimum: 0.01, example: 250 } }
 *     responses:
 *       '200': { description: Saldos atualizados }
 *       '400': { description: Valor invalido }
 *       '403': { description: Papel sem permissao }
 * /api/lots:
 *   get:
 *     tags: [Lotes]
 *     summary: Lista lotes, com filtro opcional por status
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [SCHEDULED, LIVE, CLOSED, CANCELLED] }
 *     responses:
 *       '200':
 *         description: Lista de lotes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties: { lots: { type: array, items: { $ref: '#/components/schemas/Lot' } } }
 *   post:
 *     tags: [Lotes]
 *     summary: Cadastra lote (papel LEILOEIRO ou ADMIN)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [item_id, title, initial_price, min_increment, start_time, end_time]
 *             properties:
 *               item_id: { type: integer }
 *               title: { type: string }
 *               initial_price: { type: number }
 *               min_increment: { type: number }
 *               start_time: { type: string, format: date-time }
 *               end_time: { type: string, format: date-time }
 *     responses:
 *       '201': { description: Lote criado }
 *       '400': { description: Dados invalidos }
 *       '403': { description: Papel sem permissao }
 * /api/lots/{id}:
 *   get:
 *     tags: [Lotes]
 *     summary: Consulta detalhes e lider atual do lote
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       '200':
 *         description: Detalhes do lote
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Lot' }
 *       '404': { description: Lote nao encontrado }
 * /api/lots/{id}/bids:
 *   post:
 *     tags: [Lances]
 *     summary: Registra lance e compromete saldo (papel LICITANTE)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount]
 *             properties: { amount: { type: number, example: 110 } }
 *     responses:
 *       '201':
 *         description: Lance registrado
 *         content:
 *           application/json:
 *             schema: { type: object, properties: { bid: { $ref: '#/components/schemas/Bid' }, end_time: { type: string, format: date-time } } }
 *       '400': { description: Lance abaixo do minimo }
 *       '409': { description: Lider atual, saldo insuficiente ou lote indisponivel }
 * /api/lots/{id}/audit:
 *   get:
 *     tags: [Auditoria]
 *     summary: Valida publicamente a cadeia SHA-256 dos lances
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       '200':
 *         description: Integridade da cadeia e lista de lances encadeados
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Audit' }
 *       '400': { description: Identificador invalido }
 * /api/receipts/me:
 *   get:
 *     tags: [Recibos]
 *     summary: Lista recibos de arrematacao do licitante autenticado
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       '200':
 *         description: Recibos do usuario
 *         content:
 *           application/json:
 *             schema: { type: object, properties: { receipts: { type: array, items: { $ref: '#/components/schemas/Receipt' } } } }
 *       '401': { description: Token ausente ou invalido }
 *       '403': { description: Papel sem permissao }
 */
export {};
