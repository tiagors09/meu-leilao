import SellerView from './seller.view'
import { useSellerViewModel } from './useseller.viewmodel'

export default function SellerPage() {
  const viewModel = useSellerViewModel()
  return <SellerView vm={viewModel} />
}
