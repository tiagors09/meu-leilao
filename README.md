# Verzel Leilao

Monorepo de uma plataforma de leiloes criada como desafio tecnico para a Verzel. O sistema permite publicar lotes, receber lances com reserva de saldo, acompanhar a disputa, encerrar lotes e consultar auditoria e recibos.

> Este repositorio registra um MVP academico/tecnico. A documentacao descreve o codigo atual e aponta limitacoes que precisam ser resolvidas antes de tratar o sistema como um servico financeiro ou de producao.

## Origem e proposta

O projeto partiu do teste tecnico Verzel Leilao e foi desenvolvido em etapas: autenticacao e carteira, catalogo externo, lotes, motor transacional de lances, auditoria/liquidacao, interface web e preparacao para deploy. A proposta e demonstrar um fluxo de leilao ponta a ponta usando separacao entre camadas e persistencia em PostgreSQL.

## Colaboracao com inteligencia artificial

O desenvolvimento contou com uma dupla de apoio de IA, conforme o relato do projeto:

- **Gemini** atuou como arquiteto e consultor estrategico em tempo real, apoiando decisoes de arquitetura, DevOps/deploy, investigacao de rotas SPA, erros 500 no Render, alinhamento de CORS/CSP, direcao visual Neubrutalista e elaboracao de prompts.
- **Codex** apoiou a leitura e varredura do repositorio, implementacao e refatoracao de codigo, rotas, templates Pug, configuracoes e ajustes diretos nos pacotes.

As IAs foram ferramentas de apoio ao desenvolvimento. O historico de commits registra alteracoes de codigo e documentacao, mas nao prova sozinho a autoria de cada decisao ou a causa de incidentes externos.

## Arquitetura e tecnologias

| Camada | Tecnologias e responsabilidades |
| --- | --- |
| Monorepo | npm workspaces, `packages/backend`, `packages/frontend` e `packages/shared` |
| Backend | Node.js, Express, JWT, bcrypt, Swagger/OpenAPI e Pug para a pagina de status |
| Dados | PostgreSQL 16, `pg`, schema aplicado no boot e seeds demonstrativas |
| Frontend | React, Vite, React Router DOM, Axios e Tailwind CSS 4 |
| Interface | Design System reutilizavel, arquitetura MVVM por feature e estetica Neubrutalista |
| Infraestrutura | Docker, Docker Compose, GitHub Actions e configuracao de Static Site no Render |

Os repositories recebem a conexao por injecao no ponto de composicao; services e controllers recebem suas dependencias por construtor. Lances sao processados em transacao, com bloqueio do lote/carteiras e cadeia SHA-256. A interface consulta a sala do lote por polling a cada 3 segundos; nao ha canal de push via WebSocket/SSE.

## Perfis, permissoes e contas de demonstracao

Os papeis aceitos no banco e nos JWTs sao `ADMIN`, `LEILOEIRO` e `LICITANTE` (comprador). As rotas protegidas verificam papel no backend.

| Perfil | Capacidades registradas no backend |
| --- | --- |
| `ADMIN` | Acessa o painel de metricas, usuarios, papeis, lotes e liquidacoes; tambem pode criar e encerrar lotes. |
| `LEILOEIRO` | Pode criar lotes e encerrar lotes. O fluxo de edicao/abertura administrativa nao esta implementado como operacao separada. |
| `LICITANTE` | Pode consultar carteira, fazer deposito simulado, enviar lances e consultar recibos proprios. A auditoria publica e a consulta de recibo por codigo nao exigem login. |

Ao executar as seeds, ficam disponiveis estas contas locais de demonstracao:

| Email | Perfil | Senha | Saldo inicial |
| --- | --- | --- | ---: |
| `leiloeiro@verzel.com` | `LEILOEIRO` | `123456` | R$ 0,00 |
| `cliente1@verzel.com` | `LICITANTE` | `123456` | R$ 5.000,00 |
| `cliente2@verzel.com` | `LICITANTE` | `123456` | R$ 5.000,00 |

As credenciais sao publicas e exclusivas para desenvolvimento/demonstracao. O endpoint de registro cria somente `LICITANTE` e exige senha de pelo menos 8 caracteres. A atribuicao de `ADMIN` ou `LEILOEIRO` ocorre pelo painel autenticado como `ADMIN`; o primeiro administrador precisa ser provisionado diretamente no banco por um operador confiavel.

Para criar o primeiro administrador de teste em uma instancia local controlada, promova uma conta existente diretamente no banco (o exemplo usa o primeiro licitante semeado):

```bash
docker compose exec postgres psql -U postgres -d leilao_db \
  -c "UPDATE users SET role = 'ADMIN' WHERE email = 'cliente1@verzel.com';"
```

Faca login novamente com `cliente1@verzel.com` depois da alteracao. O backend consulta o papel atual no banco em requisicoes autenticadas. Nao use essa conta nem os dados de seed em producao.

## Analise sincera

### O que esta implementado

- Monorepo com separacao entre backend, frontend e pacote compartilhado.
- Cadastro/login, JWT, papeis, carteira e deposito simulado.
- Cache local de itens externos, criacao/listagem/detalhes de lotes e lances com saldo comprometido.
- Fechamento e liquidacao do lote, recibos e verificacao publica da cadeia de hashes.
- Swagger interativo em `/api-docs/` e especificacao JSON em `/api-docs.json`.
- Pagina de status do backend renderizada por Pug com visual Neubrutalista.
- Painel administrativo `/admin` com metricas, usuarios/papeis, lotes, lances e recibos; endpoints protegidos no servidor.
- Schema aplicado antes de abrir o listener HTTP, usando `CREATE TABLE IF NOT EXISTS` e lock consultivo.
- Fallback do Render `/* -> /index.html` para as rotas do React Router.
- Testes Jest/Cucumber no backend, Vitest no frontend e workflow CI com lint/build.

