import { Amount } from '@lay2/pw-core'
import BigNumber from 'bignumber.js'
import { toUint64Le } from '@nervosnetwork/ckb-sdk-utils'

export const getAmountFromCellData = (hex: string) => {
  const sudtAmount = hex.slice(0, 34)
  return Amount.fromUInt128LE(sudtAmount).toString()
}

const priceDecimal = new BigNumber(10).pow(new BigNumber(10))

export const buildPriceData = (price: string) => {
  return toUint64Le(BigInt(new BigNumber(price).times(priceDecimal).toString())).slice(2)
}

export const buildBuyData = (orderAmount: string, price: string) => {
  const amountData = new Amount('0').toUInt128LE()
  const orderAmountData = new Amount(orderAmount).toUInt128LE().slice(2)
  const priceData = buildPriceData(price)
  return `${amountData}${orderAmountData}${priceData}00`
}

export const buildSellData = (amount: string, orderAmount: string, price: string) => {
  const amountData = new Amount(amount).toUInt128LE()
  const orderAmountData = new Amount(orderAmount).toUInt128LE().slice(2)
  const priceData = buildPriceData(price)
  // eslint-disable-next-line no-debugger
  debugger
  return `${amountData}${orderAmountData}${priceData}01`
}

export const buildChangeData = (amount: string) => {
  const amountData = new Amount(amount).toUInt128LE()
  return `${amountData}`
}
