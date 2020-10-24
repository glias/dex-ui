import { SELECTED_TRADE, CONNECT_WALLET } from '../actions/types'

export const initWallet = {
  walletConnectStatus: 'unstart',
  addressList: ['0x7e8svdger98sd9sqwdu89fsd89ds89d290e1', '0x7e8svdger98sd9sdu89fsd89ds89d290e1'],
  currentSelectedAddress: '0x7e8svdger98sd9sduxxx89fsd89ds89d290e1',
  thirdPartyLinks: [
    {
      name: 'FAQ',
      link: 'https://bihu.com/',
    },
    {
      name: 'Github',
      link: 'https://github.com/',
    },
  ],
  balancesList: [
    {
      name: 'CKB',
      total: '1000.0000',
      price: '12.00',
      use: '100.0000',
      free: '900.0000',
    },
    {
      name: 'ETH',
      total: '1000.0000',
      price: '12.00',
    },
    {
      name: 'USDT',
      total: '1000.0000',
      price: '12.00',
    },
  ],
}

export interface balancesListType {
  name: string
  total: string
  price: string
  use?: string
  free?: string
}

interface thirdPartyLinksType {
  link: string
  name: string
}

export interface walletState {
  walletConnectStatus: string
  addressList: string[]
  thirdPartyLinks: Array<thirdPartyLinksType>
  currentSelectedAddress: string
  balancesList: Array<balancesListType>
}

const tradeReducer = (state = initWallet, action: State.actionType) => {
  switch (action.type) {
    case SELECTED_TRADE:
      return {
        ...state,
        currentPair: action.payload.currentPair,
      }
    case CONNECT_WALLET:
      return {
        ...state,
        walletConnectStatus: action.payload.walletConnectStatus,
      }
    default:
      return state
  }
}

export default tradeReducer
