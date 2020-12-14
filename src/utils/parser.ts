import BigNumber from 'bignumber.js'
import {
  PRICE_DECIMAL,
  CKB_DECIMAL,
  COMMISSION_FEE,
  SUDT_LIST,
  CKB_DECIMAL_INT,
  DEFAULT_PAY_DECIMAL,
} from '../constants'

export interface OrderCell {
  tx_hash: string
  index: string
  isLoaded?: boolean
}

export type RawOrder = Record<'order_amount' | 'traded_amount' | 'turnover_rate' | 'paid_amount' | 'price', string> & {
  is_bid: boolean
  status: 'opening' | 'completed' | 'aborted' | 'claimed' | 'claimable' | null
  last_order_cell_outpoint: Record<'tx_hash' | 'index', string>
  block_hash: string
  tokenName?: string
  order_cells?: OrderCell[]
}

function pad(n: number) {
  return n < 10 ? `0${n}` : n
}

export const getTimeString = (timestemp: string) => {
  const date = new Date(Number(timestemp))
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

/**
 * key: tx_hash:index
 */
export const parseOrderRecord = ({
  is_bid: isBid,
  order_amount,
  paid_amount,
  traded_amount,
  turnover_rate,
  price,
  status,
  last_order_cell_outpoint,
  order_cells,
  ...rest
}: RawOrder) => {
  const { tokenName } = rest
  const sudt = SUDT_LIST.find(s => s.info?.symbol === tokenName)
  const sudtDecimalInt = sudt?.info?.decimals! ?? DEFAULT_PAY_DECIMAL
  const sudtDecimal = new BigNumber(10).pow(sudtDecimalInt)
  const key = `${last_order_cell_outpoint.tx_hash}:${last_order_cell_outpoint.index}`

  const paidAmount = new BigNumber(paid_amount).dividedBy(isBid ? CKB_DECIMAL : sudtDecimal)
  const orderAmount = new BigNumber(order_amount).dividedBy(isBid ? sudtDecimal : CKB_DECIMAL)
  const tradedAmount = new BigNumber(traded_amount).dividedBy(isBid ? sudtDecimal : CKB_DECIMAL)
  const priceInNum = new BigNumber(price)
    .dividedBy(PRICE_DECIMAL)
    .times(new BigNumber(10).pow(sudtDecimalInt - CKB_DECIMAL_INT))
  const payAmount = (isBid ? orderAmount.multipliedBy(priceInNum) : orderAmount.dividedBy(priceInNum)).multipliedBy(
    1 + +COMMISSION_FEE,
  )

  return {
    key,
    pay: `${payAmount.toFixed(4, 1)}`,
    paidAmount: `${paidAmount}`,
    tradedAmount: `${tradedAmount}`,
    isBid,
    receive: `${orderAmount.toFixed(4, 1)}`,
    executed: `${new BigNumber(turnover_rate).multipliedBy(100)}%`,
    price: `${priceInNum}`,
    status: status === 'claimable' ? 'completed' : status,
    tokenName: '',
    createdAt: '',
    orderCells: order_cells,
    ...rest,
  }
}
export type OrderRecord = ReturnType<typeof parseOrderRecord>

export default { parseOrderRecord }
