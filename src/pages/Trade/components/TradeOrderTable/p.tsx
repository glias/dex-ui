export function findRightReceive(receive: string, price: string) {
  const RADITO = 10 ** 10
  const ZERO = BigInt(0)
  let realReceive = BigInt(receive)
  const realPrice = BigInt(price)
  while (realReceive > 0) {
    const target = (realReceive * realPrice) % BigInt(RADITO)
    if (target === ZERO) {
      return realReceive
    }
    realReceive -= BigInt(1)
  }

  throw new Error('The minimum tradable value cannot be found.')
}
