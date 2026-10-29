import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import api, { getApiError, money } from '../lib/api'

const balanceCards = [
  { key: 'balance_available', label: 'Saldo disponivel', icon: '↗', style: 'bg-emerald-50 text-emerald-900', note: 'Pronto para seus proximos lances' },
  { key: 'balance_pledged', label: 'Saldo comprometido', icon: '◷', style: 'bg-amber-50 text-amber-900', note: 'Reservado em disputas ativas' },
  { key: 'balance_total', label: 'Saldo total', icon: '◈', style: 'bg-slate-950 text-white', note: 'Valor total da sua carteira' },
]

export default function WalletPage() {
  const { user } = useAuth()
  const [wallet, setWallet] = useState(null)
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  async function refresh(initial = false) {
    try { const { data } = await api.get('/wallets/me'); setWallet(data) }
    catch (requestError) { setError(getApiError(requestError, 'Entre na sua conta para consultar a carteira.')) }
    finally { if (initial) setLoading(false) }
  }
  useEffect(() => {
    const timer = window.setTimeout(() => { void refresh(true) }, 0)
    return () => window.clearTimeout(timer)
  }, [])
  async function deposit(event) {
    event.preventDefault()
    setBusy(true); setError(''); setNotice('')
    try { const { data } = await api.post('/wallets/deposit', { amount }); setWallet(data); setAmount(''); setNotice('Deposito simulado concluido. Seu saldo ja foi atualizado.') }
    catch (requestError) { setError(getApiError(requestError, 'Nao foi possivel fazer o deposito.')) }
    finally { setBusy(false) }
  }
  if (!user) return <div className="mx-auto max-w-xl rounded-3xl bg-white p-8 text-center shadow-sm sm:p-12"><span className="text-5xl">◈</span><h1 className="mt-5 text-2xl font-black">Sua carteira, sempre por perto</h1><p className="mt-2 text-slate-500">Entre na sua conta para acompanhar seu saldo e fazer depositos.</p><button onClick={() => window.dispatchEvent(new Event('verzel:show-access'))} className="mt-6 rounded-full bg-slate-950 px-6 py-3 font-bold text-white hover:bg-amber-600">Entrar na conta</button></div>
  return <div className="mx-auto max-w-5xl"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-extrabold uppercase tracking-[0.22em] text-amber-700">Area do licitante</p><h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Minha carteira</h1><p className="mt-2 text-slate-500">Ola, {user.name}. Confira seus valores antes do proximo lance.</p></div><Link to="/" className="text-sm font-bold text-amber-700 hover:underline">Explorar lotes →</Link></div>
    {error && <p role="alert" className="mt-6 rounded-2xl bg-rose-50 p-4 text-sm text-rose-800">{error}</p>}{notice && <p role="status" className="mt-6 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-800">{notice}</p>}
    {loading ? <div className="mt-8 h-44 animate-pulse rounded-3xl bg-slate-200" /> : wallet && <><div className="mt-8 grid gap-4 md:grid-cols-3">{balanceCards.map((card) => <article key={card.key} className={`rounded-3xl p-6 ${card.style}`}><div className="flex items-center justify-between"><p className="text-sm font-bold opacity-75">{card.label}</p><span className="grid size-10 place-items-center rounded-xl bg-white/15 text-xl">{card.icon}</span></div><p className="mt-7 text-3xl font-black tracking-tight">{money(wallet[card.key])}</p><p className="mt-2 text-xs opacity-65">{card.note}</p></article>)}</div><div className="mt-6 grid gap-6 md:grid-cols-[1fr_0.85fr]"><section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8"><div className="flex size-12 items-center justify-center rounded-2xl bg-amber-100 text-2xl">＋</div><h2 className="mt-5 text-xl font-black">Adicionar saldo</h2><p className="mt-2 text-sm leading-6 text-slate-500">Faca um deposito de teste para participar dos leiloes. O saldo fica disponivel imediatamente.</p><form onSubmit={deposit} className="mt-6"><label className="text-sm font-bold">Valor do deposito (R$)<div className="mt-2 flex gap-2"><input required type="number" min="0.01" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-3 text-lg font-bold outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100" placeholder="0,00" /><button disabled={busy} className="rounded-xl bg-slate-950 px-5 font-extrabold text-white hover:bg-amber-600 disabled:opacity-50">{busy ? 'Aguarde...' : 'Depositar'}</button></div></label></form></section><aside className="rounded-3xl bg-amber-100 p-6 sm:p-8"><p className="text-xs font-extrabold uppercase tracking-widest text-amber-800">Como funciona</p><h3 className="mt-3 text-xl font-black">Seu saldo protegido a cada lance.</h3><ul className="mt-5 space-y-4 text-sm leading-6 text-amber-950/80"><li className="flex gap-3"><span className="font-black">01</span><span>Ao dar um lance, o valor fica reservado e aparece como comprometido.</span></li><li className="flex gap-3"><span className="font-black">02</span><span>Se alguem cobrir seu lance, o valor reservado volta a ficar disponivel.</span></li><li className="flex gap-3"><span className="font-black">03</span><span>Se voce vencer, o arremate e liquidado no encerramento do lote.</span></li></ul></aside></div></>}
  </div>
}
