# 🛡️ Passo 05 — Integridade com Hash SHA-256 e Liquidação

## 🎯 Objetivo
Garantir o encerramento dos lotes, geração de comprovantes com link de compartilhamento e auditoria com cadeia de hashes à prova de adulteração.

---

## 📋 Checklist de Execução

### 1. Cadeia de Hash no Início do Lance (`BidRepository.js`)
* [ ] Buscar o último lance do lote para obter seu `hash`.
* [ ] Caso não haja lance anterior, definir `previous_hash = '0000000000000000000000000000000000000000000000000000000000000000'`.
* [ ] Calcular o novo hash usando o módulo `crypto` do Node.js:
  ```javascript
  import crypto from 'crypto';

  const rawData = `${lot_id}-${bidder_id}-${amount}-${created_at}-${previous_hash}`;
  const hash = crypto.createHash('sha256').update(rawData).digest('hex');
  ```
* [ ] Salvar `previous_hash` e `hash` na tabela `bids`.

### 2. Rota Pública de Auditoria (`GET /api/audit/lots/:id`)
* [ ] Rota acessível sem necessidade de login.
* [ ] Retornar o histórico de lances ocultando dados sensíveis dos licitantes (ex: reformatar nome para `"Licitante #102"`).
* [ ] Re-calcular a cadeia de hashes sequencialmente no backend e retornar uma flag: `{ is_tampered: false }` se todos os hashes baterem.

### 3. Liquidação e Comprovante (`ReceiptService.js`)
* [ ] Módulo/Worker de encerramento do lote quando `agora > end_time`:
  * Debitar o valor arrematado do `balance_total` e `balance_pledged` do vencedor.
  * Creditar o valor no `balance_total` do leiloeiro.
  * Gerar registro na tabela `receipts` com `share_code` único (`uuidv4`).
* [ ] Rota pública `GET /api/receipts/:share_code` para validação do comprovante.