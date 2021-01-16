export function findRightReceive(receive: string, price: string) {
  const RADITO = 10 ** 10
  const ZERO = BigInt(0)
  let rr = BigInt(receive)
  const realPrice = BigInt(price)
  while (rr > 0) {
    const target = (rr * realPrice) % BigInt(RADITO)
    if (target === ZERO) {
      return rr
    }
    rr -= BigInt(1)
  }

  throw new Error('The minimum tradable value cannot be found.')
}
