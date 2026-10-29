import { useEffect, useState } from 'react'
import api, { dateTime, getApiError, money } from '../lib/api'
import { useAuth } from '../context/useAuth'

const initialForm = { title: '', initial_price: '', min_increment: '', start_time: '', end_time: '' }

export default function SellerPage() {
  const { user } = useAuth()
  const [query, setQuery] = useState('')
  const [items, setItems] = useState([])
  const [selectedItem, setSelectedItem] = useState(null)
  const [form, setForm] = useState(initialForm)
  const [lots, setLots] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  async function loadLots() {
    try {
      const { data } = await api.get('/lots')
      const details = await Promise.all((data.lots || []).map(async (lot) => {
        try { return (await api.get(`/lots/${lot.id}`)).data } catch { return lot }
      }))
      setLots(details)
    } catch (requestError) { setError(getApiError(requestError, 'Nao foi possivel carregar os lotes.')) }
  }
  useEffect(() => {
    const timer = window.setTimeout(() => { void loadLots() }, 0)
    return () => window.clearTimeout(timer)
  }, [])

  async function searchItems(event) {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data } = await api.get('/external-items/search', { params: { q: query } })
      setItems(data.items || [])
      if (!data.items?.length) setNotice('Nenhum item encontrado para esta busca.')
      else setNotice(`${data.items.length} item(ns) encontrado(s) no ${data.source === 'cache' ? 'cache' : 'catalogo externo'}.`)
    } catch (requestError) { setError(getApiError(requestError, 'Nao foi possivel buscar itens.')) }
    finally { setLoading(false) }
  }

  async function createLot(event) {
    event.preventDefault()
    if (!selectedItem) { setError('Selecione um item do catalogo antes de cadastrar o lote.'); return }
    setLoading(true)
    setError('')
    setNotice('')
    try {
      await api.post('/lots', {
        item_id: selectedItem.id,
        title: form.title || selectedItem.title,
        initial_price: form.initial_price,
        min_increment: form.min_increment,
        start_time: new Date(form.start_time).toISOString(),
        end_time: new Date(form.end_time).toISOString(),
      })
      setNotice('Lote cadastrado com sucesso.')
      setForm(initialForm)
      setSelectedItem(null)
      await loadLots()
    } catch (requestError) { setError(getApiError(requestError, 'Nao foi possivel cadastrar o lote.')) }
    finally { setLoading(false) }
  }

  async function closeLot(lotId) {
    setError('')
    setNotice('')
    try {
      const { data } = await api.post(`/lots/${lotId}/close`)
      setNotice(data.receipt ? `Lote encerrado. Comprovante: ${data.receipt.share_code}` : 'Lote encerrado sem lances vencedores.')
      await loadLots()
    } catch (requestError) { setError(getApiError(requestError, 'Nao foi possivel encerrar o lote.')) }
  }

  const canManage = ['LEILOEIRO', 'ADMIN'].includes(user?.role)
  return <div><div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-extrabold uppercase tracking-[0.22em] text-amber-700">Area de gestao</p><h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Painel do leiloeiro</h1><p className="mt-2 text-slate-500">Encontre produtos e transforme oportunidades em novos lotes.</p></div><span className="w-fit rounded-full bg-slate-200 px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-slate-600">{user?.role || 'Acesso restrito'}</span></div>
    {!canManage && <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Entre com um perfil de leiloeiro ou administrador para cadastrar e encerrar lotes.</div>}
    {error && <p role="alert" className="mb-5 rounded-2xl bg-rose-50 p-4 text-sm text-rose-800">{error}</p>}{notice && <p role="status" className="mb-5 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-800">{notice}</p>}
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]"><section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><div className="mb-5"><p className="text-xs font-bold uppercase tracking-widest text-slate-400">Passo 01</p><h2 className="mt-1 text-xl font-black">Buscar no catalogo</h2></div><form onSubmit={searchItems} className="flex gap-2"><input required value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ex: cadeira vintage" className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100" /><button disabled={loading || !canManage} className="rounded-xl bg-slate-950 px-4 font-bold text-white hover:bg-amber-600 disabled:opacity-40">Buscar</button></form><div className="mt-4 space-y-2">{items.map((item) => <button key={item.id} onClick={() => { setSelectedItem(item); setForm((current) => ({ ...current, title: item.title })) }} className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${selectedItem?.id === item.id ? 'border-amber-400 bg-amber-50' : 'border-slate-100 hover:border-slate-300'}`}><span className="size-14 shrink-0 overflow-hidden rounded-xl bg-slate-100">{item.image_url && <img src={item.image_url} alt="" className="size-full object-cover" />}</span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold">{item.title}</span><span className="mt-1 block text-xs text-slate-500">Catalogo externo · #{item.id}</span></span><span className="text-lg text-amber-600">{selectedItem?.id === item.id ? '✓' : '＋'}</span></button>)}</div></section>
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><div className="mb-5"><p className="text-xs font-bold uppercase tracking-widest text-slate-400">Passo 02</p><h2 className="mt-1 text-xl font-black">Configurar lote</h2></div><form onSubmit={createLot} className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold text-slate-700 sm:col-span-2">Titulo<input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-amber-400" placeholder="Nome para o lote" /></label><label className="text-sm font-semibold text-slate-700">Preco inicial (R$)<input required type="number" min="0" step="0.01" value={form.initial_price} onChange={(event) => setForm({ ...form, initial_price: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-amber-400" /></label><label className="text-sm font-semibold text-slate-700">Incremento minimo<input required type="number" min="0.01" step="0.01" value={form.min_increment} onChange={(event) => setForm({ ...form, min_increment: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-amber-400" /></label><label className="text-sm font-semibold text-slate-700">Inicio<input required type="datetime-local" value={form.start_time} onChange={(event) => setForm({ ...form, start_time: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-amber-400" /></label><label className="text-sm font-semibold text-slate-700">Encerramento<input required type="datetime-local" value={form.end_time} onChange={(event) => setForm({ ...form, end_time: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-amber-400" /></label><button disabled={loading || !canManage || !selectedItem} className="rounded-xl bg-amber-400 px-5 py-3 font-extrabold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-40 sm:col-span-2">{loading ? 'Processando...' : 'Publicar lote'}</button></form>{!selectedItem && <p className="mt-3 text-xs text-slate-400">Escolha um item no catalogo para liberar o cadastro.</p>}</section></div>
    <section className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-5 sm:px-7"><div><p className="text-xs font-bold uppercase tracking-widest text-slate-400">Operacao</p><h2 className="mt-1 text-xl font-black">Lotes cadastrados</h2></div><span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">{lots.length} no total</span></div><div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500"><tr><th className="px-6 py-4">Lote</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">Encerramento</th><th className="px-6 py-4">Arremate atual</th><th className="px-6 py-4">Acao</th></tr></thead><tbody className="divide-y divide-slate-100">{lots.map((lot) => <tr key={lot.id} className="hover:bg-slate-50/70"><td className="px-6 py-4"><p className="font-bold">{lot.title}</p><p className="mt-1 text-xs text-slate-400">#{lot.id}</p></td><td className="px-6 py-4"><span className={`rounded-full px-3 py-1 text-xs font-bold ${lot.status === 'LIVE' ? 'bg-emerald-50 text-emerald-800' : lot.status === 'CLOSED' ? 'bg-slate-100 text-slate-600' : 'bg-amber-50 text-amber-800'}`}>{lot.status}</span></td><td className="px-6 py-4 text-slate-500">{dateTime(lot.end_time)}</td><td className="px-6 py-4 font-bold">{lot.current_bid?.amount ? money(lot.current_bid.amount) : '—'}</td><td className="px-6 py-4"><div className="flex items-center gap-3"><a href={`/lote/${lot.id}`} className="font-bold text-amber-700 hover:underline">Ver lote</a>{canManage && lot.status !== 'CLOSED' && lot.status !== 'CANCELLED' && <button onClick={() => closeLot(lot.id)} className="font-bold text-slate-500 hover:text-rose-700">Encerrar</button>}</div></td></tr>)}</tbody></table>{!lots.length && <p className="p-8 text-center text-sm text-slate-500">Nenhum lote cadastrado ainda.</p>}</div></section>
  </div>
}