### Pontos de atencao e limitacoes

- O primeiro administrador ainda exige provisionamento direto no banco. Depois, os papeis podem ser gerenciados no painel protegido.
- A autorizacao consulta o papel atual no banco em cada requisicao protegida para aplicar alteracoes de cargo imediatamente; isso adiciona uma leitura por requisicao e pode ser otimizado com cache/revogacao de tokens em uma etapa futura.
- A rotina automatica cria objetos ausentes do schema atual, mas nao e um sistema de migracoes versionadas: alteracoes futuras em tabelas existentes exigem uma estrategia de migracao.
- A sala usa polling de 3 segundos. Nao oferece latencia/entrega em tempo real por WebSocket ou SSE.
- Validacoes existem em varios services, mas ainda falta uma politica uniforme e estrita para todo payload, limites, normalizacao e erros do banco.
- `VITE_API_URL` tem fallback para `http://localhost:3000` em desenvolvimento e `/api` em producao. O fallback de producao so funciona se frontend e API compartilharem origem ou houver proxy; no Render separado, configure a URL publica do backend.
- O CORS Express esta aberto por padrao (`cors()` sem allowlist). Restrinja as origens antes de producao.
- Credenciais de seed, saldo simulado e senhas curtas sao para demonstracao. Depositos nao representam transacao financeira real.
- A configuracao Render presente define o Static Site do frontend; backend e PostgreSQL precisam ser provisionados/configurados separadamente.

### Roadmap sugerido

1. Criar um fluxo controlado de provisionamento do primeiro administrador sem acesso manual ao banco.
2. Introduzir migracoes versionadas e validacao de payload padronizada (por exemplo, schemas na borda HTTP).
3. Implementar WebSockets ou Socket.IO para atualizacao de lances ao vivo e revisar escala/concorrencia.
4. Adicionar upload de imagens para S3/Cloudinary, com validacao e politica de acesso.
5. Avaliar autenticacao social, 2FA, rate limiting, observabilidade e trilha de auditoria administrativa.

## Instalar e executar localmente

### Requisitos

- Node.js 22 e npm compativel com workspaces.
- Docker e Docker Compose para executar PostgreSQL e, opcionalmente, toda a aplicacao.

### Execucao integral com Docker Compose

```bash
git clone <url-do-repositorio>
cd meu-leilao
cp .env.example .env
docker compose up --build
```

O Compose publica frontend em `http://localhost:5173`, backend em `http://localhost:3000` e pgAdmin em `http://localhost:5050`. O banco fica em `localhost:5432`; as credenciais locais padrao estao no `.env.example`. O backend cria as tabelas no boot. Para carregar contas e lote demonstrativo:

```bash
docker compose exec backend npm run seed
```

Seeds sao idempotentes quanto aos usuarios, item e lote demonstrativo; saldos preexistentes sao preservados.

### Execucao dos pacotes fora do Docker

```bash
npm ci
docker compose up -d postgres
cp packages/backend/.env.example packages/backend/.env
cp packages/frontend/.env.example packages/frontend/.env
npm run seed --workspace=backend
npm run dev --workspace=backend
```

Em outro terminal:

```bash
npm run dev --workspace=frontend
```

O `.env.example` da raiz documenta variaveis usadas pelo Docker Compose; os exemplos de cada pacote devem ser copiados para `.env` dentro daquele pacote ao executar processos locais fora do Compose. Edite `DATABASE_URL`, `JWT_SECRET` e `VITE_API_URL` quando a topologia for diferente da local. O valor padrao de `JWT_SECRET` e inseguro e nao deve ser reutilizado em producao. O frontend le `VITE_API_URL` durante o build.

### Testes e qualidade

```bash
npm test --workspace=backend
npm test --workspace=frontend
npm run lint --workspace=frontend
npm run build --workspace=frontend
```

O workflow `.github/workflows/ci.yml` executa testes, lint e build em pushes e pull requests para `main`.

## Deploy no Render

1. Crie um PostgreSQL no Render e um Web Service para o backend. Para Docker, a raiz de build e a raiz do monorepo e o Dockerfile e `packages/backend/Dockerfile`; alternativamente configure o servico Node com `npm ci` e `npm run start --workspace=backend`.
2. Configure `DATABASE_URL`, um `JWT_SECRET` forte, `PORT` (fornecido pelo Render) e, se necessario, `EXTERNAL_ITEMS_API_URL`. Restrinja CORS para a origem do frontend.
3. Aguarde o backend conectar e criar o schema. Execute `npm run seed --workspace=backend` uma vez contra esse banco se quiser contas demonstrativas; nao rode seeds com credenciais publicas em producao.
4. Crie ou conecte o Static Site definido em `render.yaml`. O build e `npm ci && npm run build --workspace=frontend`, o diretorio publicado e `packages/frontend/dist`, e a regra rewrite `/* -> /index.html` permite refresh nas rotas SPA.
5. Defina `VITE_API_URL` como a URL publica do backend terminada em `/api` e permita a origem do Static Site no CORS.

`render.yaml` descreve somente o frontend. Criacao de banco, backend, dominios, segredos e execucao de seeds dependem da configuracao da conta Render e nao sao realizados pelo arquivo.

## Guias por pacote e historico

- [Guia do backend](packages/backend/README.md)
- [Guia do frontend](packages/frontend/README.md)
- [Diario de desenvolvimento baseado nos commits](DEVELOPMENT_LOG.md)
- [Relatorio de progresso](PROGRESS_REPORT.md)
