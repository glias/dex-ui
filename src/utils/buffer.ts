import { Amount, AmountUnit } from '@lay2/pw-core'
import { toUint64Le } from '@nervosnetwork/ckb-sdk-utils'
import BigNumber from 'bignumber.js'
import { PRICE_DECIMAL_INT, CKB_DECIMAL_INT } from 'constants/number'
import { removeTrailingZero } from './fee'

const { Buffer } = require('buffer/')

export const getAmountFromCellData = (hex: string, decimal: number) => {
  const sudtAmount = hex.slice(0, 34)
  return Amount.fromUInt128LE(sudtAmount).toString(decimal)
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

export const buildAskData = (orderAmount: string, price: string, sudtDecimal: number) => {
  const orderAmountData = new Amount(removeTrailingZero(orderAmount), AmountUnit.ckb).toUInt128LE().slice(2)
  const versionData = buildVersionData()
  const priceData = buildPriceData(price, sudtDecimal)

  return `${versionData}${orderAmountData}${priceData}01`
}

export const buildPriceData = (price: string, decimal: number) => {
  const realPrice = new BigNumber(price).times(10 ** (AmountUnit.ckb - decimal))
  const [effectStr, exponentStr] = realPrice.toExponential().split('e')
  const [, offset] = effectStr.split('.')
  const effect = effectStr.split('.').join('')
  let exponent = parseInt(exponentStr, 10)
  if (offset) {
    exponent -= offset.length
  }

  const effectHex = toUint64Le(BigInt(effect)).slice(2) // u64
  const exponentBuf = Buffer.allocUnsafe(1) // i8
  exponentBuf.writeInt8(exponent, 0)
  return effectHex + exponentBuf.toString('hex')
}

export const buildVersionData = () => {
  const buf = Buffer.allocUnsafe(1)
  buf.writeUInt8(1, 0) // u8
  return buf.toString('hex')
}

export const buildChangeData = (amount: string, decimal: number) => {
  const amountData = new Amount(amount, decimal).toUInt128LE()
  return `${amountData}`
}

export const toHexString = (str: string | number) => {
  return `0x${new BigNumber(str).toString(16)}`
}
