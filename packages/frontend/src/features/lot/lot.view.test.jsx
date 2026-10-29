import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import LotView from './lot.view'

describe('LotView', () => {
  it.each([
    ['Voce esta ganhando', 'bg-[#D1FAE5]'],
    ['Voce foi superado', 'bg-[#FECDD3]'],
  ])('mostra o estado de disputa %s com a cor correta', (label, toneClass) => {
    const vm = {
      loading: false,
      lot: { id: 4, title: 'Camera antiga', status: 'LIVE', current_bid: { bidder_id: 2 } },
      user: { id: label === 'Voce esta ganhando' ? 2 : 3, role: 'LICITANTE' },
      isLeader: label === 'Voce esta ganhando',
      isLive: true,
      currentPriceLabel: 'R$ 120,00',
      minimumLabel: 'R$ 130,00',
      minimum: '130.00',
      countdown: '00:10:00',
      incrementLabel: 'R$ 10,00',
      createdLabel: 'Hoje',
      endLabel: 'Hoje',
      amount: '130.00',
      setAmount: () => {},
      placeBid: () => {},
    }
    render(<MemoryRouter><LotView vm={vm} /></MemoryRouter>)
    const badge = screen.getByText(label)
    expect(badge.className).toContain(toneClass)
    expect(screen.getByRole('button', { name: 'Dar lance' })).toBeTruthy()
  })
})
