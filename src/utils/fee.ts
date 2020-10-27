import { COMMISSION_FEE, ORDER_CELL_CAPACITY } from './const'

export function calcReceive(pay: number, price: number) {
  return (pay / (1 + COMMISSION_FEE) / price).toFixed(10)
}

export function calcBuyAmount(pay: string) {
  return (parseFloat(pay) + ORDER_CELL_CAPACITY).toString()
}

export default calcReceive
