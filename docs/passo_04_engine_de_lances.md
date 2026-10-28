# ⚡ Passo 04 — Engine de Lances, Anti-Sniping e Saldo Comprometido

## 🎯 Objetivo
Implementar o motor central de validação de lances, bloqueio de saldo, estorno automático do antigo líder e prorrogação de tempo.

---

## 📋 Checklist de Execução

### 1. Algoritmo de Processamento do Lance (`BidService.js`)
Ao receber `POST /api/lots/:id/bids` com `{ amount }` do licitante autenticado:

1. **Validação de Status e Horário:**
   * Verificar se o lote está com status `'LIVE'` e se o horário atual está entre `start_time` e `end_time`.
2. **Validação de Valor:**
   * Se for o 1º lance: `amount >= initial_price`.
   * Se já houver lances: `amount >= highest_bid + min_increment`.
3. **Validação de Regras do Licitante:**
   * Garantir que `req.user.role === 'LICITANTE'`.
   * Verificar se o licitante líder atual **não é** quem está tentando cobrir o próprio lance.
4. **Validação de Saldo Disponível:**
   * Verificar se `wallets.balance_total - wallets.balance_pledged >= amount`.

### 2. Transação Financeira no Banco de Dados
Executar via `BEGIN` e `COMMIT` SQL:
* [ ] **Descomprometer saldo do antigo líder:**
  * Atualizar a carteira do antigo líder subtraindo o valor do lance anterior do `balance_pledged`.
* [ ] **Comprometer saldo do novo líder:**
  * Atualizar a carteira do novo líder somando o `amount` do lance atual ao `balance_pledged`.
* [ ] **Inserir o novo lance na tabela `bids`.**

### 3. Anti-Sniping (Prorrogação Dinâmica)
* [ ] Verificar se faltam menos de 2 minutos para o `end_time` do lote.
* [ ] Se sim: atualizar `end_time = end_time + 2 minutos` na tabela `auction_lots`.