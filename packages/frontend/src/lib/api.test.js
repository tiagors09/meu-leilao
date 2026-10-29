import { afterEach, describe, expect, it } from 'vitest'
import api, { getApiError } from './api'

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
})
