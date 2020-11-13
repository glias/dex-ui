import BigNumber from 'bignumber.js'

export const COMMISSION_FEE = 0.003
export const PRICE_DECIMAL = new BigNumber(10).pow(new BigNumber(10))
export const SUDT_DECIMAL = new BigNumber(10).pow(new BigNumber(8))
export const CKB_DECIMAL = new BigNumber(10).pow(new BigNumber(8))

//  @TODO: comments
export const ORDER_CELL_CAPACITY = 179
export const MIN_SUDT_CAPACITY = 142

export const MIN_ORDER_DAI = 147
export const MIN_ORDER_CKB = 289
export const MAX_TRANSACTION_FEE = 0.1
export const MINIUM_RECEIVE = 0.00000001
