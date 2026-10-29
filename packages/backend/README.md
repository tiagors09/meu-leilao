# Backend Verzel Leilao

## Documentacao da API

Inicie o backend e acesse `http://localhost:3000/api-docs/` para explorar e testar os endpoints documentados. O contrato OpenAPI em JSON fica em `http://localhost:3000/api-docs.json`. Operacoes autenticadas usam JWT Bearer.

## Validacao

- `npm test --workspace=backend`: Jest e Cucumber/Gherkin.
- `npm run test:unit --workspace=backend`: regras de negocio e contrato OpenAPI.
- `npm run test:gherkin --workspace=backend`: fluxos de deposito e disputa.
