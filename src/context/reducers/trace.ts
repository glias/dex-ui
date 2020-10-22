import { SELECTED_TRADE } from '../actions/types'

export const initTraceState = {
  ordersList: [],
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

const tradeReducer = (state = initTraceState, action: { type: string; payload: Object }) => {
  switch (action.type) {
    case SELECTED_TRADE:
      return action.payload
    default:
      return state
  }
}

export default tradeReducer
