import AuctionView from './Auction.View'
import { useAuctionViewModel } from './useAuction.ViewModel'

export default function AuctionPage() {
  const viewModel = useAuctionViewModel()
  return <AuctionView vm={viewModel} />
}
