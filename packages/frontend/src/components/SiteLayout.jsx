import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

function AccessDialog({ onClose }) {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      if (mode === 'login') await signIn({ email: form.email, password: form.password })
      else await signUp({ ...form, role: 'LICITANTE' })
      onClose()
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Nao foi possivel entrar agora.')
    } finally { setBusy(false) }
  }

  return <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <section className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl">
      <div className="mb-6 flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-600">Acesso seguro</p><h2 className="mt-2 text-2xl font-bold text-slate-900">{mode === 'login' ? 'Entre na sua conta' : 'Crie sua conta'}</h2></div><button className="rounded-full p-2 text-slate-400 hover:bg-slate-100" onClick={onClose} aria-label="Fechar">✕</button></div>
      <form className="space-y-4" onSubmit={submit}>
        {mode === 'signup' && <label className="block text-sm font-semibold text-slate-700">Nome<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="field mt-1" autoComplete="name" /></label>}
        <label className="block text-sm font-semibold text-slate-700">Email<input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="field mt-1" autoComplete="email" /></label>
        <label className="block text-sm font-semibold text-slate-700">Senha<input required minLength={8} type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="field mt-1" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} /></label>
        {error && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
        <button disabled={busy} className="w-full rounded-xl bg-slate-950 px-4 py-3 font-bold text-white transition hover:bg-amber-600 disabled:opacity-50">{busy ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar conta'}</button>
      </form>
      <button className="mt-4 w-full text-sm font-semibold text-slate-500 hover:text-amber-700" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError('') }}>{mode === 'login' ? 'Ainda nao tem conta? Cadastre-se' : 'Ja tem uma conta? Entre'}</button>
    </section>
  </div>
}

const navClass = ({ isActive }) => `rounded-full px-4 py-2 text-sm font-semibold transition ${isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'}`

export default function SiteLayout() {
  const { user, signOut } = useAuth()
  const [showAccess, setShowAccess] = useState(false)
  useEffect(() => {
    const open = () => setShowAccess(true)
    window.addEventListener('verzel:show-access', open)
    return () => window.removeEventListener('verzel:show-access', open)
  }, [])
  return <div className="min-h-screen bg-[#f7f6f2] text-slate-900">
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-[#f7f6f2]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex shrink-0 items-center gap-3"><span className="grid size-10 place-items-center rounded-2xl bg-amber-400 text-xl font-black text-slate-950">V</span><span className="text-lg font-black tracking-tight">VERZEL<span className="text-amber-600">.</span><span className="ml-2 hidden text-xs font-medium tracking-normal text-slate-500 sm:inline">LEILOES</span></span></Link>
        <nav className="hidden items-center gap-1 md:flex"><NavLink to="/" end className={navClass}>Vitrine</NavLink><NavLink to="/leiloeiro" className={navClass}>Painel do leiloeiro</NavLink><NavLink to="/carteira" className={navClass}>Carteira</NavLink></nav>
        <div className="flex items-center gap-2">{user ? <><span className="hidden text-sm font-semibold text-slate-600 sm:inline">Ola, {user.name.split(' ')[0]}</span><button onClick={signOut} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-bold hover:bg-white">Sair</button></> : <button onClick={() => setShowAccess(true)} className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-bold text-white hover:bg-amber-600">Entrar</button>}</div>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-4 pb-3 md:hidden"><NavLink to="/" end className={navClass}>Vitrine</NavLink><NavLink to="/leiloeiro" className={navClass}>Leiloeiro</NavLink><NavLink to="/carteira" className={navClass}>Carteira</NavLink></nav>
    </header>
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8"><Outlet /></main>
    <footer className="border-t border-slate-200"><div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-7 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8"><span className="font-bold tracking-widest text-slate-700">VERZEL LEILOES</span><span>Uma nova forma de encontrar o que voce procura.</span><span>Leiloes transparentes. Disputas justas.</span></div></footer>
    {showAccess && <AccessDialog onClose={() => setShowAccess(false)} />}
  </div>
}
