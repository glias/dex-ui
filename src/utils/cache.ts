import type { SubmittedOrder } from '../containers/order'

const PENDING_ORDERS_LABEL = 'ckb_dex_pending_orders'
const SUBMITTED_ORDERS_LABEL = 'ckb_dex_submitted_orders'
const SPENDT_CELLS_LABEL = 'ckb_dex_spent_cells'
const force_bridge_settings = 'ckb_force_bridge_settings'
export const REPLAY_RESIST_OUTPOINT = 'ckb_replay_resist_outpoint'

export interface SpentCell {
  tx_hash: string
  index: string
  timestamp?: string
}

export const replayResistOutpoints = {
  get: () => {
    try {
      return JSON.parse(localStorage.getItem(REPLAY_RESIST_OUTPOINT)!) || {}
    } catch (err) {
      return {}
    }
  },
  add: (address: string, hashes: string[]) => {
    const outpoints = replayResistOutpoints.get()
    const ops = outpoints[address] || []
    outpoints[address] = ops.concat(hashes.filter(hash => !ops.includes(hash)))
    localStorage.setItem(REPLAY_RESIST_OUTPOINT, JSON.stringify(outpoints))
  },
  remove: (address: string, hash: string) => {
    const outpoints = replayResistOutpoints.get()
    outpoints[address] = (outpoints[address] || []).filter((o: string) => o !== hash)
    localStorage.setItem(REPLAY_RESIST_OUTPOINT, JSON.stringify(outpoints))
  },
}

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
  get(address: string) {
    try {
      return JSON.parse(localStorage.getItem(`${SUBMITTED_ORDERS_LABEL}:${address}`)!) || []
    } catch (err) {
      return []
    }
  },
  set(address: string, orders: Array<SubmittedOrder>) {
    return localStorage.setItem(`${SUBMITTED_ORDERS_LABEL}:${address}`, JSON.stringify(orders))
  },
}

export const forceBridgeSettings = {
  get() {
    try {
      return JSON.parse(localStorage.getItem(`${force_bridge_settings}`)!) || {}
    } catch (err) {
      return {}
    }
  },
  set(settings: any) {
    return localStorage.setItem(`${force_bridge_settings}`, JSON.stringify(settings))
  },
}

const isSameSpentCell = (c1: SpentCell, c2: SpentCell) => {
  return c1.index === c2.index && c1.tx_hash === c2.tx_hash
}

export const spentCells = {
  get: (): SpentCell[] => {
    try {
      return JSON.parse(localStorage.getItem(SPENDT_CELLS_LABEL)!) || []
    } catch (err) {
      return []
    }
  },
  add: (cells: SpentCell[]) => {
    const allSpentCells = spentCells.get()
    for (let i = 0; i < cells.length; i++) {
      const cell = cells[i]
      if (!allSpentCells.some(c => isSameSpentCell(c, cell))) {
        allSpentCells.push(cell)
      }
    }
    spentCells.set(allSpentCells)
  },
  remove: (cells: SpentCell[]) => {
    const allSpentCells = spentCells.get()
    for (let i = 0; i < allSpentCells.length; i++) {
      const cell = allSpentCells[i]
      if (cells.some(c => isSameSpentCell(c, cell))) {
        allSpentCells.splice(i, 1)
      }
    }
    spentCells.set(allSpentCells)
  },
  set: (cells: SpentCell[]) => {
    localStorage.setItem(SPENDT_CELLS_LABEL, JSON.stringify(cells))
  },
}

export default { pendingOrders, submittedOrders, spentCells }
