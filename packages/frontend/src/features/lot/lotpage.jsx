import LotView from './lot.view'
import { useLotRouteViewModel } from './uselot.viewmodel'

export default function LotPage() {
  const viewModel = useLotRouteViewModel()
  return <LotView vm={viewModel} />
}
