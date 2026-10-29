import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Navbar } from '../design-system'
import { useAuth } from '../context/useAuth'
import AccessView from '../features/auth/access.view'

export default function SiteLayout() {
  const { user, signOut } = useAuth()
  const [showAccess, setShowAccess] = useState(false)
  useEffect(() => {
    const open = () => setShowAccess(true)
    window.addEventListener('verzel:show-access', open)
    return () => window.removeEventListener('verzel:show-access', open)
  }, [])

  return <div className="min-h-screen bg-[#FDFBF7] text-black">
    <Navbar user={user} onOpenAccess={() => setShowAccess(true)} onSignOut={signOut} />
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8"><Outlet /></main>
    <footer className="border-t-2 border-black bg-[#FEF08A]"><div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-7 text-xs font-bold sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8"><span className="tracking-widest">VERZEL LEILOES</span><span>Uma nova forma de encontrar o que voce procura.</span><span>Leiloes transparentes. Disputas justas.</span></div></footer>
    <AccessView open={showAccess} onClose={() => setShowAccess(false)} />
  </div>
}
