const PENDING_ORDERS_LABEL = 'pending_orders'

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

export default { pendingOrders }
