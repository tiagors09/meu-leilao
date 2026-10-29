import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAdminViewModel } from './useadmin.viewmodel'

const { get, patch, post, remove } = vi.hoisted(() => ({ get: vi.fn(), patch: vi.fn(), post: vi.fn(), remove: vi.fn() }))
vi.mock('../../context/useAuth', () => ({ useAuth: () => ({ user: { id: 1, name: 'Admin Local', role: 'ADMIN' } }) }))
vi.mock('../../lib/api', () => ({
  default: { get, patch, post, delete: remove },
  apiEndpoints: {
    admin: {
      overview: '/admin/overview', users: '/admin/users', userRole: (id) => `/admin/users/${id}/role`,
      lots: '/admin/lots', lot: (id) => `/admin/lots/${id}`, openLot: (id) => `/admin/lots/${id}/open`, transactions: '/admin/transactions',
    },
    lots: { close: (id) => `/lots/${id}/close` },
  },
  getApiError: (error, fallback) => error?.response?.data?.error || fallback,
}))

function responseFor(path) {
  if (path === '/admin/overview') return { data: { metrics: { users_total: 3 } } }
  if (path === '/admin/users') return { data: { users: [{ id: 2, name: 'Lia', email: 'lia@example.com', role: 'LICITANTE' }], total: 1 } }
  if (path === '/admin/lots') return { data: { lots: [], total: 0 } }
  return { data: { transactions: [], total: 0 } }
}

describe('useAdminViewModel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    get.mockImplementation(async (path) => responseFor(path))
    patch.mockResolvedValue({ data: { user: {} } })
    post.mockResolvedValue({ data: { receipt: { share_code: 'recibo-local' } } })
    remove.mockResolvedValue({ data: {} })
  })

  it('carrega dados administrativos paginados e aplica filtro memoizado na lista', async () => {
    const { result } = renderHook(() => useAdminViewModel())
    await waitFor(() => expect(result.current.users).toHaveLength(1))
    expect(result.current.metrics.users_total).toBe(3)
    expect(result.current.visibleUsers[0].email).toBe('lia@example.com')
    expect(get).toHaveBeenCalledWith('/admin/users', { params: { search: '', page: 1, pageSize: 25 } })
  })

  it('altera papel via API e atualiza os dados exibidos', async () => {
    const { result } = renderHook(() => useAdminViewModel())
    await waitFor(() => expect(result.current.users).toHaveLength(1))

    await act(async () => result.current.changeUserRole(2, 'LEILOEIRO'))

    expect(patch).toHaveBeenCalledWith('/admin/users/2/role', { role: 'LEILOEIRO' })
    expect(result.current.notice).toBe('Papel do usuario atualizado.')
  })

  it('encerra lote somente depois da confirmacao e atualiza metricas/transacoes', async () => {
    const { result } = renderHook(() => useAdminViewModel())
    await waitFor(() => expect(result.current.metrics).not.toBeNull())

    act(() => result.current.openLotConfirmation({ id: 5, title: 'Lote local' }))
    await act(async () => result.current.closeLot())

    expect(post).toHaveBeenCalledWith('/lots/5/close')
    expect(result.current.confirmLot).toBeNull()
    expect(result.current.notice).toContain('recibo-local')
  })

  it('cria lote pela API administrativa e recarrega a listagem', async () => {
    const { result } = renderHook(() => useAdminViewModel())
    await waitFor(() => expect(result.current.metrics).not.toBeNull())
    act(() => result.current.openLotEditor())
    const draft = { item_id: '12', title: 'Relogio', initial_price: '100', min_increment: '5', start_time: '2027-01-01T10:00', end_time: '2027-01-01T11:00' }
    for (const [name, value] of Object.entries(draft)) act(() => result.current.setLotDraft(name, value))
    await act(async () => result.current.saveLot({ preventDefault: vi.fn() }))
    expect(post).toHaveBeenCalledWith('/admin/lots', expect.objectContaining({ item_id: 12, title: 'Relogio' }))
    expect(result.current.notice).toBe('Lote criado.')
  })

  it('abre e remove lotes usando as rotas administrativas', async () => {
    const { result } = renderHook(() => useAdminViewModel())
    await waitFor(() => expect(result.current.metrics).not.toBeNull())
    await act(async () => result.current.runLotAction({ id: 9 }, 'open'))
    expect(post).toHaveBeenCalledWith('/admin/lots/9/open')
    await act(async () => result.current.runLotAction({ id: 9 }, 'delete'))
    expect(remove).toHaveBeenCalledWith('/admin/lots/9')
  })
})
