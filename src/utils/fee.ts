import BigNumber from 'bignumber.js'
import { COMMISSION_FEE, ORDER_CELL_CAPACITY, CROSS_CHAIN_FEE_RATE } from '../constants'

export function findBestReceive(receive: string, price: string) {
  const r = new BigNumber(receive)
  const p = new BigNumber(price)
  const [, k] = p.toFraction()
  return r.minus(r.mod(k))
}

export function calcBuyReceive(pay: string, price: string) {
  return new BigNumber(pay)
    .div(new BigNumber(1).plus(new BigNumber(COMMISSION_FEE)))
    .div(new BigNumber(price))
    .toFixed(8, 1)
}

export function calcCrossOutFee(pay: string) {
  return new BigNumber(pay).times(1 - CROSS_CHAIN_FEE_RATE).toFixed(8, 1)
}

export function calcSellReceive(pay: string, price: string) {
  return new BigNumber(pay)
    .div(new BigNumber(1).plus(new BigNumber(COMMISSION_FEE)))
    .times(new BigNumber(price))
    .toFixed(8, 1)
}

export function calcAskReceive(pay: string, price: string) {
  return new BigNumber(pay)
    .times(1 - COMMISSION_FEE)
    .times(price)
    .toFixed(8, 1)
}

export function calcBidReceive(pay: string, price: string, decimal: number) {
  return new BigNumber(pay)
    .times(1 - COMMISSION_FEE)
    .div(price)
    .toFixed(decimal, 1)
}

export function calcBuyAmount(pay: string) {
  return new BigNumber(pay).plus(new BigNumber(ORDER_CELL_CAPACITY)).toString()
}

;(window as any).BigNumber = BigNumber

export function toFormatWithoutTrailingZero(n: string, decimal = 8) {
  if (!n) {
    return '0.00'
  }
  return new BigNumber(
    n
      .split('')
      .filter(word => word !== ',')
      .join(''),
  )
    .toFormat(decimal, 1)
    .replace(/(\.[0-9]*[1-9])0+$|\.0*$/, '$1')
}

export function removeTrailingZero(str: string) {
  return str.replace(/(\.[0-9]*[1-9])0+$|\.0*$/, '$1')
}

export function displayPrice(str: string, isBid = false) {
  const amount = new BigNumber(str)
  const intVal = amount.integerValue().toString()
  const roundingMode = isBid ? BigNumber.ROUND_DOWN : BigNumber.ROUND_UP
  if (intVal.length > 2) {
    return amount.toFormat(2, roundingMode)
  }

  if (intVal.length === 0) {
    const decimal = amount.decimalPlaces()
    if (decimal <= 4) {
      return amount.toFixed(4, roundingMode)
    }

    if (decimal >= 8) {
      return amount.toFixed(8, roundingMode)
    }

    return amount.toFixed(decimal, roundingMode)
  }

  return amount.toFixed(4, roundingMode)
}

export function displayPayOrReceive(str: string, isPay: boolean) {
  const amount = new BigNumber(str)
  const roundingMode = isPay ? BigNumber.ROUND_HALF_UP : BigNumber.ROUND_DOWN

  if (amount.isLessThan(0.0001)) {
    return '< 0.0001'
  }
  return amount.toFormat(4, roundingMode)
}

export default {
  calcBuyReceive,
  calcSellReceive,
  calcBuyAmount,
}
