# Relatorio de Progresso e Ponto de Parada

## Status Atual
- Ultima funcionalidade concluida: passo 03 implementado; smoke test PostgreSQL aprovado e catalogo externo, cache local e criacao/listagem de lotes conectados.
- Ultimo commit realizado: `docs(monorepo): registra conclusao do passo 03`.

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

## Proximo Passo Imediato
- Implementar o passo 04: motor de lances com validacao, saldo comprometido, estorno do lider anterior e regra anti-sniping.
