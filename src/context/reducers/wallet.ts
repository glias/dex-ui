import { SELECTED_TRADE, CONNECT_WALLET } from '../actions/types'

export const initWallet = {
  walletConnectStatus: 'success',
  addressList: [],
  currentSelectedAddress: '0x7e8svdger98sd9sdu89fsd89ds89d290e1',
}

const tradeReducer = (state = initWallet, action: { type: string; payload: any }) => {
  switch (action.type) {
    case SELECTED_TRADE:
      return action.payload
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
