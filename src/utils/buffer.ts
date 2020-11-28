import { Amount, AmountUnit } from '@lay2/pw-core'
import BigNumber from 'bignumber.js'
import { toUint64Le } from '@nervosnetwork/ckb-sdk-utils'
import { removeTrailingZero } from './fee'

export const getAmountFromCellData = (hex: string) => {
  const sudtAmount = hex.slice(0, 34)
  return Amount.fromUInt128LE(sudtAmount).toString()
}

const priceDecimal = new BigNumber(10).pow(new BigNumber(10))

export const buildPriceData = (price: string) => {
  return toUint64Le(BigInt(new BigNumber(price).times(priceDecimal).toString())).slice(2)
}

export const buildBuyData = (orderAmount: string, price: string, decimal: number) => {
  const amountData = new Amount('0').toUInt128LE()
  const orderAmountData = new Amount(removeTrailingZero(orderAmount), decimal).toUInt128LE().slice(2)
  const priceData = buildPriceData(removeTrailingZero(price))
  return `${amountData}${orderAmountData}${priceData}00`
}

export const buildSellData = (amount: string, orderAmount: string, price: string, decimal: number) => {
  const amountData = new Amount(removeTrailingZero(amount), decimal).toUInt128LE()
  const orderAmountData = new Amount(removeTrailingZero(orderAmount), AmountUnit.ckb).toUInt128LE().slice(2)
  const priceData = buildPriceData(removeTrailingZero(price))
  return `${amountData}${orderAmountData}${priceData}01`
}

export const buildChangeData = (amount: string, decimal: number) => {
  const amountData = new Amount(amount, decimal).toUInt128LE()
  return `${amountData}`
}

export const toHexString = (str: string | number) => {
  return `0x${new BigNumber(str).toString(16)}`
}
