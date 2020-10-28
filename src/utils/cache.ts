import type { SubmittedOrder } from '../containers/order'

const PENDING_ORDERS_LABEL = 'pending_orders'
const SUBMITTED_ORDERS_LABEL = 'submitted_orders'

export const pendingOrders = {
  get: () => {
    try {
      return JSON.parse(localStorage.getItem(PENDING_ORDERS_LABEL)!) || {}
    } catch (err) {
      return {}
    }
  },
  add: (key: string, txHash: string) => {
    const orders = pendingOrders.get()
    orders[key] = txHash
    localStorage.setItem(PENDING_ORDERS_LABEL, JSON.stringify(orders))
  },
  remove: (key: string) => {
    const orders = pendingOrders.get()
    delete orders[key]
    localStorage.setItem(PENDING_ORDERS_LABEL, JSON.stringify(orders))
  },
}

export const submittedOrders = {
  get() {
    try {
      return JSON.parse(localStorage.getItem(SUBMITTED_ORDERS_LABEL)!) || {}
    } catch (err) {
      return {}
    }
  },
  set(orders: Array<SubmittedOrder>) {
    return localStorage.setItem(SUBMITTED_ORDERS_LABEL, JSON.stringify(orders))
  },
}

export default { pendingOrders, submittedOrders }
