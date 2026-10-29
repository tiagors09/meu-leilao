import WalletView from './wallet.view'
import { useWalletViewModel } from './usewallet.viewmodel'

export default function WalletPage() {
  const viewModel = useWalletViewModel()
  return <WalletView vm={viewModel} />
}
