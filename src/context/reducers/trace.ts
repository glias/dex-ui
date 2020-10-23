import { SELECTED_TRADE, TRACEORDER_STEP } from '../actions/types'

export const initTraceState = {
  currentPair: 'DAI',
  ordersList: [],
  orderStep: 1,
  isOrderSuccess: false,
  maximumPayable: 0,
  tableHeaderColumn: [
    {
      title: 'Pay',
      dataIndex: 'Pay',
      key: 'Pay',
    },
    {
      title: 'Receive',
      dataIndex: 'Receive',
      key: 'Receive',
    },
    {
      title: 'Price',
      dataIndex: 'Price',
      key: 'Price',
    },
    {
      title: 'Status',
      dataIndex: 'Status',
      key: 'Status',
    },
    {
      title: 'Executed',
      dataIndex: 'Executed',
      key: 'Executed',
    },
    {
      title: 'Action',
      dataIndex: 'Action',
      key: 'Action',
    },
  ],
}

const tradeReducer = (state = initTraceState, action: { type: string; payload: any }) => {
  switch (action.type) {
    case SELECTED_TRADE:
      return {
        ...state,
        currentPair: action.payload?.currentPair,
      }
    case TRACEORDER_STEP:
      return {
        ...state,
        orderStep: action.payload?.orderStep,
      }
    default:
      return state
  }
}

export default tradeReducer
