import { useEffect, useState } from 'react'
import { useAuth } from '../../context/useAuth'
import api, { apiEndpoints, getApiError, money } from '../../lib/api'
import { walletCards, walletError } from './wallet.specs'

export function useWalletViewModel() {
  const { user } = useAuth()
  const [wallet, setWallet] = useState(null)
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  async function refresh(initial = false) {
    try { const { data } = await api.get(apiEndpoints.wallets.me); setWallet(data); setError('') }
    catch (requestError) { setError(getApiError(requestError, walletError)) }
    finally { if (initial) setLoading(false) }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => { if (user) void refresh(true); else setLoading(false) }, 0)
    return () => window.clearTimeout(timer)
  }, [user])

  async function deposit(event) {
    event.preventDefault()
    setBusy(true); setError(''); setNotice('')
    try {
      const { data } = await api.post(apiEndpoints.wallets.deposit, { amount })
      setWallet(data); setAmount(''); setNotice('Deposito simulado concluido. Seu saldo ja foi atualizado.')
    } catch (requestError) { setError(getApiError(requestError, 'Nao foi possivel fazer o deposito.')) }
    finally { setBusy(false) }
  }

  const balances = wallet ? walletCards.map((item) => ({ ...item, value: money(wallet[item.key]) })) : []
  return { user, wallet, amount, setAmount, loading, busy, error, notice, balances, deposit, openAccess: () => window.dispatchEvent(new Event('verzel:show-access')) }
}
