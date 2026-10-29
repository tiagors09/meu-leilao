import { describe, expect, it } from 'vitest'
import { auctionTabs } from './auction/auction.specs'
import { accessInitialForm, accessModes } from './auth/auth.specs'
import { LOT_POLL_INTERVAL_MS } from './lot/lot.specs'
import { emptyLotForm } from './seller/seller.specs'
import { walletCards } from './wallet/wallet.specs'

describe('contratos de interface das features', () => {
  it('define abas e estados da vitrine', () => {
    expect(auctionTabs.map(({ id }) => id)).toEqual(['LIVE', 'SCHEDULED', 'CLOSED'])
  })

  it('define sessao, formularios limpos e polling de tres segundos', () => {
    expect(accessModes).toEqual({ LOGIN: 'login', SIGNUP: 'signup' })
    expect(accessInitialForm).toEqual({ name: '', email: '', password: '' })
    expect(emptyLotForm).toEqual({ title: '', initial_price: '', min_increment: '', start_time: '', end_time: '' })
    expect(LOT_POLL_INTERVAL_MS).toBe(3000)
  })

  it('define saldos da carteira com tons distintos', () => {
    expect(walletCards.map(({ key, tone }) => [key, tone])).toEqual([
      ['balance_available', 'green'], ['balance_pledged', 'yellow'], ['balance_total', 'purple'],
    ])
  })
})
