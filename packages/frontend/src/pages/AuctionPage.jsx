import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import api, { dateTime, getApiError, money } from '../lib/api'

const tabs = [
  { id: 'LIVE', label: 'Ao vivo', dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-800' },
  { id: 'SCHEDULED', label: 'Agendados', dot: 'bg-amber-400', badge: 'bg-amber-50 text-amber-800' },
  { id: 'CLOSED', label: 'Encerrados', dot: 'bg-slate-400', badge: 'bg-slate-100 text-slate-600' },
]

function LotCard({ lot }) {
  const isLive = lot.status === 'LIVE'
  return <article className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
    <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
      {lot.image_url ? <img src={lot.image_url} alt="" className="size-full object-cover transition duration-500 group-hover:scale-105" /> : <div className="grid size-full place-items-center bg-gradient-to-br from-amber-100 via-orange-50 to-slate-100"><span className="text-6xl">◇</span></div>}
      <span className={`absolute left-4 top-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${tabs.find((tab) => tab.id === lot.status)?.badge || 'bg-slate-100 text-slate-700'}`}><span className={`size-2 rounded-full ${tabs.find((tab) => tab.id === lot.status)?.dot || 'bg-slate-400'} ${isLive ? 'animate-pulse' : ''}`} />{isLive ? 'AO VIVO' : lot.status === 'SCHEDULED' ? 'EM BREVE' : 'ENCERRADO'}</span>
    </div>
    <div className="p-5 sm:p-6"><p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Lote #{String(lot.id).padStart(4, '0')}</p><h3 className="mt-2 line-clamp-2 min-h-14 text-lg font-bold leading-snug text-slate-900">{lot.title}</h3><div className="mt-5 flex items-end justify-between gap-3"><div><p className="text-xs text-slate-500">{isLive ? 'Lance inicial' : lot.status === 'SCHEDULED' ? 'Inicio previsto' : 'Preco inicial'}</p><p className="mt-1 text-xl font-black tracking-tight">{isLive || lot.status === 'CLOSED' ? money(lot.initial_price) : dateTime(lot.start_time)}</p></div><Link to={`/lote/${lot.id}`} className="rounded-full bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-amber-600">{isLive ? 'Participar' : 'Ver lote'} <span aria-hidden="true">↗</span></Link></div><div className="mt-5 border-t border-slate-100 pt-4 text-xs text-slate-500">{isLive ? `Encerra ${dateTime(lot.end_time)}` : lot.status === 'CLOSED' ? `Encerrado ${dateTime(lot.end_time)}` : `Abertura ${dateTime(lot.start_time)}`}</div></div>
  </article>
}

export default function AuctionPage() {
  const [lots, setLots] = useState([])
  const [activeTab, setActiveTab] = useState('LIVE')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    api.get('/lots').then(({ data }) => { if (mounted) setLots(data.lots || []) })
      .catch((requestError) => { if (mounted) setError(getApiError(requestError, 'Nao foi possivel carregar os lotes.')) })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [])

  const visibleLots = useMemo(() => lots.filter((lot) => lot.status === activeTab), [lots, activeTab])
  return <div>
    <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-10 text-white sm:px-10 sm:py-14 lg:px-14"><div className="absolute -right-12 -top-24 size-80 rounded-full border-[48px] border-amber-400/10" /><div className="absolute -bottom-36 right-56 size-72 rounded-full bg-amber-400/10 blur-3xl" /><div className="relative grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end"><div><p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-amber-300"><span className="size-1.5 animate-pulse rounded-full bg-emerald-400" />O proximo grande achado esta aqui</p><h1 className="mt-6 max-w-3xl text-4xl font-black leading-[1.05] tracking-tight sm:text-6xl">Dispute. Conquiste.<br /><span className="text-amber-400">Leve para casa.</span></h1><p className="mt-5 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">Pecas especiais, boas oportunidades e lances transparentes. Seu proximo achado pode estar a um lance de distancia.</p><a href="#lotes" className="mt-8 inline-flex items-center gap-3 rounded-full bg-amber-400 px-6 py-3.5 font-extrabold text-slate-950 transition hover:bg-amber-300">Explorar lotes <span className="text-lg">↓</span></a></div><div className="hidden justify-end lg:flex"><div className="relative w-full max-w-sm rotate-2 rounded-3xl border border-white/10 bg-white/[0.06] p-6 shadow-2xl backdrop-blur"><div className="flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Disputa em andamento</span><span className="flex items-center gap-2 text-xs font-bold text-emerald-300"><span className="size-2 animate-pulse rounded-full bg-emerald-400" />AO VIVO</span></div><div className="my-8 grid aspect-[1.5] place-items-center rounded-2xl bg-gradient-to-br from-amber-200 via-orange-100 to-rose-100"><span className="text-8xl drop-shadow">◈</span></div><p className="font-bold">Objetos com historia, novos donos.</p><p className="mt-1 text-sm text-slate-400">Uma experiencia segura do primeiro lance ao arremate.</p><div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4"><span className="text-xs text-slate-400">Autenticidade registrada</span><span className="text-sm font-bold text-amber-300">SHA-256 ✓</span></div></div></div></div></section>

    <section id="lotes" className="scroll-mt-28 pt-12 sm:pt-16"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-xs font-extrabold uppercase tracking-[0.22em] text-amber-700">Selecao da semana</p><h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Encontre seu proximo <span className="text-amber-600">tesouro.</span></h2></div><p className="max-w-sm text-sm leading-6 text-slate-500">Acompanhe cada disputa em tempo real e participe de onde estiver.</p></div>
      <div className="mt-8 flex gap-2 overflow-x-auto border-b border-slate-200 pb-3">{tabs.map((tab) => <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`inline-flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition ${activeTab === tab.id ? 'bg-slate-950 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}><span className={`size-2 rounded-full ${tab.dot} ${tab.id === 'LIVE' ? 'animate-pulse' : ''}`} />{tab.label}<span className={`rounded-full px-2 py-0.5 text-xs ${activeTab === tab.id ? 'bg-white/15' : 'bg-slate-100'}`}>{lots.filter((lot) => lot.status === tab.id).length}</span></button>)}</div>
      {loading ? <div className="grid gap-5 pt-7 sm:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map((item) => <div key={item} className="h-96 animate-pulse rounded-3xl bg-slate-200" />)}</div> : error ? <p role="alert" className="mt-8 rounded-2xl bg-rose-50 p-5 text-rose-800">{error}</p> : visibleLots.length ? <div className="grid gap-5 pt-7 sm:grid-cols-2 lg:grid-cols-3">{visibleLots.map((lot) => <LotCard key={lot.id} lot={lot} />)}</div> : <div className="mt-7 rounded-3xl border border-dashed border-slate-300 bg-white/60 px-6 py-14 text-center"><span className="text-4xl">⌕</span><h3 className="mt-4 text-lg font-bold">Nenhum lote por aqui ainda</h3><p className="mt-1 text-sm text-slate-500">Volte em breve para ver novas oportunidades.</p></div>}
    </section>
  </div>
}
