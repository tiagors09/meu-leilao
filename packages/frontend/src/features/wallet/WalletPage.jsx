import WalletView from './Wallet.View'
import { useWalletViewModel } from './useWallet.ViewModel'

export default function WalletPage() {
  const viewModel = useWalletViewModel()
  return <WalletView vm={viewModel} />
}
