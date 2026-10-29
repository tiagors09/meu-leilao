import LotView from './Lot.View'
import { useLotRouteViewModel } from './useLot.ViewModel'

export default function LotPage() {
  const viewModel = useLotRouteViewModel()
  return <LotView vm={viewModel} />
}
