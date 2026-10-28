# Guia de Padronização de Commits (Conventional Commits)

Este guia define o padrão obrigatório de mensagens de commit para o repositório do projeto de leilões online (teste Verzel). O objetivo é manter o histórico do Git limpo, profissional e fácil de auditar.

---

## 1. Estrutura do Commit

Todas as mensagens devem seguir a estrutura:

<tipo>(<escopo>): <descrição em português e sem acento>

---

## 2. Tipos Permitidos

- `feat`: Nova funcionalidade (ex: cadastro de usuário, motor de lances, rota de JWT).
- `fix`: Correção de bug (ex: ajuste no cálculo de saldo retido, correção de SQL query).
- `docs`: Alterações na documentação (ex: README, guias .md, instruções de setup).
- `style`: Formatação, ponto e vírgula, sem alteração de regra de negócio (ESLint, Prettier).
- `refactor`: Refatoração de código sem alterar comportamento ou criar funcionalidade.
- `test`: Adição ou ajuste de testes.
- `chore`: Atualização de dependências, configurações do monorepo, scripts do `package.json`.

---

## 3. Escopos do Monorepo

- `backend`: Alterações no `packages/backend` (controllers, services, repositories, db).
- `frontend`: Alterações no `packages/frontend` (componentes, telas, rotas React).
- `monorepo`: Alterações no `package.json` raiz, ESLint ou workspaces.

---

## 4. Exemplos Práticos por Etapa

### Etapa 1: Setup e Banco
- `chore(monorepo): configura npm workspaces e eslint flat config`
- `feat(backend): adiciona conexao postgresql e script inicial init.sql`
- `docs(monorepo): adiciona documentacao tatica de execucao`

### Etapa 2: Autenticação e Carteira
- `feat(backend): implementa cadastro de usuario com hash de senha`
- `feat(backend): cria autenticacao jwt e middleware de permissao por role`
- `feat(backend): adiciona endpoint para deposito e consulta de carteira`

### Etapa 3: Lotes e API Externa
- `feat(backend): adiciona integracao com api externa e cache de itens`
- `feat(backend): cria endpoints de cadastro e listagem de lotes`

### Etapa 4: Motor de Lances e Auditoria
- `feat(backend): implementa regra de lance com trava de saldo e anti-sniping`
- `feat(backend): adiciona geracao de hash sha-256 para auditoria de lances`

### Etapa 5: Front-end React
- `feat(frontend): cria tela de login e cadastro com armazenamento de token`
- `feat(frontend): implementa sala de lance ao vivo com polling automatico`
- `feat(frontend): cria pagina publica de auditoria de hash`

---

## 5. Regras Importantes para o Agente de IA

1. Faça commits **pequenos e frequentes** para refletir uma evolução natural do código.
2. NUNCA faça um único commit com o projeto inteiro pronto.
3. Mantenha todas as mensagens em **português e sem acentos**.