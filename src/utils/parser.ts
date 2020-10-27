import BigNumber from 'bignumber.js'

const CKB_UNIT = 100_000_000
const SUDT_UNIT = 10_000_000_000
const PRICE_UNIT = 10_000_000_000
export type RawOrder = Record<'is_bid' | 'claimable', boolean> &
  Record<'order_amount' | 'traded_amount' | 'turnover_rate' | 'paid_amount' | 'price', string> & {
    status: 'open' | 'completed' | 'aborted' | null
    last_order_cell_outpoint: Record<'tx_hash' | 'index', string>
  }

export const getAction = (isClaimed: boolean, isOpen: boolean) => {
  if (isClaimed) {
    return 'claim'
  }
  if (isOpen) {
    return 'open'
  }
  return null
}

export const parseOrderRecord = ({
  is_bid: isBid,
  order_amount,
  paid_amount: pay,
  traded_amount,
  turnover_rate,
  price,
  claimable,
  status,
  last_order_cell_outpoint,
  ...rest
}: RawOrder) => {
  const key = `${last_order_cell_outpoint.tx_hash}:${last_order_cell_outpoint.index}`
  const payUnit = isBid ? CKB_UNIT /* pay in ckb */ : SUDT_UNIT
  const orderUnit = isBid ? SUDT_UNIT /* order in sudt */ : CKB_UNIT
  const receiveUnit = isBid ? SUDT_UNIT /* receive in sudt */ : CKB_UNIT

  return {
    key,
    pay: `${new BigNumber(pay).dividedBy(payUnit)}`,
    receive: `${new BigNumber(traded_amount).dividedBy(receiveUnit)}`,
    isBid,
    orderAmount: `${new BigNumber(order_amount).dividedBy(orderUnit)}`,
    executed: `${new BigNumber(turnover_rate).multipliedBy(100)}%`,
    price: `${new BigNumber(price).dividedBy(new BigNumber(PRICE_UNIT))}`,
    status,
    action: getAction(claimable, status === 'open'),
    ...rest,
  }
}

export default { parseOrderRecord }
