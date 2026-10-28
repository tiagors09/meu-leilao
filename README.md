# 🔨 Sistema de Leilão (Monorepo)

Este é um projeto de teste técnico que implementa uma plataforma de leilão utilizando **Node.js + Express** no backend, **React** no frontend e **PostgreSQL** como banco de dados.

O projeto está estruturado em formato de **Monorepo** usando npm workspaces e totalmente containerizado com **Docker** e **Docker Compose**.

---

## 🛠️ Tecnologias Utilizadas

- **Monorepo:** npm workspaces
- **Backend:** Node.js, Express, PostgreSQL (`pg`)
- **Frontend:** React (Vite)
- **Banco de Dados & Gestão:** PostgreSQL 16, pgAdmin 4
- **Containerização:** Docker & Docker Compose

---

## 📁 Estrutura do Monorepo

```text
meu-leilao/
├── packages/
│   ├── backend/         # API Node.js + Express + Dockerfile
│   ├── frontend/        # Aplicação React + Dockerfile
│   └── shared/          # Constantes e tipos compartilhados
├── docker-compose.yml   # Orquestrador dos containers
├── .env.example         # Modelo das variáveis de ambiente
└── package.json         # Configuração dos npm workspaces

```

---

## 🚀 Como Executar o Projeto

### Pré-requisitos

Apenas o **[Docker](https://www.docker.com/)** e o **Docker Compose** precisam estar instalados na sua máquina.

### Passo a Passo

1. **Clone o repositório:**
```bash
git clone [https://github.com/seu-usuario/meu-leilao.git](https://github.com/seu-usuario/meu-leilao.git)
cd meu-leilao

```


2. **Configure as Variáveis de Ambiente:**
Crie o arquivo `.env` na raiz do projeto copiando o exemplo:
```bash
cp .env.example .env

```


*(As configurações padrão do `.env.example` já funcionam sem alterações para desenvolvimento local).*
3. **Suba os containers com o Docker Compose:**
```bash
docker compose up --build

```


4. **Acesse as aplicações:**
* **Frontend (React):** [http://localhost:5173](http://localhost:5173)
* **Backend API:** [http://localhost:3000](http://localhost:3000)
* **pgAdmin (Painel do Postgres):** [http://localhost:5050](http://localhost:5050)



---

## 🔑 Credenciais Padrão (.env)

* **PostgreSQL:**
* Host: `localhost` (ou `postgres` no Docker)
* Porta: `5432`
* Usuário: `postgres`
* Senha: `senha_segura_aqui`
* Banco: `leilao_db`


* **pgAdmin:**
* E-mail: `admin@admin.com`
* Senha: `admin_senha_aqui`
