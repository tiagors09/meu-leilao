# Frontend — Verzel Leilao

Interface React/Vite com React Router, Tailwind CSS 4, Axios centralizado e componentes visuais Neubrutalistas. Textos de produto estao em portugues; nomes de arquivos de features seguem sufixos em minusculo.

## Executar e configurar

Na raiz do monorepo:

```bash
cp packages/frontend/.env.example packages/frontend/.env
npm ci
npm run dev --workspace=frontend
```

Vite inicia por padrao em `http://localhost:5173`. Configure `VITE_API_URL` no arquivo `.env` do frontend, no ambiente de build do Render ou no Compose. A URL pode ser a origem do backend (`https://api.exemplo.com`) ou a base com `/api`; `resolveApiBaseUrl` normaliza para um unico `/api`.

Fallbacks do cliente HTTP (`src/lib/api.js`):

- Desenvolvimento sem variavel: `http://localhost:3000/api`.
- Producao sem variavel: `/api` na mesma origem do frontend.
- Render com frontend/backend separados: defina `VITE_API_URL=https://<backend>.onrender.com/api` durante o build. Sem isso, `/api` aponta ao Static Site e nao ao servico backend.

O Axios injeta `Bearer` usando `leilao_token` no `localStorage`. ViewModels leem as mensagens de erro `{ error }` da API e repassam estado de erro para as views.

## Rotas da interface

| Rota | Tela |
| --- | --- |
| `/` | Vitrine com filtros/abas de lotes |
| `/leiloeiro` | Painel de leiloeiro, busca de itens, criacao e encerramento de lotes |
| `/lote/:id` | Sala do lote, lance atual, contagem regressiva, envio de lance e polling de 3 segundos |
| `/carteira` | Saldo disponivel/comprometido/total e deposito simulado |
| `/auditoria/:id` | Timeline publica de hashes e integridade da cadeia |

Rotas desconhecidas mostram uma pagina interna de 404. O host estatico precisa entregar `index.html` ao atualizar uma rota client-side; `render.yaml` configura rewrite `/* -> /index.html` para o Render. Outros provedores precisam de uma regra equivalente.

## Organizacao MVVM

As features ficam em `src/features/<feature>/` e separam contratos, estado/regra e apresentacao:

- `*.specs.js`: estruturas/contratos consumidos pela tela (nao sao arquivos de teste Jest).
- `use*.viewmodel.js`: hooks ViewModel responsaveis por chamadas API, estados, validacoes, timers e mensagens.
- `*.view.jsx`: apresentacao; consome dados e callbacks do ViewModel.
- `*page.jsx`: composicao da View com seu hook.

Features implementadas: `auction`, `seller`, `lot`, `wallet`, `audit` e `auth`. O Design System em `src/design-system/` exporta `Button`, `Input`, `Card`, `Badge`, `Modal`, `Navbar` e `RouteLink`. As Views usam classes utilitarias Tailwind e componentes compartilhados.

## Testes e build

```bash
npm test --workspace=frontend
npm run lint --workspace=frontend
npm run build --workspace=frontend
```

Vitest e Testing Library cobrem contratos, chamadas/estados dos ViewModels, polling e elementos visuais. O build de producao gera `packages/frontend/dist`; o workflow CI executa testes, lint e build em pushes e pull requests para `main`.

## Render

O `render.yaml` configura um Static Site na raiz do monorepo: build `npm ci && npm run build --workspace=frontend`, publish path `packages/frontend/dist`, rewrite `/*` para `/index.html` e variavel `VITE_API_URL` a ser preenchida no provisionamento. A URL e incorporada ao bundle durante o build; atualiza-la exige novo build/deploy. O arquivo nao configura o backend, o PostgreSQL nem CORS.
