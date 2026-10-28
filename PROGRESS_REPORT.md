# Relatorio de Progresso e Ponto de Parada

## Status Atual
- Ultima funcionalidade concluida: passo 02 implementado com cadastro, login JWT, autorizacao por perfil e consulta/deposito em carteira.
- Ultimo commit realizado: `docs(monorepo): registra conclusao do passo 02`.

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

## Proximo Passo Imediato
- Implementar o passo 03: integracao resiliente com API externa, cache de itens e endpoints de lotes.
