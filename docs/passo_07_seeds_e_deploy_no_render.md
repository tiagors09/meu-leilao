# 🚀 Passo 07 — Script de Seeds e Deploy no Render

## 🎯 Objetivo
Garantir o cumprimento dos requisitos de teste inicial (dados semeados) e colocar a aplicação no ar no Render.

---

## 📋 Checklist de Execução

### 1. Script de Dados de Teste (`packages/backend/src/seeds.js`)
Criar um script executável (`npm run seed`) que preencha o banco limpo com:
* [ ] 1 Usuário `LEILOEIRO` (Email: `leiloeiro@verzel.com`, Senha: `123456`).
* [ ] 2 Usuários `LICITANTE` (Email: `cliente1@verzel.com`, `cliente2@verzel.com`, ambos com R$ 5.000 de saldo inicial simulado).
* [ ] 1 Lote Publicado no estado `'LIVE'` com lances abertos.

### 2. Preparação para o Deploy no Render
* [ ] Subir o código para um repositório público no GitHub.
* [ ] **Banco de Dados:** Criar uma instância de **PostgreSQL** gratuita no Render.
* [ ] **Back-end Web Service:**
  * Apontar para `packages/backend`.
  * Configurar a variável de ambiente `DATABASE_URL` do Postgres do Render.
  * Command de Start: `npm run start`.
  * Command de Build: `npm run seed` (para semear os dados automaticamente na inicialização).
* [ ] **Front-end Static Site:**
  * Apontar para `packages/frontend`.
  * Build Command: `npm run build`.
  * Publish Directory: `dist`.
  * Configurar variável com a URL do backend gerada no Render.