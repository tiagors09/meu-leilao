import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import api, { dateTime, getApiError, money } from '../lib/api'

function countdown(value, now) {
  const ms = new Date(value).getTime() - now
  if (ms <= 0) return '00:00:00'
  const hours = Math.floor(ms / 3600000)
  const minutes = Math.floor((ms % 3600000) / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  return [hours, minutes, seconds].map((part) => String(part).padStart(2, '0')).join(':')
}

export default function LotPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const [lot, setLot] = useState(null)
  const [now, setNow] = useState(0)
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(true)
  const [bidding, setBidding] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const refresh = useCallback(async (initial = false) => {
    try {
      const { data } = await api.get(`/lots/${id}`)
      setLot(data)
      setError('')
      const next = Number(data.current_bid?.amount || data.initial_price) + (data.current_bid ? Number(data.min_increment) : 0)
      setAmount((current) => initial || !current || Number(current) < next ? next.toFixed(2) : current)
    } catch (requestError) {
      setError(getApiError(requestError, 'Nao foi possivel carregar este lote.'))
    } finally { if (initial) setLoading(false) }
  }, [id])

  useEffect(() => {
    const initial = window.setTimeout(() => { void refresh(true) }, 0)
    const poll = window.setInterval(() => { void refresh() }, 3000)
    const clock = window.setInterval(() => setNow(Date.now()), 1000)
    return () => { window.clearTimeout(initial); window.clearInterval(poll); window.clearInterval(clock) }
  }, [refresh])

  const isLeader = useMemo(() => Boolean(user && lot?.current_bid && Number(lot.current_bid.bidder_id) === Number(user.id)), [user, lot])
  const isLive = lot?.status === 'LIVE' && new Date(lot.start_time) <= new Date() && new Date(lot.end_time) > new Date()

  async function placeBid(event) {
    event.preventDefault()
    setBidding(true)
    setError('')
    setNotice('')
    try {
      await api.post(`/lots/${id}/bids`, { amount })
      setNotice('Seu lance foi registrado com seguranca.')
      await refresh()
    } catch (requestError) {
      setError(getApiError(requestError, 'Nao foi possivel registrar seu lance.'))
    } finally { setBidding(false) }
  }

  if (loading) return <div className="h-96 animate-pulse rounded-3xl bg-slate-200" />
  if (!lot) return <div className="rounded-3xl bg-white p-10 text-center"><h1 className="text-2xl font-black">Lote indisponivel</h1><p className="mt-2 text-slate-500">{error || 'Nao encontramos este lote.'}</p><Link to="/" className="mt-6 inline-block font-bold text-amber-700">Voltar para a vitrine</Link></div>

  const currentPrice = lot.current_bid?.amount || lot.initial_price
  const minimum = (Number(currentPrice) + (lot.current_bid ? Number(lot.min_increment) : 0)).toFixed(2)
  return <div><Link to="/" className="text-sm font-bold text-slate-500 hover:text-amber-700">← Voltar para lotes</Link><div className="mt-6 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
    <section className="overflow-hidden rounded-[2rem] bg-white shadow-sm"><div className="relative grid aspect-[16/10] place-items-center overflow-hidden bg-gradient-to-br from-amber-100 via-orange-50 to-slate-200">{lot.image_url ? <img src={lot.image_url} alt="" className="size-full object-cover" /> : <span className="text-9xl">◈</span>}<span className="absolute left-5 top-5 rounded-full bg-white/90 px-4 py-2 text-xs font-extrabold uppercase tracking-widest text-slate-700">Lote #{lot.id}</span></div><div className="p-6 sm:p-8"><div className="flex flex-wrap items-center gap-3"><span className={`rounded-full px-3 py-1.5 text-xs font-extrabold ${isLive ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>{isLive ? 'DISPUTA AO VIVO' : lot.status}</span><span className="text-sm text-slate-500">Criado em {dateTime(lot.created_at)}</span></div><h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">{lot.title}</h1><p className="mt-4 max-w-2xl leading-7 text-slate-600">Participe desta disputa com total transparencia. Cada lance fica registrado em uma cadeia de auditoria publica.</p><div className="mt-7 flex flex-wrap gap-3"><Link to={`/auditoria/${lot.id}`} className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-bold hover:bg-slate-50">Ver auditoria SHA-256 ↗</Link><Link to="/carteira" className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-bold hover:bg-slate-50">Minha carteira</Link></div></div></section>
    <aside className="h-fit rounded-[2rem] bg-slate-950 p-6 text-white shadow-xl sm:p-8"><div className="flex items-center justify-between"><p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Lance atual</p><span className={`flex items-center gap-2 text-xs font-bold ${isLive ? 'text-emerald-300' : 'text-slate-400'}`}><span className={`size-2 rounded-full ${isLive ? 'animate-pulse bg-emerald-400' : 'bg-slate-500'}`} />{isLive ? 'AO VIVO' : 'ENCERRADO'}</span></div><p className="mt-3 text-4xl font-black tracking-tight text-amber-300 sm:text-5xl">{money(currentPrice)}</p><div className="my-7 rounded-2xl border border-white/10 bg-white/5 p-5"><p className="text-xs font-bold uppercase tracking-widest text-slate-400">{isLive ? 'Tempo restante' : 'Encerramento'}</p><p className="mt-2 font-mono text-3xl font-bold tabular-nums">{isLive ? (now ? countdown(lot.end_time, now) : '--:--:--') : dateTime(lot.end_time)}</p><p className="mt-2 text-xs text-slate-500">Incremento minimo de {money(lot.min_increment)}</p></div>
      {user && lot.current_bid && <p className={`mb-5 rounded-xl border px-4 py-3 text-sm font-bold ${isLeader ? 'border-green-400 bg-green-100 text-green-800' : 'border-red-400 bg-red-100 text-red-800'}`}>{isLeader ? 'Voce esta ganhando' : 'Voce foi superado'}</p>}
      {error && <p role="alert" className="mb-4 rounded-xl bg-rose-500/15 p-3 text-sm text-rose-200">{error}</p>}{notice && <p role="status" className="mb-4 rounded-xl bg-emerald-500/15 p-3 text-sm text-emerald-200">{notice}</p>}
      {isLive && user?.role === 'LICITANTE' ? <form onSubmit={placeBid}><label className="mb-2 block text-sm font-semibold text-slate-300">Seu lance (minimo {money(minimum)})</label><div className="flex gap-2"><input type="number" min={minimum} step="0.01" required value={amount} onChange={(event) => setAmount(event.target.value)} className="min-w-0 flex-1 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-lg font-bold text-white outline-none focus:border-amber-400" /><button disabled={bidding || Number(amount) < Number(minimum)} className="rounded-xl bg-amber-400 px-5 py-3 font-extrabold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-40">{bidding ? 'Enviando...' : 'Dar lance'}</button></div><p className="mt-3 text-xs leading-5 text-slate-500">O valor sera reservado na sua carteira ate o fim da disputa.</p></form> : !user && isLive ? <div className="rounded-2xl border border-white/10 bg-white/5 p-5"><p className="font-bold">Pronto para disputar?</p><p className="mt-1 text-sm text-slate-400">Entre ou crie sua conta para registrar um lance.</p><button onClick={() => window.dispatchEvent(new Event('verzel:show-access'))} className="mt-4 w-full rounded-xl bg-amber-400 px-4 py-3 font-extrabold text-slate-950 hover:bg-amber-300">Entrar para dar lance</button></div> : <p className="rounded-xl border border-white/10 p-4 text-sm text-slate-400">{isLive ? 'Esta acao esta disponivel para licitantes.' : 'Este lote nao esta recebendo lances.'}</p>}
    </aside></div></div>
}
