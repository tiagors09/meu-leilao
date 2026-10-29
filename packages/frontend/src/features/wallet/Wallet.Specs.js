/** @typedef {{ balance_total:number, balance_pledged:number, balance_available:number }} WalletBalance */
export const walletCards = Object.freeze([
  { key: 'balance_available', label: 'Saldo disponivel', tone: 'green', note: 'Pronto para seus proximos lances' },
  { key: 'balance_pledged', label: 'Saldo comprometido', tone: 'yellow', note: 'Reservado em disputas ativas' },
  { key: 'balance_total', label: 'Saldo total', tone: 'purple', note: 'Valor total da sua carteira' },
])
export const walletError = 'Entre na sua conta para consultar a carteira.'
