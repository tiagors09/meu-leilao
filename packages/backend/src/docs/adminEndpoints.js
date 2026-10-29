/**
 * @swagger
 * /api/admin/overview:
 *   get:
 *     summary: Consulta metricas gerais da plataforma
 *     tags: [Administracao]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Metricas administrativas }
 *       403: { description: Acesso restrito a ADMIN }
 * /api/admin/users:
 *   get:
 *     summary: Lista usuarios paginados
 *     tags: [Administracao]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, maximum: 10000, default: 1 }
 *       - in: query
 *         name: pageSize
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 25 }
 *     responses:
 *       200: { description: Usuarios e total correspondente ao filtro }
 *       403: { description: Acesso restrito a ADMIN }
 * /api/admin/users/{id}/role:
 *   patch:
 *     summary: Altera papel de um usuario
 *     tags: [Administracao]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role]
 *             properties:
 *               role: { type: string, enum: [ADMIN, LEILOEIRO, LICITANTE] }
 *     responses:
 *       200: { description: Papel atualizado }
 *       403: { description: Acesso restrito a ADMIN }
 *       409: { description: Operacao nao permitida }
 * /api/admin/lots:
 *   get:
 *     summary: Lista lotes com contagem de lances
 *     tags: [Administracao]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, maximum: 10000, default: 1 }
 *       - in: query
 *         name: pageSize
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 25 }
 *     responses:
 *       200: { description: Lotes paginados }
 *       403: { description: Acesso restrito a ADMIN }
 * /api/admin/transactions:
 *   get:
 *     summary: Lista liquidacoes/recibos paginados
 *     tags: [Administracao]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, maximum: 10000, default: 1 }
 *       - in: query
 *         name: pageSize
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 25 }
 *     responses:
 *       200: { description: Transacoes liquidadas paginadas }
 *       403: { description: Acesso restrito a ADMIN }
 */
export const adminEndpointDocumentation = true;
