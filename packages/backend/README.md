# Backend — Verzel Leilao

API REST Node.js/Express para autenticacao, carteira, itens, lotes, lances, auditoria e recibos. O pacote usa ES Modules e injecao de dependencias: o ponto de composicao em `src/index.js` cria repositories, services, controllers e middlewares.

## Executar

Na raiz do monorepo:

```bash
cp packages/backend/.env.example packages/backend/.env
npm ci
npm run dev --workspace=backend
```

O processo precisa de PostgreSQL acessivel e de `JWT_SECRET`. `npm run start --workspace=backend` executa `node src/index.js`; durante o boot, o backend conecta ao banco, aplica `src/config/init.sql` em transacao e somente depois abre o listener. Se o banco estiver indisponivel, o processo encerra com erro em vez de aceitar requisicoes sem schema.

O inicializador cria tabelas e indices ausentes com `CREATE TABLE/INDEX IF NOT EXISTS` e usa advisory lock entre instancias concorrentes. Isso nao substitui migracoes versionadas: mudancas futuras em tabelas ja existentes precisam de uma estrategia propria.

### Variaveis de ambiente

| Variavel | Uso |
| --- | --- |
| `DATABASE_URL` | URL de conexao PostgreSQL; obrigatoria para conectar. |
| `JWT_SECRET` | Segredo de assinatura/verificacao JWT; obrigatorio. Use segredo aleatorio forte fora do desenvolvimento. |
| `PORT_BACKEND` | Porta preferencial local/Compose. |
| `PORT` | Porta fornecida pelo Render; usada como fallback de `PORT_BACKEND`. |
| `EXTERNAL_ITEMS_API_URL` | Base da API de catalogo externo; default configurado para DummyJSON. |

Consulte `.env.example`. Para Docker Compose, as variaveis ficam na raiz do repositorio e sao injetadas no container. Nunca publique valores de `.env`.

## Rotas

Todas as rotas REST abaixo usam o prefixo `/api`, salvo onde indicado. Rotas marcadas com JWT esperam `Authorization: Bearer <token>`.

| Metodo | Rota | Acesso | Funcao |
| --- | --- | --- | --- |
| `POST` | `/api/users/register` | Publico | Cria conta e carteira; papel default `LICITANTE`. |
| `POST` | `/api/users/login` | Publico | Autentica e retorna JWT valido por 1 hora. |
| `GET` | `/api/wallets/me` | JWT | Consulta a carteira do usuario. |
| `POST` | `/api/wallets/deposit` | JWT + `LICITANTE` | Deposito simulado. |
| `GET` | `/api/external-items/search?q=...` | Publico | Consulta catalogo externo e cache local. |
| `GET` | `/api/lots?status=LIVE` | Publico | Lista lotes, com filtro opcional por status. |
| `GET` | `/api/lots/:id` | Publico | Detalhes do lote e lider/lance atual. |
| `POST` | `/api/lots` | JWT + `LEILOEIRO`/`ADMIN` | Cria lote. |
| `POST` | `/api/lots/:id/bids` | JWT + `LICITANTE` | Envia lance, reserva saldo e registra hash. |
| `POST` | `/api/lots/:id/close` | JWT + `LEILOEIRO`/`ADMIN` | Encerra lote e liquida o vencedor. |
| `GET` | `/api/lots/:id/audit` | Publico | Verifica a cadeia SHA-256 e expõe identificador anonimizado. |
| `GET` | `/api/receipts/me` | JWT + `LICITANTE` | Lista recibos do usuario autenticado. |
| `GET` | `/api/receipts/:shareCode` | Publico | Consulta recibo compartilhavel. |

O prefixo `/api` nao se aplica a `GET /` (pagina Pug de status), `GET /favicon.ico` (204), `/api-docs/` e `/api-docs.json`.

### Papeis e seguranca

O banco aceita `ADMIN`, `LEILOEIRO` e `LICITANTE`. As rotas de criacao/encerramento de lotes aceitam leiloeiro e admin; nao existe painel de configuracao administrativa dedicado. O registro aceita `role` opcional vindo do payload, inclusive papeis privilegiados. Isso e um risco de escalacao de privilegio: restrinja a criacao de papeis antes de disponibilizar a API publicamente. A conta de seed `leiloeiro@verzel.com` e para testes locais; nao ha admin seed.

## Swagger e pagina Pug

- UI interativa: `http://localhost:3000/api-docs/`
- OpenAPI JSON: `http://localhost:3000/api-docs.json`
- Status/backend: `http://localhost:3000/`

A raiz renderiza `views/index.pug` com status, versao e timestamp UTC. O CSS inline usa nonce CSP. Helmet permite imagens de origem propria, `data:` e HTTPS; as rotas do Swagger usam configuracao CSP especifica para a interface.

## Seeds e verificacao

Com o banco acessivel:

```bash
npm run seed --workspace=backend
npm test --workspace=backend
npm run test:unit --workspace=backend
npm run test:gherkin --workspace=backend
```

As seeds criam o leiloeiro `leiloeiro@verzel.com`, dois licitantes (`cliente1@verzel.com`, `cliente2@verzel.com`), carteiras com R$ 5.000, item cacheado e lote demonstrativo `LIVE`. Senha de todas as contas: `123456`; estas credenciais sao publicas e nao devem ser usadas em producao. Os testes unitarios usam dependencias controladas; o smoke test e seed precisam de banco real configurado.

## Docker e deploy

`docker compose up --build` sobe PostgreSQL, backend e frontend. O backend Dockerfile espera contexto na raiz do monorepo. Para Render, configure um PostgreSQL e um Web Service backend separadamente, injete `DATABASE_URL`/`JWT_SECRET` e use `npm run start --workspace=backend` para Node ou `packages/backend/Dockerfile` com contexto raiz. A configuracao `render.yaml` do repositorio descreve o Static Site frontend, nao provisiona este servico nem o banco.
