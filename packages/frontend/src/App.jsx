import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import SiteLayout from './components/SiteLayout'
import AuctionPage from './features/auction/auctionpage.jsx'
import AuditPage from './features/audit/auditpage.jsx'
import LotPage from './features/lot/lotpage.jsx'
import SellerPage from './features/seller/sellerpage.jsx'
import WalletPage from './features/wallet/walletpage.jsx'
import AdminPage from './features/admin/adminpage.jsx'
import { Card, ErrorBoundary, RouteLink } from './design-system'

function NotFoundView() {
  return <Card tone="pink" className="py-12 text-center"><h1 className="text-3xl font-black">Pagina nao encontrada</h1><RouteLink to="/" className="mt-4 inline-block font-black underline">Voltar para a vitrine</RouteLink></Card>
}

export default function App() {
  return <AuthProvider><BrowserRouter><ErrorBoundary><Routes><Route element={<SiteLayout />}><Route index element={<AuctionPage />} /><Route path="/leiloeiro" element={<SellerPage />} /><Route path="/lote/:id" element={<LotPage />} /><Route path="/carteira" element={<WalletPage />} /><Route path="/auditoria/:id" element={<AuditPage />} /><Route path="/admin" element={<AdminPage />} /><Route path="*" element={<NotFoundView />} /></Route></Routes></ErrorBoundary></BrowserRouter></AuthProvider>
}
