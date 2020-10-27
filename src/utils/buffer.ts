import { Amount } from '@lay2/pw-core'
import { toUint64Le } from '@nervosnetwork/ckb-sdk-utils'

export const u64ToLEHex = (u64: bigint) => {
  const buf = Buffer.alloc(8)
  buf.writeBigUInt64LE(u64, 0)
  return buf.toString('hex')
}

export const leHexToU64 = (hex: string) => {
  if (hex.length !== 18 || !hex.startsWith('0x')) {
    throw new Error('Little endian hex format error')
  }
  const buf = Buffer.from(hex.slice(2), 'hex')
  return buf.readBigUInt64LE(0)
}

export const u128ToLEHex = (u128: bigint) => {
  const buf = Buffer.alloc(16)
  buf.writeBigUInt64LE(u128 % BigInt('0xFFFFFFFFFFFFFFFF'))
  buf.writeBigUInt64LE(u128 / BigInt('0xFFFFFFFFFFFFFFFF'))
  return buf.toString('hex')
}

export const leHexToU128 = (hex: string) => {
  if (hex.length !== 34 || !hex.startsWith('0x')) {
    throw new Error('Little endian hex format error')
  }
  const buf = Buffer.from(hex.slice(2), 'hex')
  return buf.readBigUInt64LE(8) * BigInt('0xFFFFFFFFFFFFFFFF') + buf.readBigUInt64LE(0)
}

export const getAmountFromCellData = (hex: string) => {
  const sudtAmount = hex.slice(0, 34)
  return Amount.fromUInt128LE(sudtAmount).toString()
}

export const buildBuyData = (orderAmount: string, price: string) => {
  const amountData = new Amount('0').toUInt128LE()
  const orderAmountData = new Amount(orderAmount).toUInt128LE().slice(2)
  const priceData = toUint64Le(BigInt(price) * BigInt(10) ** BigInt(10)).slice(2)
  return `${amountData}${orderAmountData}${priceData}00`
}

export const buildSellData = (amount: string, orderAmount: string, price: string) => {
  const amountData = new Amount(amount).toUInt128LE()
  const orderAmountData = new Amount(orderAmount).toUInt128LE().slice(2)
  const priceData = toUint64Le(BigInt(price) * BigInt(10) ** BigInt(10)).slice(2)
  return `${amountData}${orderAmountData}${priceData}01`
}

export const buildChangeData = (amount: string) => {
  const amountData = new Amount(amount).toUInt128LE()
  return `${amountData}`
}
