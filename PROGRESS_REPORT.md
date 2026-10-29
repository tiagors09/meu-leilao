# Relatorio de Progresso e Ponto de Parada

## Status Atual
- Ultima funcionalidade concluida: fallback de rotas SPA no Render para refresh em sub-rotas do frontend.
- Ultimo commit realizado: `fix(frontend): configura fallback de rotas spa para evitar 404 no refresh`.

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
- Cada lance grava `previous_hash` e SHA-256 para encadear os registros; verificacao publica da cadeia e liquidacao foram concluidas no passo 05.
- `AuditRepository(database)` lista os lances por ordem de insercao; `AuditService({ auditRepository })` valida sequencialmente `previous_hash` e SHA-256, expondo apenas identificador anonimizado do licitante.
- Auditoria publica em `GET /api/lots/:id/audit`, com validacao individual dos elos e flags `is_valid`/`is_tampered`.
- `ReceiptRepository(database)` encerra o lote em transacao, liquida o valor do vencedor para o leiloeiro, registra vencedor e recibo com UUID e trata repeticao do encerramento de forma idempotente.
- `ReceiptService({ receiptRepository })` e controller injetado; fechamento protegido em `POST /api/lots/:id/close` para `LEILOEIRO`/`ADMIN`, recibos do proprio licitante em `GET /api/receipts/me` e consulta publica do comprovante em `GET /api/receipts/:shareCode`.
- Lotes encerrados sem lances ficam `CLOSED` sem recibo; lances anteriores ja liberam a reserva do lider anterior durante a disputa, e no encerramento o vencedor tem valor debitado do total e do comprometido.
- Testes unitarios do servico de auditoria e recibos: `npm test --workspace=backend`.
- Validacao do banco: seeds executadas duas vezes no PostgreSQL local e `npm run smoke --workspace=backend` aprovado.
- Frontend em `packages/frontend` usa React Router DOM, Axios centralizado com token JWT do `localStorage` e Tailwind CSS 4 via plugin oficial do Vite.
- `src/design-system/` exporta `Button`, `Input`, `Card`, `Badge`, `Modal`, `Navbar` e `RouteLink`; componentes seguem a paleta pastel, bordas pretas grossas, sombras rigidas e resposta de clique neubrutalista.
- Telas de vitrine, leiloeiro, lote, carteira e auditoria estao em `src/features/<tela>/` com nomes de specs, viewmodels e views totalmente em minusculo; chamadas Axios, estado, validacoes e temporizadores ficam nos ViewModels.
- Login/cadastro tambem foi separado em `auth.specs.js`, `useaccess.viewmodel.js` e `access.view.jsx`; a navegacao visual foi extraida para o componente `Navbar` do Design System.
- Rotas de interface: `/`, `/leiloeiro`, `/lote/:id`, `/carteira` e `/auditoria/:id`; telas protegidas exibem acesso apropriado conforme a sessao e o papel recebido no JWT.
- Vitrine com abas por status; painel do leiloeiro busca itens externos, cria lotes, lista arremate atual e permite encerrar lotes; sala consulta detalhes a cada 3s, mostra contagem regressiva e permite lances; carteira consulta saldo e deposita; auditoria publica mostra a timeline e integridade dos elos.
- `GET /api/lots/:id` adicionado para expor os detalhes e o lance lider ao cliente da sala, incluindo imagem do item e identificador do licitante lider para o estado da disputa.
- Verificacao frontend: `npm run lint --workspace=frontend` e `npm run build --workspace=frontend` aprovados apos a refatoracao MVVM.

## Status do MVP
- Passos 01 a 07 concluidos em codigo: setup e banco, autenticacao/carteira, integracao externa/lotes, motor de lances, auditoria/liquidacao/recibos, frontend React/Vite/Tailwind, seeds e pipeline de validacao.
- `packages/backend/src/seeds.js` inicializa o schema e semeia leiloeiro, dois licitantes, carteiras de R$ 5.000, item e lote LIVE em transacao idempotente. Credenciais de demonstracao: `leiloeiro@verzel.com`, `cliente1@verzel.com` e `cliente2@verzel.com`, senha `123456`.
- Scripts `seed`, `test`, `test:unit` e `test:gherkin` adicionados ao workspace backend; scripts raiz `seed`, `test` e `test:frontend` facilitam a execucao.
- Gherkin cobre deposito, reserva de saldo, lance abaixo do minimo e bloqueio do lider atual. Jest cobre regras de lances, cadeia SHA-256 e recibos.
- `.github/workflows/ci.yml` executa Jest/Cucumber, lint e build em push/PR para `main`.
- `packages/backend/Dockerfile` usa contexto de build na raiz (`docker build -f packages/backend/Dockerfile .`), instala apenas dependencias de runtime e inicia via `npm run start`; backend respeita `PORT` e escuta em `0.0.0.0`.
- Validacoes locais do passo 07: seed executado duas vezes, testes Jest (10) e Cucumber (4 cenarios) aprovados, lint e build frontend aprovados, imagem Docker construida com contexto raiz.
- Deploy publico no GitHub/Render nao foi realizado: requer conectar/provisionar recursos na conta Render e configurar variaveis e dominios do ambiente.

