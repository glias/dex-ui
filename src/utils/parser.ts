import BigNumber from 'bignumber.js'
import { PRICE_DECIMAL, SUDT_DECIMAL, CKB_DECIMAL, COMMISSION_FEE } from './const'

export type RawOrder = Record<'order_amount' | 'traded_amount' | 'turnover_rate' | 'paid_amount' | 'price', string> & {
  is_bid: boolean
  status: 'opening' | 'completed' | 'aborted' | 'claimed' | 'claimable' | null
  last_order_cell_outpoint: Record<'tx_hash' | 'index', string>
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
  ...rest
}: RawOrder) => {
  const key = `${last_order_cell_outpoint.tx_hash}:${last_order_cell_outpoint.index}`

  const paidAmount = new BigNumber(paid_amount).dividedBy(isBid ? CKB_DECIMAL : SUDT_DECIMAL)
  const orderAmount = new BigNumber(order_amount).dividedBy(isBid ? SUDT_DECIMAL : CKB_DECIMAL)
  const tradedAmount = new BigNumber(traded_amount).dividedBy(isBid ? SUDT_DECIMAL : CKB_DECIMAL)
  const priceInNum = new BigNumber(price).dividedBy(PRICE_DECIMAL)
  const payAmount = (isBid ? orderAmount.multipliedBy(priceInNum) : orderAmount.dividedBy(priceInNum)).multipliedBy(
    1 + +COMMISSION_FEE,
  )

  return {
    key,
    pay: `${payAmount.toFixed(4)}`,
    paidAmount: `${paidAmount}`,
    tradedAmount: `${tradedAmount}`,
    isBid,
    receive: `${orderAmount.toFixed(4)}`,
    executed: `${new BigNumber(turnover_rate).multipliedBy(100)}%`,
    price: `${priceInNum}`,
    status: status === 'claimable' ? 'completed' : status,
    ...rest,
  }
}
export type OrderRecord = ReturnType<typeof parseOrderRecord>

export default { parseOrderRecord }
