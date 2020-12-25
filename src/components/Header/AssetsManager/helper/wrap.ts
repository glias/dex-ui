import { Address, AddressType, Amount } from '@lay2/pw-core'

export function wrapAddress(address: string | Address): Address {
  if (address instanceof Address) return address
  return new Address(address, address.startsWith('ck') ? AddressType.ckb : AddressType.eth)
}

export function wrapAmount(amount: string | Amount): Amount {
  if (amount instanceof Amount) return amount
  return new Amount(amount, 0)
}
