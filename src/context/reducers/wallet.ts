import { SELECTED_TRADE, CONNECT_WALLET } from '../actions/types'

export const initWallet = {
  walletConnectStatus: 'unstart',
  addressList: ['0x7e8svdger98sd9sqwdu89fsd89ds89d290e1', '0x7e8svdger98sd9sdu89fsd89ds89d290e1'],
  currentSelectedAddress: '0x7e8svdger98sd9sduxxx89fsd89ds89d290e1',
}

export interface balancesListType {
  name: string
  total: string
  price: string
  use?: string
  free?: string
}

export interface walletState {
  walletConnectStatus: string
  addressList: string[]
  currentSelectedAddress: string
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
