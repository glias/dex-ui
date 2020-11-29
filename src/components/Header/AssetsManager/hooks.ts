import { SUDT } from '@lay2/pw-core'
import WalletContainer, { Wallet } from 'containers/wallet'
import { useParams } from 'react-router-dom'
import { createContainer } from 'unstated-next'
import { SUDT_LIST } from '../../../constants'

interface TokenParams {
  tokenName: string
}
function useParamsTokenName(): TokenParams {
  return useParams<TokenParams>()
}

function useWallet(): Wallet | undefined {
  const { tokenName } = useParamsTokenName()
  return WalletContainer.useContainer().wallets.find(wallet => wallet.tokenName === tokenName)
}

function useSudt(): SUDT | undefined {
  const { tokenName } = useParamsTokenName()
  return SUDT_LIST.find(sudt => sudt.info?.name === tokenName)
}

export const AssetManagerContainer = createContainer(() => ({
  useParamsTokenName,
  useWallet,
  useSudt,
}))
