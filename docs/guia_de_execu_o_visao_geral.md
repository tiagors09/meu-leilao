# 🎯 Guia de Execução Tática — Casa de Leilões Verzel

Este diretório contém os guias de execução diários divididos em módulos funcionais. Siga a ordem dos arquivos para garantir que os requisitos obrigatórios do teste técnico sejam entregues no prazo de 7 dias com deploy no Render e dados semeados.

---

## 🗂️ Índice dos Guias Táticos

1. **`01_SETUP_E_BANCO.md`** — Configuração do monorepo, variáveis de ambiente, PostgreSQL e script DDL.
2. **`02_AUTH_E_CARTEIRA.md`** — Rotas de cadastro com múltiplos perfis (`ADMIN`, `LEILOEIRO`, `LICITANTE`), JWT e movimentação de saldo.
3. **`03_API_EXTERNA_E_LOTES.md`** — Integração com API externa resiliente, cache em banco e criação/cancelamento de lotes.
4. **`04_ENGINE_DE_LANCES.md`** — Regras de negócio de lances, saldo comprometido, devolução automática e prorrogação anti-sniping.
5. **`05_AUDITORIA_E_HASH.md`** — Implementação da cadeia de integridade (SHA-256) e liquidação com comprovantes compartilháveis.
6. **`06_FRONTEND_REACT_VITE.md`** — Interface React + Vite: Vitrine, Sala ao Vivo (com Polling/WebSocket) e Painel do Leiloeiro.
7. **`07_SEEDS_E_DEPLOY_RENDER.md`** — Script de dados Iniciais (seeds) e checklist de deploy no Render.

---

> **Dica para uso com Copilot/Codex:** Copie as etapas de cada guia e cole como contexto/prompt nos seus assistentes de código para acelerar a escrita das funções e testes.