import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useAccessViewModel } from './useaccess.viewmodel'

const { signIn, signUp } = vi.hoisted(() => ({ signIn: vi.fn(), signUp: vi.fn() }))
vi.mock('../../context/useAuth', () => ({ useAuth: () => ({ signIn, signUp }) }))

describe('useAccessViewModel', () => {
  it('envia credenciais de login e fecha o modal ao autenticar', async () => {
    const onClose = vi.fn()
    const { result } = renderHook(() => useAccessViewModel(onClose))
    act(() => {
      result.current.updateField('email', 'ana@example.com')
      result.current.updateField('password', 'segredo123')
    })
    await act(async () => result.current.submit({ preventDefault: vi.fn() }))
    expect(signIn).toHaveBeenCalledWith({ email: 'ana@example.com', password: 'segredo123' })
    expect(onClose).toHaveBeenCalledOnce()
    expect(result.current.busy).toBe(false)
  })

  it('registra conta como licitante e exibe erro da API', async () => {
    const onClose = vi.fn()
    signUp.mockRejectedValueOnce({ response: { data: { error: 'Email ja cadastrado.' } } })
    const { result } = renderHook(() => useAccessViewModel(onClose))
    act(() => result.current.toggleMode())
    act(() => {
      result.current.updateField('name', 'Ana')
      result.current.updateField('email', 'ana@example.com')
      result.current.updateField('password', 'segredo123')
    })
    await act(async () => result.current.submit({ preventDefault: vi.fn() }))
    expect(signUp).toHaveBeenCalledWith({ name: 'Ana', email: 'ana@example.com', password: 'segredo123', role: 'LICITANTE' })
    expect(result.current.error).toBe('Email ja cadastrado.')
    expect(onClose).not.toHaveBeenCalled()
  })
})
