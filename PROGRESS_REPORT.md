# Relatorio de Progresso e Ponto de Parada

## Status Atual
- Ultima funcionalidade concluida: passo 05 implementado com auditoria publica, encerramento transacional/liquidacao, recibos privados e compartilhaveis.
- Ultimo commit realizado: `feat(backend): implementa auditoria e liquidacao de lotes`.

## Estruturas e Interfaces Criadas
- `UserRepository(database)`: `findByEmail(email)` e `createUser(...)`; cria usuario e carteira em uma transacao.
- `WalletRepository(database)`: `findByUserId(userId)` e `increaseBalance(userId, amount)`.
- `database` deve expor a interface de `pg` com `query()` e `connect()`; nao ha importacao concreta do pool nos repositories.
- `pool` exportado por `src/config/db.js` para injecao no ponto de composicao.
- `UserService` recebe repository, hasher, assinador JWT e segredo; `WalletService` recebe `WalletRepository`.
- `UserController` e `WalletController` recebem seus services; `createAuthMiddleware` recebe verificador JWT e segredo.
- Rotas em `/api/users` e `/api/wallets`; `src/index.js` compoe as dependencias e inicia o Express.
- Endpoints: `POST /api/users/register`, `POST /api/users/login`, `GET /api/wallets/me` e `POST /api/wallets/deposit` (somente `LICITANTE`).
- Configuracao obrigatoria: `JWT_SECRET` no ambiente.
- Docker Compose executa PostgreSQL 16, mapeia a porta 5432, aguarda healthcheck e monta `src/config/init.sql` na inicializacao do volume.
- `DATABASE_URL` local configurada em `packages/backend/.env.example`; no Compose, o backend recebe a URL usando o host `postgres`.
- `src/tests/smokeTest.js` usa `UserRepository` e `WalletRepository`, valida a criacao da carteira e remove o usuario temporario ao final.
- `ItemRepository(database)` consulta itens em cache, busca por ID local e atualiza itens externos por `id_externo`.
- `ItemService({ itemRepository, httpClient, apiBaseUrl, timeoutMs })` consulta DummyJSON, aplica timeout e retorna resultados do cache local em falhas da API.
- `AuctionLotRepository(database)` cria lotes e lista lotes com filtro opcional de status.
- `AuctionLotService({ auctionLotRepository, itemRepository, clock })` valida item, valores e datas, e define status inicial `SCHEDULED` ou `LIVE`.
- `ItemController` e `AuctionLotController` recebem seus services; rotas adicionadas em `/api/external-items/search` e `/api/lots`.
- Criacao de lotes em `POST /api/lots` exige JWT e papel `LEILOEIRO` ou `ADMIN`; `GET /api/lots` aceita filtro por status.
- Validacao de banco: container `postgres:16-alpine` healthy, `init.sql` executado e `npm run smoke --workspace=backend` aprovado.
- `BidRepository(database)` executa a transacao do lance, bloqueia o lote e as carteiras envolvidas, ajusta saldo comprometido e grava o lance.
- `BidService({ bidRepository, clock })` valida status/horario, lance minimo, lider atual e saldo disponivel; prorroga o lote em dois minutos se faltarem menos de dois minutos.
- `BidController` recebe `BidService`; `POST /api/lots/:id/bids` exige JWT e papel `LICITANTE`.
- Cada lance grava `previous_hash` e SHA-256 para satisfazer o schema e encadear os registros; verificacao publica da cadeia e liquidacao ficam para o passo 05.
- `AuditRepository(database)` lista os lances por ordem de insercao; `AuditService({ auditRepository })` valida sequencialmente `previous_hash` e SHA-256, expondo apenas identificador anonimizado do licitante.
- Auditoria publica em `GET /api/lots/:id/audit`, com validacao individual dos elos e flags `is_valid`/`is_tampered`.
- `ReceiptRepository(database)` encerra o lote em transacao, liquida o valor do vencedor para o leiloeiro, registra vencedor e recibo com UUID e trata repeticao do encerramento de forma idempotente.
- `ReceiptService({ receiptRepository })` e controller injetado; fechamento protegido em `POST /api/lots/:id/close` para `LEILOEIRO`/`ADMIN`, recibos do proprio licitante em `GET /api/receipts/me` e consulta publica do comprovante em `GET /api/receipts/:shareCode`.
- Lotes encerrados sem lances ficam `CLOSED` sem recibo; lances anteriores ja liberam a reserva do lider anterior durante a disputa, e no encerramento o vencedor tem valor debitado do total e do comprometido.
- Testes unitarios do servico de auditoria e recibos: `npm test --workspace=backend`.
- Validacao do banco ponta a ponta nao foi possivel nesta execucao: `npm run smoke --workspace=backend` falhou porque o PostgreSQL configurado nao estava acessivel.

## Status do MVP
- Passos 01 a 05 concluidos: setup e banco, autenticacao/carteira, integracao externa/lotes, motor de lances e auditoria/liquidacao/recibos.
- Proximos passos do roteiro: passo 06 (frontend React/Vite) e passo 07 (seeds e deploy no Render).
