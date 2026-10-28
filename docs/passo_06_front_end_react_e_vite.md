# 💻 Passo 06 — Front-end com React, Vite e Polling

## 🎯 Objetivo
Construir as telas do cliente e leiloeiro utilizando React + Vite, com atualização em tempo real via Polling (consultas Periódicas).

---

## 📋 Checklist de Execução

### 1. Setup da Aplicação Front-end
* [ ] Criar app com Vite em `packages/frontend`:
  ```bash
  npm create vite@latest . -- --template react
  npm install axios react-router-dom
  ```

### 2. Telas Obrigatórias
* [ ] **Vitrine (`/`):**
  * Abas separadas: Lotes "Ao Vivo", "Agendados" e "Encerrados".
* [ ] **Painel do Leiloeiro (`/leiloeiro`):**
  * Input de busca na API externa.
  * Formulário de cadastro de lote.
  * Tabela com total arrecadado por lote.
* [ ] **Sala do Lote ao Vivo (`/lote/:id`):**
  * Exibir valor do lance atual, contagem regressiva e botão "Dar Lance".
  * **Tempo Real Simples (Polling):** Utilizar `useEffect` com `setInterval` rodando a cada 3 segundos para atualizar a lista de lances sem recarregar a tela.
  * Exibir tag visual clara: **"Você está ganhando"** (verde) ou **"Você foi superado"** (vermelho).
* [ ] **Carteira (`/carteira`):**
  * Exibir Saldo Total, Saldo Comprometido e Saldo Disponível. Botão para depósito simulado.
* [ ] **Página de Auditoria (`/auditoria/:id`):**
  * Rota pública que exibe a linha do tempo dos lances e selo de **"Histórico Íntegro"**.