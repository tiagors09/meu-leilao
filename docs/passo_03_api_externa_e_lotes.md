# 📦 Passo 03 — Cache da API Externa e Criação de Lotes

## 🎯 Objetivo
Integrar com uma API pública para buscar itens, salvar em cache local para tolerância a falhas e permitir que leiloeiros criem lotes.

---

## 📋 Checklist de Execução

### 1. Busca e Cache de Itens Externos
* [ ] Escolher uma API pública (ex: `https://pokeapi.co/api/v2/pokemon` ou `https://dummyjson.com/products`).
* [ ] **`ItemService.js`**:
  * Endpoint `GET /api/external-items/search?q=...` para consultar a API externa.
  * Quando o leiloeiro seleciona um item para leiloar, persista na tabela `items` (`id_externo`, `title`, `image_url`, `raw_payload`).
  * **Resiliência:** Se a API pública falhar, as rotas de vitrine do leilão devem ler exclusivamente do cache da tabela `items` do banco de dados local.

### 2. Gestão de Lotes (`AuctionLotService.js`)
* [ ] **`POST /api/lots`** (Restrito a `LEILOEIRO` / `ADMIN`):
  * Campos: `item_id`, `title`, `initial_price`, `min_increment`, `start_time`, `end_time`.
  * Status inicial: `'SCHEDULED'` se `start_time > agora` ou `'LIVE'` se já iniciado.
* [ ] **`DELETE /api/lots/:id/cancel`**:
  * Permitir cancelamento apenas se `bids.length === 0`. Alterar status para `'CANCELLED'`.
* [ ] **`GET /api/lots`**:
  * Retornar lista filtrável por status (`LIVE`, `SCHEDULED`, `CLOSED`).