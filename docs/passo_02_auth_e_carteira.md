# 🔐 Passo 02 — Autenticação e Gestão de Carteira

## 🎯 Objetivo
Criar as rotas de login/cadastro com JWT (suportando os perfis ADMIN, LEILOEIRO e LICITANTE) e controle do saldo da carteira.

---

## 📋 Checklist de Execução

### 1. Autenticação e JWT
* [ ] **`UserRepository.js`**:
  * Implementar `findByEmail(email)`.
  * Implementar `createUser({ name, email, passwordHash, role })` (executando em transação para criar a linha em `wallets` com saldo 0).
* [ ] **`UserService.js`**:
  * Validar e registrar usuário com `bcrypt.hash()`.
  * Validar login comparando senhas com `bcrypt.compare()` e emitir token JWT assinado (`jsonwebtoken`).
* [ ] **`authMiddleware.js`**:
  * Extrair token dos headers (`Authorization: Bearer <token>`).
  * Decodificar token e injetar `req.user` (`id`, `role`).
  * Criar middleware secundário de verificação de papel (ex: `checkRole(['LEILOEIRO', 'ADMIN'])`).

### 2. Módulo de Carteira (`WalletService.js`)
* [ ] **`POST /api/wallets/deposit`** (Apenas para `LICITANTE`):
  * Receber o valor simulado e somar ao `balance_total`.
* [ ] **`GET /api/wallets/me`**:
  * Retornar `balance_total`, `balance_pledged` e calcular em tempo de execução `balance_available = balance_total - balance_pledged`.