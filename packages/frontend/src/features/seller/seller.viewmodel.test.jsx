import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useSellerViewModel } from './useseller.viewmodel'

const { get } = vi.hoisted(() => ({ get: vi.fn() }))
vi.mock('../../lib/api', () => ({
  default: { get },
  apiEndpoints: {
    lots: { collection: '/lots', item: (id) => `/lots/${id}` },
    items: { search: '/external-items/search' },
  },
  getApiError: (error, fallback) => error.response?.data?.error || fallback,
  money: (value) => `R$ ${Number(value).toFixed(2)}`,
  dateTime: (value) => value,
}))
vi.mock('../../context/useAuth', () => ({ useAuth: () => ({ user: { id: 3, role: 'LEILOEIRO' } }) }))

describe('useSellerViewModel', () => {
  it('busca itens externos, permite selecionar um item e marca permissao de gestao', async () => {
    get.mockImplementation(async (path) => path === '/lots'
      ? { data: { lots: [] } }
      : { data: { source: 'cache', items: [{ id: 5, title: 'Camera antiga' }] } })
    const { result } = renderHook(() => useSellerViewModel())
    await waitFor(() => expect(get).toHaveBeenCalledWith('/lots'))
    act(() => { result.current.updateQuery('camera') })
    await act(async () => result.current.searchItems({ preventDefault: vi.fn() }))
    expect(get).toHaveBeenCalledWith('/external-items/search', { params: { q: 'camera' } })
    act(() => result.current.selectItem(result.current.items[0]))
    expect(result.current).toMatchObject({ canManage: true, selectedItem: { id: 5 }, form: { title: 'Camera antiga' } })
  })
})
