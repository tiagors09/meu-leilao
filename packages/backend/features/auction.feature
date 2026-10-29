# language: pt
Funcionalidade: Disputas de leilao e saldo da carteira
  Como licitante autenticado
  Quero depositar saldo e disputar lotes
  Para dar lances validos sem comprometer mais do que meu saldo disponivel

  Cenario: Depositar saldo na carteira
    Dado que minha carteira possui saldo total de 100 reais e nenhum valor comprometido
    Quando deposito 50 reais
    Entao o saldo total deve ser 150 reais
    E o saldo disponivel deve ser 150 reais

  Cenario: Aceitar lance valido e reservar saldo
    Dado que o lote ao vivo tem preco inicial de 100 reais e incremento minimo de 10 reais
    E que minha carteira possui saldo total de 500 reais e nenhum valor comprometido
    Quando dou um lance de 100 reais
    Entao o lance deve ser aceito
    E 100 reais devem ficar comprometidos

  Cenario: Rejeitar lance abaixo do valor minimo
    Dado que o lote ao vivo tem preco inicial de 100 reais e incremento minimo de 10 reais
    E que minha carteira possui saldo total de 500 reais e nenhum valor comprometido
    Quando dou um lance de 90 reais
    Entao o lance deve ser rejeitado por valor abaixo do minimo

  Cenario: Rejeitar lance sem saldo disponivel
    Dado que o lote ao vivo tem preco inicial de 100 reais e incremento minimo de 10 reais
    E que minha carteira possui saldo total de 50 reais e nenhum valor comprometido
    Quando dou um lance de 100 reais
    Entao o lance deve ser rejeitado por saldo insuficiente

  Cenario: Impedir que o lider cubra o proprio lance
    Dado que o lote ao vivo tem preco inicial de 100 reais e incremento minimo de 10 reais
    E que eu sou o lider com lance de 120 reais
    Quando dou um novo lance de 130 reais
    Entao o lance deve ser rejeitado por lideranca atual
