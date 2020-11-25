import BigNumber from 'bignumber.js'
import { COMMISSION_FEE, ORDER_CELL_CAPACITY } from '../constants'

export function calcBuyReceive(pay: string, price: string) {
  return new BigNumber(pay)
    .div(new BigNumber(1).plus(new BigNumber(COMMISSION_FEE)))
    .div(new BigNumber(price))
    .toFixed(8, 1)
}

export function calcSellReceive(pay: string, price: string) {
  return new BigNumber(pay)
    .div(new BigNumber(1).plus(new BigNumber(COMMISSION_FEE)))
    .times(new BigNumber(price))
    .toFixed(8, 1)
}

export function calcAskReceive(pay: string, price: string) {
  return new BigNumber(pay).times(price).toFixed(8, 1)
}

export function calcBidReceive(pay: string, price: string) {
  return new BigNumber(pay).div(price).toFixed(8, 1)
}

export function calcBuyAmount(pay: string) {
  return new BigNumber(pay).plus(new BigNumber(ORDER_CELL_CAPACITY)).toString()
}

export function toFormatWithoutTrailingZero(n: string, decimal = 8) {
  if (!n) {
    return '0.00'
  }
  return new BigNumber(n).toFormat(decimal, 1).replace(/(\.[0-9]*[1-9])0+$|\.0*$/, '$1')
}

export function removeTrailingZero(str: string) {
  return str.replace(/(\.[0-9]*[1-9])0+$|\.0*$/, '$1')
}

export default {
  calcBuyReceive,
  calcSellReceive,
  calcBuyAmount,
}
