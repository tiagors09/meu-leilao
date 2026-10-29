# 💻 Passo 06 — Front-end com React, Vite, Tailwind CSS e Polling

## 🎯 Objetivo

Construir as telas do cliente e leiloeiro utilizando React + Vite + Tailwind CSS, com atualização em tempo real via Polling (consultas periódicas a cada 3 segundos).

---

## 📋 Checklist de Execução

### 1. Setup da Aplicação Front-end e Tailwind CSS

* [ ] Criar app com Vite em `packages/frontend`:
```bash
cd packages/frontend
npm create vite@latest . -- --template react
npm install axios react-router-dom
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

```


* [ ] Configurar o `tailwind.config.js` para varrer os arquivos `.jsx`/`.tsx`:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: {} },
  plugins: [],
}

```


* [ ] Adicionar as diretivas do Tailwind no arquivo de estilo principal (ex: `src/index.css` ou `src/App.css`):
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

```



### 2. Telas Obrigatórias com Estilização Tailwind

* [ ] **Vitrine (`/`):**
* Layout limpo em grid/flexbox com abas separadas por estado: Lotes **"Ao Vivo"** (badge verde animada), **"Agendados"** (badge amarela) e **"Encerrados"** (badge cinza).


* [ ] **Painel do Leiloeiro (`/leiloeiro`):**
* Input de busca integrado à API externa de itens.
* Formulário estruturado em cartões (`card`, `shadow`, `rounded-lg`).
* Tabela moderna exibindo os lotes cadastrados e o total arrecadado por lote.


* [ ] **Sala do Lote ao Vivo (`/lote/:id`):**
* Exibição em destaque do valor do lance atual, contagem regressiva e botão de "Dar Lance" com estados de loading e disabled.
* **Tempo Real Simples (Polling):** Utilizar `useEffect` com `setInterval` a cada 3 segundos para buscar os lances sem recarregar a página.
* Indicador visual dinâmico com cores do Tailwind: **"Você está ganhando"** (`bg-green-100 text-green-800 border-green-400`) ou **"Você foi superado"** (`bg-red-100 text-red-800 border-red-400`).


* [ ] **Carteira (`/carteira`):**
* Cards visuais exibindo o Saldo Total, Saldo Comprometido e Saldo Disponível.
* Modal ou formulário inline para depósito simulado com feedback visual imediato.


* [ ] **Página de Auditoria (`/auditoria/:id`):**
* Rota pública com linha do tempo (`timeline`) dos lances encadeados por hash SHA-256.
* Selo visual de destaque: **"Histórico Íntegro"** (com ícone e borda verde esmeralda).
