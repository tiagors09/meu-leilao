import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AdminGuard } from './admin.guard'

const { useAuth } = vi.hoisted(() => ({ useAuth: vi.fn() }))
vi.mock('../../context/useAuth', () => ({ useAuth }))

describe('AdminGuard', () => {
  it('mostra bloqueio para usuario autenticado sem papel ADMIN', () => {
    useAuth.mockReturnValue({ user: { role: 'LICITANTE' } })
    render(<AdminGuard><p>Conteudo administrativo</p></AdminGuard>)

    expect(screen.getByText('Acesso restrito')).toBeTruthy()
    expect(screen.queryByText('Conteudo administrativo')).toBeNull()
  })

  it('mostra entrada para visitante nao autenticado', () => {
    useAuth.mockReturnValue({ user: null })
    render(<AdminGuard><p>Conteudo administrativo</p></AdminGuard>)

    expect(screen.getByRole('button', { name: 'Entrar' })).toBeTruthy()
  })

  it('permite renderizar para ADMIN', () => {
    useAuth.mockReturnValue({ user: { role: 'ADMIN' } })
    render(<AdminGuard><p>Conteudo administrativo</p></AdminGuard>)
    expect(screen.getByText('Conteudo administrativo')).toBeTruthy()
  })
})
