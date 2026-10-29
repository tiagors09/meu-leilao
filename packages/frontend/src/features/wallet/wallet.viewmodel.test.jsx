import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useWalletViewModel } from './usewallet.viewmodel'

const { get, post } = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }))
vi.mock('../../lib/api', () => ({
  default: { get, post },
  getApiError: (error, fallback) => error.response?.data?.error || fallback,
  money: (value) => `R$ ${Number(value).toFixed(2)}`,
}))
vi.mock('../../context/useAuth', () => ({ useAuth: () => ({ user: { id: 1, name: 'Ana', role: 'LICITANTE' } }) }))

describe('useWalletViewModel', () => {
  it('carrega saldos e atualiza a carteira ao depositar', async () => {
    get.mockResolvedValue({ data: { balance_total: 500, balance_pledged: 100, balance_available: 400 } })
    post.mockResolvedValue({ data: { balance_total: 550, balance_pledged: 100, balance_available: 450 } })
    const { result } = renderHook(() => useWalletViewModel())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.balances.map(({ key, value }) => [key, value])).toEqual([
      ['balance_available', 'R$ 400.00'], ['balance_pledged', 'R$ 100.00'], ['balance_total', 'R$ 500.00'],
    ])

    act(() => result.current.setAmount('50'))
    await act(async () => result.current.deposit({ preventDefault: vi.fn() }))
    expect(post).toHaveBeenCalledWith('/wallets/deposit', { amount: '50' })
    expect(result.current.wallet.balance_available).toBe(450)
    expect(result.current.notice).toContain('Deposito simulado concluido')
    expect(result.current.amount).toBe('')
  })
})
