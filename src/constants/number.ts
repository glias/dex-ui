import BigNumber from 'bignumber.js'

export const COMMISSION_FEE = 0.003
export const CROSS_CHAIN_FEE_RATE = 0.001

export const PRICE_DECIMAL = new BigNumber(10).pow(new BigNumber(20))
export const SUDT_DECIMAL = new BigNumber(10).pow(new BigNumber(8))
export const CKB_DECIMAL = new BigNumber(10).pow(new BigNumber(8))
export const ETH_DECIMAL = new BigNumber(10).pow(18)

//  @TODO: comments
export const ORDER_CELL_CAPACITY = 187
export const MIN_SUDT_CAPACITY = 142

export const MIN_ORDER_DAI = 147
export const MIN_ORDER_CKB = 289
export const MAX_TRANSACTION_FEE = 0.1
export const MINIUM_RECEIVE = 0.00000001

export const CKB_DECIMAL_INT = 8
export const PRICE_DECIMAL_INT = 20

export const CKB_MIN_CHANGE_CKB = new BigNumber(61)
export const CKB_MIN_CHANGE_SHANNON = new BigNumber(61 * 10 ** 8)
