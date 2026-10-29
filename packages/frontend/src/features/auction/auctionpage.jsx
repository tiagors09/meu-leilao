import AuctionView from './auction.view'
import { useAuctionViewModel } from './useauction.viewmodel'

export default function AuctionPage() {
  const viewModel = useAuctionViewModel()
  return <AuctionView vm={viewModel} />
}
