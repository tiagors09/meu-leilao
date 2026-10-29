import AuditView from './Audit.View'
import { useAuditRouteViewModel } from './useAudit.ViewModel'

export default function AuditPage() {
  const viewModel = useAuditRouteViewModel()
  return <AuditView vm={viewModel} />
}
