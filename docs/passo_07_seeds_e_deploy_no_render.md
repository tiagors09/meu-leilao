# 🚀 Passo 07 — Script de Seeds e Deploy no Render

## 🎯 Objetivo
Garantir o cumprimento dos requisitos de teste inicial (dados semeados) e colocar a aplicação no ar no Render.

---

## 📋 Checklist de Execução

### 1. Script de Dados de Teste (`packages/backend/src/seeds.js`)
* [x] `npm run seed` inicializa o schema e cria/atualiza o leiloeiro `leiloeiro@verzel.com` e os licitantes `cliente1@verzel.com` e `cliente2@verzel.com` (senha `123456`).
* [x] Cada licitante recebe carteira com R$ 5.000,00 de saldo total; repeticoes preservam os saldos e os lotes existentes.
* [x] Um item fica no cache e um lote demonstrativo permanece publicado em estado `LIVE`.
* [x] Seed protegido por transacao e lock consultivo para execucoes concorrentes.

### 2. Preparação para o Deploy no Render
O CI esta em `.github/workflows/ci.yml`. O arquivo `render.yaml` configura o Static Site do frontend com raiz no monorepo, build do workspace, diretorio publicado e rewrite `/*` para `/index.html`, necessario para o React Router funcionar ao atualizar uma sub-rota. Defina `VITE_API_URL` no Render com a URL publica do backend terminada em `/api`. O provisionamento exige conectar o repositorio a uma conta Render.

* [ ] Publicar o codigo em um repositorio GitHub e conecta-lo ao Render.
* [ ] Criar PostgreSQL e configurar `DATABASE_URL` no servico backend, junto com `JWT_SECRET` e `EXTERNAL_ITEMS_API_URL`.
* [ ] Backend como Docker Web Service: Dockerfile `packages/backend/Dockerfile`, contexto `.` (raiz); ou como servico Node com Build `npm ci` e Start `npm run start --workspace=backend`.
* [ ] Execute `npm run seed --workspace=backend` depois que o Postgres estiver acessivel. Em deploy, use um comando de pre-deploy/migracao ou execute uma vez manualmente; nao conecte a build ao banco.
* [ ] Frontend como Static Site via `render.yaml` ou manualmente: Build `npm ci && npm run build --workspace=frontend`; Publish Directory `packages/frontend/dist`; rewrite `/*` para `/index.html`; variavel `VITE_API_URL=https://<backend>.onrender.com/api`.
* [ ] Configure CORS no backend para permitir a origem do Static Site.

O backend respeita `PORT` e escuta em `0.0.0.0`, como esperado pelo ambiente de web services. Consulte a documentacao oficial do Render para [monorepos](https://render.com/docs/monorepo-support) e [web services](https://render.com/docs/web-services). O plano gratuito do PostgreSQL tem prazo de expiracao; confira os [limites atuais](https://render.com/docs/free) antes de usar para dados persistentes.
