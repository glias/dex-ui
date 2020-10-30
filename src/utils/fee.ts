import BigNumber from 'bignumber.js'
import { COMMISSION_FEE, ORDER_CELL_CAPACITY } from './const'

export function calcBuyReceive(pay: string, price: string) {
  return new BigNumber(pay)
    .div(new BigNumber(1).plus(new BigNumber(COMMISSION_FEE)))
    .div(new BigNumber(price))
    .toFixed(10, 1)
}

export function calcSellReceive(pay: string, price: string) {
  return new BigNumber(pay)
    .div(new BigNumber(1).plus(new BigNumber(COMMISSION_FEE)))
    .times(new BigNumber(price))
    .toFixed(10, 1)
}

export function calcBuyAmount(pay: string) {
  return new BigNumber(pay).plus(new BigNumber(ORDER_CELL_CAPACITY)).toString()
}

export default calcBuyReceive
