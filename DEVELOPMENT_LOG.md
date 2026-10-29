# Diario de desenvolvimento

Linha do tempo compilada de `git log --reverse --date=short --pretty=format:'%h %ad %s'`. Datas e assuntos abaixo refletem o historico local do repositorio em 29/10/2026; descricoes resumem os titulos dos commits e os marcos de codigo correspondentes.

## 28/10/2026 — estrutura e funcionalidades do leilao

1. `d95273f chore: init commit` — estrutura inicial do repositorio.
2. `3b0af2f docs(monorepo): atualiza relatorio do bloco inicial` — registro do ponto inicial.
3. `3efb2a4 feat(backend): implementa autenticacao e servicos de carteira` — cadastro/login e servicos de carteira.
4. `2878914 feat(backend): adiciona controllers e rotas protegidas` — controllers e rotas para autenticacao/carteira.
5. `fa2a0af chore(backend): configura dependencias de autenticacao` — dependencias de autenticacao.
6. `343e8b0 docs(monorepo): registra conclusao do passo 02` — documentacao do marco.
7. `864b24d chore(backend): alinha postgres no docker compose` — PostgreSQL no ambiente Compose.
8. `4e49e8f test(backend): adiciona smoke test de usuario e carteira` — verificacao de persistencia de usuario/carteira.
9. `d1e1285 docs(monorepo): registra validacao do PostgreSQL e ponto de parada` — registro da validacao e estado do trabalho.
10. `50c8a0f feat(backend): integra catalogo externo com cache local` — busca de itens externos e cache.
11. `abe0a20 feat(backend): adiciona criacao e listagem de lotes` — servicos de lotes.
12. `43efdcf feat(backend): conecta rotas de itens e lotes` — endpoints de catalogo e lotes.
13. `d8646f6 docs(monorepo): registra conclusao do passo 03` — documentacao do marco.
14. `10a7a7e feat(backend): implementa lance transacional e saldo comprometido` — motor transacional de lances e reserva de saldo.
15. `92eceb7 feat(backend): adiciona endpoint autenticado de lances` — endpoint de lances protegido por papel.
16. `cdc7878 docs(monorepo): registra conclusao do passo 04` — documentacao do marco.

## 29/10/2026 — auditoria, interface, deploy e homologacao

17. `c4d147b feat(backend): implementa auditoria e liquidacao de lotes` — cadeia de hashes, encerramento, liquidacao e recibos.
18. `00da1dc feat(backend): expoe detalhes do lote e lance atual` — endpoint para sala de disputa.
19. `9b002fc feat(frontend): implementa experiencia web responsiva do leilao` — primeira interface React/Vite.
20. `efce624 docs(monorepo): registra conclusao do passo 06` — documentacao do frontend.
21. `e6febb2 chore(monorepo): corrige URL da API no Compose` — URL de API para a topologia Docker.
22. `0468af0 refactor(frontend): migra para design system neubrutalista pastel e mvvm` — separacao MVVM e Design System.
23. `1824e3a docs(monorepo): registra refatoracao MVVM do frontend` — registro da arquitetura frontend.
24. `787d54f refactor(frontend): padroniza nomes dos arquivos em minusculo` — nomes de arquivos consistentes com Linux.
25. `4dec627 feat(backend): adiciona seeds e testes de homologacao` — contas de demonstracao, dados e testes Gherkin.
26. `171b0e7 docs(monorepo): conclui documentacao do passo 07` — registro de seeds e deploy.
27. `dba941b docs: atualizado passo 6` — atualizacao de documentacao.
28. `1fbb7aa test(qa): adiciona testes unitarios, gherkin, regressao e swagger` — Swagger, Jest/Cucumber e testes frontend.
29. `6a66537 fix(backend): responde favicon com status 204` — resposta para requisicoes automaticas do favicon.
30. `1d66664 fix(backend): adiciona rota raiz, favicon 204 e ajuste de csp no helmet` — status raiz, favicon e diretiva de imagens CSP.
31. `56f6dbe fix(frontend): ajusta urls de consumo da api para respeitar o backend` — normalizacao da URL base e caminhos da API.
32. `0a5d3d6 feat(backend): adiciona pagina index com pug e botao para o swagger` — landing page dinamica do backend.
33. `a806d2c fix(frontend): configura fallback de rotas spa para evitar 404 no refresh` — rewrite de rotas no Static Site Render.
34. `386c576 chore: atualizado comando start` — ajuste do comando de inicializacao; a revisao posterior identificou e removeu a chamada a um arquivo de migracao inexistente.
35. `580daaf style(backend): aplica design neubrutalism autentico na pagina pug` — redesenho visual da pagina Pug.
36. `d266f55 fix(backend): executa criacao automatica de tabelas na inicializacao da conexao` — aplicacao do schema antes de abrir o listener e correcao do comando start.

### Nota sobre Render e o incidente 500

O historico nao contem um commit que nomeie literalmente “erro 500 no Render” nem permite deduzir sozinho a causa de um incidente de ambiente. O acompanhamento do projeto relata suporte do Gemini na investigacao de erros 500 e deploy. No codigo, a sequencia verificavel relacionada a disponibilidade/homologacao inclui correcao das URLs de API, rota raiz e CSP, pagina de status Pug, fallback SPA e inicializacao automatica do schema. Esta sequencia nao deve ser interpretada como prova de que qualquer uma dessas mudancas, isoladamente, resolveu um 500 especifico.

## Validacoes documentadas

- CI em `.github/workflows/ci.yml`: testes Jest/Cucumber e Vitest, lint e build frontend.
- Testes unitarios mais recentes apos a inicializacao automatica do banco: 18 testes em 8 suites aprovados; a conectividade com PostgreSQL e uma validacao separada, dependente de uma instancia acessivel.
- Seeds demonstrativas sao opcionais e devem ser executadas contra o banco escolhido; o comando de build nao executa seeds.

## Colaboracao de IA registrada pelo projeto

O relato de desenvolvimento atribui ao Gemini apoio de arquitetura, DevOps/deploy, investigacao de SPA/Render/CORS/CSP e direcao visual; e ao Codex varredura de codigo, refatoracoes, rotas, templates Pug e alteracoes nos repositorios. Essa atribuicao e contexto de colaboracao fornecido pelo projeto e nao e inferida dos metadados do Git.
