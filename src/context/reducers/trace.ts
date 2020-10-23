import { SELECTED_TRADE, TRACEORDER_STEP } from '../actions/types'

export interface traceState {
  currentPair: string
  ordersList: string[]
  orderStep: number
  isOrderSuccess: boolean
  maximumPayable: number
  tableHeaderColumn: Array<object>
}

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

const tradeReducer = (state: traceState, action: State.actionType) => {
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
