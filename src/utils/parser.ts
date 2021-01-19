import BigNumber from 'bignumber.js'
import { CKB_DECIMAL, COMMISSION_FEE, CKB_DECIMAL_INT, DEFAULT_PAY_DECIMAL, SUDT_MAP } from '../constants'
import { removeTrailingZero } from './fee'

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
  type_args: string
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
  type_args,
  ...rest
}: RawOrder) => {
  const sudt = SUDT_MAP.get(type_args)!
  const sudtDecimalInt = sudt?.info?.decimals! ?? DEFAULT_PAY_DECIMAL
  const sudtDecimal = new BigNumber(10).pow(sudtDecimalInt)
  const key = `${last_order_cell_outpoint.tx_hash}:${last_order_cell_outpoint.index}`

  const paidAmount = new BigNumber(paid_amount).dividedBy(isBid ? CKB_DECIMAL : sudtDecimal)
  const orderAmount = new BigNumber(order_amount).dividedBy(isBid ? sudtDecimal : CKB_DECIMAL)
  const tradedAmount = new BigNumber(traded_amount).dividedBy(isBid ? sudtDecimal : CKB_DECIMAL)
  const priceInNum = new BigNumber(price).times(new BigNumber(10).pow(sudtDecimalInt - CKB_DECIMAL_INT))
  const payAmount = (isBid ? orderAmount.multipliedBy(priceInNum) : orderAmount.dividedBy(priceInNum)).div(
    1 - COMMISSION_FEE,
  )
  return {
    key,
    pay: `${removeTrailingZero(payAmount.toFixed(isBid ? CKB_DECIMAL_INT : sudtDecimalInt, 1))}`,
    paidAmount: `${paidAmount}`,
    tradedAmount: `${tradedAmount}`,
    isBid,
    receive: `${removeTrailingZero(orderAmount.toFixed(!isBid ? CKB_DECIMAL_INT : sudtDecimalInt, 1))}`,
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
