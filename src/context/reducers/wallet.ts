import { SELECTED_TRADE, CONNECT_WALLET } from '../actions/types'

export const initWallet = {
  walletConnectStatus: 'unstart',
  addressList: [],
  currentSelectedAddress: '',
}

const tradeReducer = (state = initWallet, action: { type: string; payload: any }) => {
  switch (action.type) {
    case SELECTED_TRADE:
      return action.payload
    case CONNECT_WALLET:
      return {
        ...state,
        walletConnectStatus: action.payload?.walletConnectStatus,
      }
    default:
      return state
  }
}

export default tradeReducer