## Documentacao da API e Suite QA
- Swagger UI publicado em `/api-docs/` e definicao OpenAPI em `/api-docs.json`; endpoints de autenticacao, carteira, lotes, lances, auditoria e recibos incluem modelos de dados, respostas e JWT Bearer.
- `swagger-jsdoc` agrega a definicao OpenAPI e `swagger-ui-express` disponibiliza a interface. `packages/backend/README.md` registra URLs e comandos de validacao.
- Jest cobre lances, reservas/liberacao de saldo, lideranca, auditoria SHA-256, recibos e paths OpenAPI: 11 testes aprovados.
- Cucumber cobre deposito, lance valido, reserva, minimo, saldo insuficiente e regra do lider: 5 cenarios/21 passos aprovados.
- Vitest e Testing Library cobrem ViewModels de autenticacao, vitrine, lote/polling, carteira, auditoria e painel do leiloeiro, contratos Specs, cliente Axios e cor condicional de lideranca: 15 testes aprovados em 9 arquivos.
- `npm test --workspace=backend`, `npm test --workspace=frontend`, lint e build frontend aprovados apos a suite QA.
- CI inclui os testes Vitest do frontend. A UI do Swagger foi ligada no Express; validacao HTTP local do endpoint foi limitada pelo sandbox, enquanto o contrato gerado e testado pelo Jest.
- Comandos principais: `npm test --workspace=backend` (Jest + Cucumber) e `npm run test:frontend` (Vitest + lint + build).
- Commits da camada de qualidade/documentacao: `test(qa): adiciona testes unitarios, gherkin, regressao e swagger`.

## Seguranca e navegadores
- `GET /favicon.ico` responde diretamente com HTTP 204 antes do parser JSON e das rotas da API.
- Helmet aplica cabecalhos de seguranca e CSP com `img-src 'self' data: https:`. O Swagger UI mantem os cabecalhos Helmet, com CSP desativada somente nas rotas `/api-docs` para suportar seus scripts inline.
- `GET /` retorna `{ status: 'online', message: 'Verzel Leilao API' }`; `GET /favicon.ico` responde 204 antes de parser JSON e rotas da API.
- Testes Jest cobrem health check, favicon e diretiva de imagens: 14 testes aprovados; Cucumber: 5 cenarios/21 passos aprovados.

## Homologacao de Endpoints e Pagina do Backend
- `apiEndpoints` centraliza os caminhos consumidos pelo frontend e corresponde as rotas Express de usuarios, carteira, busca externa, lotes, lances, auditoria, encerramento e recibos.
- `resolveApiBaseUrl` usa `VITE_API_URL`, remove barra final e garante um unico prefixo `/api`; em desenvolvimento sem configuracao usa `http://localhost:3000/api`, e em producao usa `/api` same-origin.
- ViewModels extraem a mensagem `{ error }` do backend e as Views apresentam os estados de erro; testes validam mensagens, caminhos e estados.
- A rota `GET /` renderiza `packages/backend/views/index.pug` com status, versao do package e timestamp; o link leva ao Swagger. O CSS inline usa nonce CSP.
- Validacao: backend 16 testes Jest e 5 cenarios/21 passos Cucumber; frontend 17 testes Vitest, lint e build aprovados; `node --check packages/backend/src/index.js` aprovado.

## Fallback de Rotas SPA
- `render.yaml` configura o Static Site do frontend com rewrite `/*` para `/index.html`, fazendo `/leiloeiro`, `/lote/:id`, `/carteira` e `/auditoria/:id` chegarem ao React Router quando acessadas diretamente ou atualizadas.
- O Blueprint executa o build do workspace frontend e publica `packages/frontend/dist`; `VITE_API_URL` deve ser informado com o endereco publico do backend terminado em `/api`.
- `docs/passo_07_seeds_e_deploy_no_render.md` atualizado com as instrucoes de fallback.

## Inicializacao Automatica do Banco
- No boot, o backend aplica `src/config/init.sql` em uma transacao antes de iniciar o listener HTTP; um advisory lock serializa a criacao do schema entre instancias.
- `npm run start --workspace=backend` executa diretamente `node src/index.js`, sem depender de um script migrate inexistente ou de uma etapa manual.
- Testes unitarios cobrem sucesso, rollback em falha e liberacao da conexao.
