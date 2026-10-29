import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useAuditViewModel } from './useaudit.viewmodel'

const { get } = vi.hoisted(() => ({ get: vi.fn() }))
vi.mock('../../lib/api', () => ({
  default: { get },
  apiEndpoints: { lots: { audit: (id) => `/lots/${id}/audit` } },
  getApiError: (error, fallback) => error.response?.data?.error || fallback,
  money: (value) => `R$ ${Number(value).toFixed(2)}`,
  dateTime: (value) => value,
}))

describe('useAuditViewModel', () => {
  it('carrega a cadeia e prepara os elos com estado visual de integridade', async () => {
    get.mockResolvedValue({ data: {
      lot_id: 9, is_valid: true, is_tampered: false,
      chain: [{ id: 1, amount: 110, bidder: 'Licitante #2', created_at: 'data', previous_hash: 'zero', hash: 'abc', is_valid: true }],
    } })
    const { result } = renderHook(() => useAuditViewModel(9))

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(get).toHaveBeenCalledWith('/lots/9/audit')
    expect(result.current).toMatchObject({ isValid: true, entries: [{ order: 1, amountLabel: 'R$ 110.00', integrityLabel: 'Elo valido' }] })
  })

  it('mostra falha de auditoria e deixa o selo como invalido', async () => {
    get.mockResolvedValue({ data: { lot_id: 9, is_valid: false, is_tampered: true, chain: [] } })
    const { result } = renderHook(() => useAuditViewModel(9))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.isValid).toBe(false)
  })
})
