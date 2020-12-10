import { TransactionDetailModel } from 'APIs'

const PENDING_SEND_TXS = 'pending_send_txs'

interface PendingTransactionDetailModel extends TransactionDetailModel {
  tokenName: string
  timestamp: number
}

export function setPendingTransactions(txs: PendingTransactionDetailModel[]) {
  localStorage.setItem(PENDING_SEND_TXS, JSON.stringify(txs))
}

export function getPendingTransactions(): PendingTransactionDetailModel[] {
  return JSON.parse(localStorage.getItem(PENDING_SEND_TXS) || '[]')
}

export function addPendingTransactions(tx: PendingTransactionDetailModel) {
  setPendingTransactions(getPendingTransactions().concat(tx))
}

export function removePendingTransactions(txHashes: string[]) {
  const txs = getPendingTransactions()
  const set = new Set(txHashes)
  setPendingTransactions(txs.filter(tx => !set.has(tx.txHash)))
}

export function findByTxHash(txHash: string): PendingTransactionDetailModel | null {
  return getPendingTransactions().find(tx => tx.txHash === txHash) || null
}
