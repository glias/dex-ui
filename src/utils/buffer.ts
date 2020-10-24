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
  try {
    return leHexToU128(hex.slice(0, 34))
  } catch (error) {
    return BigInt(0)
  }
}
