import { SELECTED_TRADE, TRACEORDER_STEP, TRACE_TABLELIST } from '../actions/types'
import i18n from '../../utils/i18n'

interface ordersListType {
  pay: string
  receive: string
  price: string
  conversionUnit: string
  status: 'Complete' | 'Aborted' | 'Opening' | 'Pedding' | 'Claimed'
  executed: number | null
}

interface tableHeaderColumnType {
  title: string
  key: string
  dataIndex: string
}

export interface traceState {
  currentPair: string
  ordersList: Array<ordersListType>
  orderStep: number
  isOrderSuccess: boolean
  maximumPayable: number | string
  suggestionPrice: number | string
  tableHeaderColumn: Array<tableHeaderColumnType>
}

export const initTraceState = {
  currentPair: 'DAI',
  ordersList: [],
  orderStep: 1,
  isOrderSuccess: false,
  maximumPayable: '-',
  suggestionPrice: '-',
  tableHeaderColumn: [
    {
      title: i18n.t('trade.pay'),
      dataIndex: 'pay',
      key: 'pay',
    },
    {
      title: 'Receive',
      dataIndex: 'receive',
      key: 'receive',
    },
    {
      title: i18n.t('trade.price'),
      dataIndex: 'price',
      key: 'price',
    },
    {
      title: i18n.t('trade.status'),
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: i18n.t('trade.executed'),
      dataIndex: 'executed',
      key: 'executed',
    },
    {
      title: i18n.t('trade.action'),
      dataIndex: 'action',
      key: 'action',
    },
  ],
}

const tradeReducer = (state = initTraceState, action: State.actionType) => {
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
    case TRACE_TABLELIST:
      return {
        ...state,
        ordersList: action.payload?.ordersList,
      }
    default:
      return state
  }
}

export default tradeReducer
