import BigNumber from 'bignumber.js'
import { PRICE_DECIMAL, SUDT_DECIMAL, CKB_DECIMAL, COMMISSION_FEE } from './const'

export type RawOrder = Record<'is_bid' | 'claimable', boolean> &
  Record<'order_amount' | 'traded_amount' | 'turnover_rate' | 'paid_amount' | 'price', string> & {
    status: 'opening' | 'completed' | 'aborted' | null
    last_order_cell_outpoint: Record<'tx_hash' | 'index', string>
  }

export const getAction = (isClaimed: boolean, isOpen: boolean) => {
  if (isClaimed) {
    return 'claim'
  }
  if (isOpen) {
    return 'opening'
  }
  return null
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
  claimable,
  status,
  last_order_cell_outpoint,
  ...rest
}: RawOrder) => {
  const key = `${last_order_cell_outpoint.tx_hash}:${last_order_cell_outpoint.index}`

  const paidAmount = new BigNumber(paid_amount).dividedBy(isBid ? CKB_DECIMAL : SUDT_DECIMAL)
  const orderAmount = new BigNumber(order_amount).dividedBy(isBid ? SUDT_DECIMAL : CKB_DECIMAL)
  const tradedAmount = new BigNumber(traded_amount).dividedBy(isBid ? SUDT_DECIMAL : CKB_DECIMAL)
  const priceInNum = new BigNumber(price).dividedBy(PRICE_DECIMAL)
  const payAmount = (isBid ? orderAmount.multipliedBy(priceInNum) : orderAmount.dividedBy(priceInNum))
    .multipliedBy(1 + +COMMISSION_FEE)
    .toFixed(8)

  return {
    key,
    pay: `${payAmount}`,
    paidAmount: `${paidAmount}`,
    tradedAmount: `${tradedAmount}`,
    isBid,
    receive: `${orderAmount}`,
    executed: `${new BigNumber(turnover_rate).multipliedBy(100)}%`,
    price: `${priceInNum}`,
    status,
    action: getAction(claimable, status === 'opening'),
    isClaimable: claimable,
    ...rest,
  }
}
export type OrderRecord = ReturnType<typeof parseOrderRecord>
export type OrderRecordAction = ReturnType<typeof getAction>

export default { parseOrderRecord }
