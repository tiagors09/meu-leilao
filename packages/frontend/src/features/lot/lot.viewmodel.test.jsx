import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useLotViewModel } from './uselot.viewmodel'

const { get, post } = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }))
vi.mock('../../lib/api', () => ({
  default: { get, post },
  getApiError: (error, fallback) => error.response?.data?.error || fallback,
  money: (value) => `R$ ${Number(value).toFixed(2)}`,
  dateTime: (value) => value,
}))
vi.mock('../../context/useAuth', () => ({ useAuth: () => ({ user: { id: 2, role: 'LICITANTE' } }) }))

describe('useLotViewModel', () => {
  it('consulta o lote, calcula lance minimo e identifica a lideranca', async () => {
    get.mockResolvedValue({ data: {
      id: 4, status: 'LIVE', start_time: new Date(Date.now() - 60_000).toISOString(), end_time: new Date(Date.now() + 600_000).toISOString(),
      initial_price: 100, min_increment: 10, current_bid: { bidder_id: 2, amount: 120 },
    } })
    const intervalSpy = vi.spyOn(window, 'setInterval')
    const { result, unmount } = renderHook(() => useLotViewModel(4))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current).toMatchObject({ amount: '130.00', minimum: '130.00', isLeader: true, isLive: true })
    expect(intervalSpy).toHaveBeenCalledWith(expect.any(Function), 3000)

    await act(async () => result.current.placeBid({ preventDefault: vi.fn() }))
    expect(post).toHaveBeenCalledWith('/lots/4/bids', { amount: '130.00' })
    expect(result.current.notice).toContain('Seu lance foi registrado')
    unmount()
  })
})
