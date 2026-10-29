export const ADMIN_ROLES = Object.freeze(['ADMIN', 'LEILOEIRO', 'LICITANTE'])
export const ADMIN_TABS = Object.freeze([
  { id: 'overview', label: 'Metricas gerais' },
  { id: 'users', label: 'Gestao de usuarios' },
  { id: 'lots', label: 'Lotes e transacoes' },
])
export const ADMIN_PAGE_SIZE = 25

export const initialAdminState = {
  activeTab: 'overview',
  loading: true,
  error: '',
  notice: '',
  metrics: null,
  users: [],
  usersTotal: 0,
  usersPage: 1,
  usersSearch: '',
  usersLoading: false,
  lots: [],
  lotsTotal: 0,
  lotsPage: 1,
  lotsSearch: '',
  lotsLoading: false,
  transactions: [],
  transactionsTotal: 0,
  transactionsPage: 1,
  transactionsLoading: false,
  pendingRoleId: null,
  pendingLotId: null,
  confirmLot: null,
}

export function adminReducer(state, action) {
  switch (action.type) {
    case 'tab-changed': return { ...state, activeTab: action.tab, error: '', notice: '' }
    case 'request-started': return { ...state, [action.key]: true, error: '' }
    case 'request-failed': return { ...state, [action.key]: false, loading: false, error: action.message }
    case 'overview-loaded': return { ...state, metrics: action.metrics, loading: false }
    case 'users-loaded': return { ...state, users: action.users, usersTotal: action.total, usersLoading: false, loading: false }
    case 'lots-loaded': return { ...state, lots: action.lots, lotsTotal: action.total, lotsLoading: false, loading: false }
    case 'transactions-loaded': return { ...state, transactions: action.transactions, transactionsTotal: action.total, transactionsLoading: false, loading: false }
    case 'users-search': return { ...state, usersSearch: action.value, usersPage: 1 }
    case 'lots-search': return { ...state, lotsSearch: action.value, lotsPage: 1 }
    case 'page-changed': return { ...state, [`${action.collection}Page`]: action.page }
    case 'role-change-started': return { ...state, pendingRoleId: action.id, error: '', notice: '' }
    case 'role-change-finished': return { ...state, pendingRoleId: null }
    case 'lot-confirmation-opened': return { ...state, confirmLot: action.lot }
    case 'lot-confirmation-closed': return { ...state, confirmLot: null }
    case 'lot-close-started': return { ...state, pendingLotId: action.id, error: '', notice: '' }
    case 'lot-close-finished': return { ...state, pendingLotId: null, confirmLot: null }
    case 'notice': return { ...state, notice: action.message, error: '' }
    default: return state
  }
}

export function filterAdminRows(rows, search, keys) {
  const normalized = search.trim().toLocaleLowerCase('pt-BR')
  if (!normalized) return rows
  return rows.filter((row) => keys.some((key) => String(row[key] ?? '').toLocaleLowerCase('pt-BR').includes(normalized)))
}
