import { SELECTED_TRADE } from '../actions/types'

export const initWallet = {
  walletConnectStatus: 'unstart',
  addressList: [],
  currentSelectedAddress: ''
}

const tradeReducer = (state = initWallet, action: { type: string; payload: Object }) => {
  switch (action.type) {
    case SELECTED_TRADE:
      return action.payload
    default:
      return state
  }
}

export default tradeReducer
