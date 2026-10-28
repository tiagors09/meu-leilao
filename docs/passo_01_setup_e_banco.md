# 🛠️ Passo 01 — Setup do Projeto e Banco de Dados

## 🎯 Objetivo
Estruturar o monorepo com npm workspaces e inicializar a estrutura relacional do PostgreSQL.

---

## 📋 Checklist de Execução

### 1. Monorepo e Dependências
* [ ] Inicializar o projeto raiz: `npm init -y`
* [ ] Configurar workspaces no `package.json` raiz:
  ```json
  "workspaces": [
    "packages/backend",
    "packages/frontend"
  ]
  ```
* [ ] No `packages/backend`, instalar as dependências principais:
  ```bash
  npm install express pg dotenv bcrypt jsonwebtoken cors
  npm install -D nodemon eslint
  ```

### 2. Conexão com PostgreSQL (`packages/backend/src/config/db.js`)
* [ ] Criar o pool de conexão exportável:
  ```javascript
  import pkg from 'pg';
  import dotenv from 'dotenv';
  dotenv.config();

  const { Pool } = pkg;
  export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  ```

### 3. Execução da DDL SQL
* [ ] Executar o script SQL contendo as tabelas: `users`, `wallets`, `items`, `auction_lots`, `bids`, `receipts`.
* [ ] Garantir que o campo `role` aceite `'ADMIN'`, `'LEILOEIRO'` e `'LICITANTE'`.