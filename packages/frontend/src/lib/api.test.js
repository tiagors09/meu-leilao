import { afterEach, describe, expect, it } from 'vitest'
import api, { apiEndpoints, getApiError, resolveApiBaseUrl } from './api'

describe('cliente HTTP', () => {
  afterEach(() => localStorage.clear())

  it('injeta o JWT da sessao no cabecalho Authorization', () => {
    localStorage.setItem('leilao_token', 'token-teste')
    const interceptor = api.interceptors.request.handlers[0].fulfilled
    const config = interceptor({ headers: {} })
    expect(config.headers.Authorization).toBe('Bearer token-teste')
  })

  it('usa mensagem do servidor ou fallback para falhas HTTP', () => {
    expect(getApiError({ response: { data: { error: 'Saldo insuficiente.' } } }, 'Falha')).toBe('Saldo insuficiente.')
    expect(getApiError({}, 'Falha')).toBe('Falha')
  })

  it('normaliza a URL base para incluir /api uma unica vez', () => {
    expect(resolveApiBaseUrl('https://api.example.com', false)).toBe('https://api.example.com/api')
    expect(resolveApiBaseUrl('https://api.example.com/api/', false)).toBe('https://api.example.com/api')
    expect(resolveApiBaseUrl('', false)).toBe('/api')
    expect(resolveApiBaseUrl('', true)).toBe('http://localhost:3000/api')
  })

  it('mapeia caminhos exatamente como as rotas do backend', () => {
    expect(apiEndpoints.users).toEqual({ login: '/users/login', register: '/users/register' })
    expect(apiEndpoints.wallets).toEqual({ me: '/wallets/me', deposit: '/wallets/deposit' })
    expect(apiEndpoints.items.search).toBe('/external-items/search')
    expect(apiEndpoints.lots).toMatchObject({ collection: '/lots' })
    expect(apiEndpoints.lots.item(3)).toBe('/lots/3')
    expect(apiEndpoints.lots.bids(3)).toBe('/lots/3/bids')
    expect(apiEndpoints.lots.audit(3)).toBe('/lots/3/audit')
    expect(apiEndpoints.lots.close(3)).toBe('/lots/3/close')
    expect(apiEndpoints.receipts.me).toBe('/receipts/me')
    expect(apiEndpoints.admin.overview).toBe('/admin/overview')
    expect(apiEndpoints.admin.userRole(9)).toBe('/admin/users/9/role')
    expect(apiEndpoints.admin.lots).toBe('/admin/lots')
    expect(apiEndpoints.admin.transactions).toBe('/admin/transactions')
  })
})
