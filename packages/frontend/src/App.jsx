import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import SiteLayout from './components/SiteLayout'
import AuctionPage from './pages/AuctionPage'
import AuditPage from './pages/AuditPage'
import LotPage from './pages/LotPage'
import SellerPage from './pages/SellerPage'
import WalletPage from './pages/WalletPage'

function AppRoutes() {
  return <Routes><Route element={<SiteLayout />}><Route index element={<AuctionPage />} /><Route path="/leiloeiro" element={<SellerPage />} /><Route path="/lote/:id" element={<LotPage />} /><Route path="/carteira" element={<WalletPage />} /><Route path="/auditoria/:id" element={<AuditPage />} /><Route path="*" element={<div className="rounded-3xl bg-white p-12 text-center"><h1 className="text-3xl font-black">Pagina nao encontrada</h1><a className="mt-4 inline-block font-bold text-amber-700" href="/">Voltar para a vitrine</a></div>} /></Route></Routes>
}

export default function App() {
  return <AuthProvider><BrowserRouter><AppRoutes /></BrowserRouter></AuthProvider>
}
