import axios from 'axios'

export function resolveApiBaseUrl(configuredUrl, isDevelopment = import.meta.env.DEV) {
  const configured = typeof configuredUrl === 'string' ? configuredUrl.trim() : ''
  const base = configured || (isDevelopment ? 'http://localhost:3000' : '')
  if (!base) return '/api'

  const normalized = base.replace(/\/+$/, '')
  return /\/api$/i.test(normalized) ? normalized : `${normalized}/api`
}

export const apiEndpoints = Object.freeze({
  users: Object.freeze({ login: '/users/login', register: '/users/register' }),
  wallets: Object.freeze({ me: '/wallets/me', deposit: '/wallets/deposit' }),
  items: Object.freeze({ search: '/external-items/search' }),
  lots: Object.freeze({
    collection: '/lots',
    item: (id) => `/lots/${id}`,
    bids: (id) => `/lots/${id}/bids`,
    audit: (id) => `/lots/${id}/audit`,
    close: (id) => `/lots/${id}/close`,
  }),
  receipts: Object.freeze({ me: '/receipts/me' }),
  admin: Object.freeze({
    overview: '/admin/overview',
    users: '/admin/users',
    userRole: (id) => `/admin/users/${id}/role`,
    lots: '/admin/lots',
    lot: (id) => `/admin/lots/${id}`,
    openLot: (id) => `/admin/lots/${id}/open`,
    transactions: '/admin/transactions',
  }),
})

const api = axios.create({
  baseURL: resolveApiBaseUrl(import.meta.env.VITE_API_URL),
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('leilao_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export function getApiError(error, fallback = 'Nao foi possivel concluir a solicitacao.') {
  return error.response?.data?.error || fallback
}

export function money(value) {
  return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function dateTime(value) {
  if (!value) return 'Data nao informada'
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

export default api
