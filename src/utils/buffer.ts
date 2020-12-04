import { Amount, AmountUnit } from '@lay2/pw-core'
import BigNumber from 'bignumber.js'
import { PRICE_DECIMAL_INT, CKB_DECIMAL_INT } from 'constants/number'
import { removeTrailingZero } from './fee'

export const getAmountFromCellData = (hex: string) => {
  const sudtAmount = hex.slice(0, 34)
  return Amount.fromUInt128LE(sudtAmount).toString()
}

export const buildBuyData = (orderAmount: string, price: string, sudtDecimal: number) => {
  const amountData = new Amount('0').toUInt128LE()

  const orderAmountData = new Amount(removeTrailingZero(orderAmount), sudtDecimal).toUInt128LE().slice(2)

  const priceData = new Amount(removeTrailingZero(price), CKB_DECIMAL_INT - sudtDecimal + PRICE_DECIMAL_INT)
    .toUInt128LE()
    .slice(2)

  return `${amountData}${orderAmountData}${priceData}00`
}

export const buildSellData = (amount: string, orderAmount: string, price: string, sudtDecimal: number) => {
  const amountData = new Amount(removeTrailingZero(amount), sudtDecimal).toUInt128LE()
  const orderAmountData = new Amount(removeTrailingZero(orderAmount), AmountUnit.ckb).toUInt128LE().slice(2)
  const priceData = new Amount(removeTrailingZero(price), CKB_DECIMAL_INT - sudtDecimal + PRICE_DECIMAL_INT)
    .toUInt128LE()
    .slice(2)
  return `${amountData}${orderAmountData}${priceData}01`
}

export const buildChangeData = (amount: string, decimal: number) => {
  const amountData = new Amount(amount, decimal).toUInt128LE()
  return `${amountData}`
}

export const toHexString = (str: string | number) => {
  return `0x${new BigNumber(str).toString(16)}`
}
