import BigNumber from 'bignumber.js'
import { COMMISSION_FEE, ORDER_CELL_CAPACITY } from './const'

const feeRate = new BigNumber(1).plus(new BigNumber(COMMISSION_FEE))

export function calcBuyReceive(pay: string, price: string) {
  const num = new BigNumber(pay).div(feeRate).div(new BigNumber(price)).toFixed(11)
  return num.substring(0, num.length - 1)
}

export function calcSellReceive(pay: string, price: string) {
  const num = new BigNumber(pay).div(feeRate).times(new BigNumber(price)).toFixed(11)
  return num.substring(0, num.length - 1)
}

export function calcBuyAmount(pay: string) {
  return new BigNumber(pay).plus(new BigNumber(ORDER_CELL_CAPACITY)).toString()
}

export default calcBuyReceive
