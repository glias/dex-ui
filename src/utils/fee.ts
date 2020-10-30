import BigNumber from 'bignumber.js'
import { COMMISSION_FEE, ORDER_CELL_CAPACITY } from './const'

export function calcBuyReceive(pay: string, price: string) {
  const value = new BigNumber(pay)
    .div(new BigNumber(1).plus(new BigNumber(COMMISSION_FEE)))
    .div(new BigNumber(price))
    .toFixed(8, 1)

  // show decimal abbreviations
  if (parseFloat(value) === 0) {
    return '0.00'
  }
  return value
}

export function calcSellReceive(pay: string, price: string) {
  const value = new BigNumber(pay)
    .div(new BigNumber(1).plus(new BigNumber(COMMISSION_FEE)))
    .times(new BigNumber(price))
    .toFixed(8, 1)

  // show decimal abbreviations
  if (parseFloat(value) === 0) {
    return '0.00'
  }
  return value
}

export function calcBuyAmount(pay: string) {
  return new BigNumber(pay).plus(new BigNumber(ORDER_CELL_CAPACITY)).toString()
}

export default {
  calcBuyReceive,
  calcSellReceive,
  calcBuyAmount,
}
