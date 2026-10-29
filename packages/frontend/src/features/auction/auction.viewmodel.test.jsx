import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuctionViewModel } from './useauction.viewmodel'

const { get } = vi.hoisted(() => ({ get: vi.fn() }))
vi.mock('../../lib/api', () => ({
  default: { get },
  apiEndpoints: { lots: { collection: '/lots' } },
  getApiError: (error, fallback) => error.response?.data?.error || fallback,
  money: (value) => `R$ ${Number(value).toFixed(2)}`,
  dateTime: (value) => value,
}))

describe('useAuctionViewModel', () => {
  beforeEach(() => get.mockReset())

  it('carrega lotes, calcula contagens e filtra por aba selecionada', async () => {
    get.mockResolvedValue({ data: { lots: [
      { id: 1, status: 'LIVE', title: 'Ao vivo', initial_price: 100, start_time: 'inicio', end_time: 'fim' },
      { id: 2, status: 'SCHEDULED', title: 'Agendado', initial_price: 50, start_time: 'inicio futuro', end_time: 'fim' },
      { id: 3, status: 'CLOSED', title: 'Encerrado', initial_price: 20, start_time: 'inicio', end_time: 'fim' },
    ] } })

    const { result } = renderHook(() => useAuctionViewModel())
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(get).toHaveBeenCalledWith('/lots')
    expect(result.current.counts).toEqual({ LIVE: 1, SCHEDULED: 1, CLOSED: 1 })
    expect(result.current.visibleLots[0]).toMatchObject({ isLive: true, numberLabel: '0001', statusTone: 'green' })
    act(() => result.current.setActiveTab('SCHEDULED'))
    expect(result.current.visibleLots[0]).toMatchObject({ title: 'Agendado', metricLabel: 'Inicio previsto' })
  })
})
