import AuditView from './audit.view'
import { useAuditRouteViewModel } from './useaudit.viewmodel'

export default function AuditPage() {
  const viewModel = useAuditRouteViewModel()
  return <AuditView vm={viewModel} />
}
