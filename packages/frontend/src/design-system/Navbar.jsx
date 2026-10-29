import { Link, NavLink } from 'react-router-dom'
import { Badge } from './Badge'
import { Button } from './Button'

const navLink = ({ isActive }) => `border-2 border-black px-3 py-2 text-xs font-black uppercase transition sm:text-sm ${isActive ? 'bg-[#DDD6FE] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]' : 'bg-white hover:bg-[#FEF08A]'}`

export function Navbar({ user, onOpenAccess, onSignOut }) {
  return <header className="border-b-2 border-black bg-[#FDFBF7]">
    <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
      <Link to="/" className="flex items-center gap-3"><span className="grid size-11 place-items-center border-2 border-black bg-[#FEF08A] text-2xl font-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">V</span><span className="text-lg font-black tracking-tight">VERZEL<span className="text-violet-700">.</span><span className="ml-2 hidden text-xs tracking-widest sm:inline">LEILOES</span></span></Link>
      <nav aria-label="Navegacao principal" className="order-3 flex w-full gap-2 overflow-x-auto pb-1 md:order-2 md:w-auto"><NavLink to="/" end className={navLink}>Vitrine</NavLink><NavLink to="/leiloeiro" className={navLink}>Leiloeiro</NavLink><NavLink to="/carteira" className={navLink}>Carteira</NavLink>{user?.role === 'ADMIN' && <NavLink to="/admin" className={navLink}>Controle</NavLink>}</nav>
      <div className="order-2 flex items-center gap-2 md:order-3">{user ? <><Badge tone="green" className="hidden normal-case sm:inline-flex">{user.name.split(' ')[0]}</Badge><Button tone="pink" className="px-3 py-2 text-xs" onClick={onSignOut}>Sair</Button></> : <Button tone="purple" className="px-4 py-2" onClick={onOpenAccess}>Entrar</Button>}</div>
    </div>
  </header>
}
