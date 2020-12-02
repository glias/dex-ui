import { TransactionDetailModel } from 'APIs'

const PENDING_SEND_TXS = 'pending_send_txs'

interface TimedTransactionDetailModel extends TransactionDetailModel {
  timestamp: number
}

export function setPendingTransactions(txs: TimedTransactionDetailModel[]) {
  localStorage.setItem(PENDING_SEND_TXS, JSON.stringify(txs))
}

export function getPendingTransactions(): TimedTransactionDetailModel[] {
  return JSON.parse(localStorage.getItem(PENDING_SEND_TXS) || '[]')
}

export function addPendingTransactions(tx: TimedTransactionDetailModel) {
  setPendingTransactions(getPendingTransactions().concat(tx))
}

export function removePendingTransactions(txHashes: string[]) {
  const txs = getPendingTransactions()
  const set = new Set(txHashes)
  setPendingTransactions(txs.filter(tx => !set.has(tx.txHash)))
}

export function findByTxHash(txHash: string): TimedTransactionDetailModel | null {
  return getPendingTransactions().find(tx => tx.txHash === txHash) || null
}
