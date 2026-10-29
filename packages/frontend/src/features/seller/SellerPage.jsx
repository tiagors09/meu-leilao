import SellerView from './Seller.View'
import { useSellerViewModel } from './useSeller.ViewModel'

export default function SellerPage() {
  const viewModel = useSellerViewModel()
  return <SellerView vm={viewModel} />
}
