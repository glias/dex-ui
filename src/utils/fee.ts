import BigNumber from 'bignumber.js'
import { COMMISSION_FEE, ORDER_CELL_CAPACITY, CROSS_CHAIN_FEE_RATE } from '../constants'

export function calcBuyReceive(pay: string, price: string) {
  return new BigNumber(pay)
    .div(new BigNumber(1).plus(new BigNumber(COMMISSION_FEE)))
    .div(new BigNumber(price))
    .toFixed(8, 1)
}

export function calcCrossOutFee(pay: string) {
  return new BigNumber(pay).times(1 + CROSS_CHAIN_FEE_RATE).toFixed(8, 1)
}

export function calcSellReceive(pay: string, price: string) {
  return new BigNumber(pay)
    .div(new BigNumber(1).plus(new BigNumber(COMMISSION_FEE)))
    .times(new BigNumber(price))
    .toFixed(8, 1)
}

export function calcTotalPay(pay: string) {
  const amount = new BigNumber(pay.toString())
  return amount.plus(amount.times(COMMISSION_FEE)).toString()
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

export function displayPrice(str: string) {
  const amount = new BigNumber(str)
  const intVal = amount.integerValue().toString()
  if (intVal.length > 2) {
    return amount.toFormat(2)
  }

  if (intVal.length === 0) {
    const decimal = amount.decimalPlaces()
    if (decimal <= 4) {
      return amount.toFixed(4)
    }

    if (decimal >= 8) {
      return amount.toFixed(8)
    }

    return amount.toFixed(decimal)
  }

  return amount.toFixed(4)
}

export function displayPayOrReceive(str: string) {
  const amount = new BigNumber(str)
  const decimal = amount.decimalPlaces()
  if (decimal <= 4) {
    return amount.toFormat(4)
  }
  if (decimal >= 8) {
    return amount.toFormat(8)
  }
  return amount.toFormat(4)
}

export default {
  calcBuyReceive,
  calcSellReceive,
  calcBuyAmount,
}
