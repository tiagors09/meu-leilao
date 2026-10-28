# Relatorio de Progresso e Ponto de Parada

## Status Atual
- Ultima funcionalidade concluida: conexao PostgreSQL, DDL inicial para seis tabelas com os tres perfis suportados e repositories de usuario/carteira com dependencia de banco injetada.
- Ultimo commit realizado: `docs(monorepo): atualiza relatorio do bloco inicial`.

## Estruturas e Interfaces Criadas
- `UserRepository(database)`: `findByEmail(email)` e `createUser(...)`; cria usuario e carteira em uma transacao.
- `WalletRepository(database)`: `findByUserId(userId)` e `increaseBalance(userId, amount)`.
- `database` deve expor a interface de `pg` com `query()` e `connect()`; nao ha importacao concreta do pool nos repositories.
- `pool` exportado por `src/config/db.js` para injecao no ponto de composicao.

## Proximo Passo Imediato
- Implementar o passo 02: `UserService`, autenticacao JWT, middleware de autorizacao e fluxo de deposito/consulta de carteira.
