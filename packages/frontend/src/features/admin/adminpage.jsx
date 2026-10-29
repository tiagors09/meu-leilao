import AdminView from './admin.view.jsx'
import { AdminGuard } from './admin.guard.jsx'
import { useAdminViewModel } from './useadmin.viewmodel.js'

function AdminDashboard() {
  const vm = useAdminViewModel()
  return <AdminView vm={vm} />
}

export default function AdminPage() {
  return <AdminGuard><AdminDashboard /></AdminGuard>
}
