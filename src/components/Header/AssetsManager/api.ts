import PWCore, { Provider, SUDT } from '@lay2/pw-core'
import { getSudtTransactions } from 'APIs'
import { getCkbTransactions } from 'APIs/explorer'
import { DateTime } from 'luxon'
import { getPendingTransactions, removePendingTransactions } from './pendingTxs'

export enum TransactionStatus {
  Pending = 'pending',
  Proposed = 'proposed',
  Committed = 'committed',
}

export enum TransactionDirection {
  In = 'in',
  Out = 'out',
}

interface DirectedAmount {
  amount: string
  direction: TransactionDirection
}

export interface TransactionSummary extends DirectedAmount {
  tokenName: string
  status: TransactionStatus
  date: string
  txHash: string
}

interface GetSudtTransferSummariesOptions {
  sudt: SUDT
  direction?: TransactionDirection
  provider?: Provider
}

function formatDateTime(timestamp: string | number): string {
  return DateTime.fromMillis(Number(timestamp)).toFormat('yyyy-MM-dd HH:mm:ss')
}

/**
 * remove exists pending transactions and return all pending transactions
 * @param tokenName
 * @param summaries
 */
function syncWithLocalStorage(tokenName: string, summaries: TransactionSummary[]): TransactionSummary[] {
  const hashes = summaries.map(s => s.txHash)
  removePendingTransactions(hashes)

  const cleanedSummaries = getPendingTransactions().map<TransactionSummary>(tx => ({
    amount: tx.amount,
    date: formatDateTime(Number(tx.timestamp)),
    tokenName,
    txHash: tx.txHash,
    direction: tx.direction,
    status: tx.status,
  }))

  return summaries.concat(cleanedSummaries).sort((l, r) => r.date.localeCompare(l.date))
}

export async function getSudtTransferSummaries(
  options: GetSudtTransferSummariesOptions,
): Promise<TransactionSummary[]> {
  const { sudt, provider = PWCore.provider, direction } = options
  const sudtTxRes = await getSudtTransactions(sudt.toTypeScript(), provider.address.toLockScript())
  const sudtTxs = sudtTxRes.data
  if (!sudtTxs.length) return []

  const tokenName = sudt.info?.name ?? ''

  let transfers = sudtTxs.map<TransactionSummary>(tx => ({
    ...signedAmountToDirectedAmount(tx.income),
    tokenName,
    txHash: tx.hash,
    date: formatDateTime(tx.timestamp),
    status: TransactionStatus.Committed,
  }))

  transfers = syncWithLocalStorage(tokenName, transfers)

  if (!direction) return transfers

  return transfers.filter(t => t.direction === direction)
}

function signedAmountToDirectedAmount(amount: string): DirectedAmount {
  if (amount.startsWith('-')) return { direction: TransactionDirection.Out, amount: amount.substring(1) }

  return { amount, direction: TransactionDirection.In }
}

interface GetCkbTransferSummariesOptions {
  direction?: TransactionDirection
}

export async function getCkbTransferSummaries(options?: GetCkbTransferSummariesOptions): Promise<TransactionSummary[]> {
  const transactions = await getCkbTransactions(PWCore.provider.address.toCKBAddress())

  const tokenName = 'CKB'

  let transfers = transactions.data.data.map<TransactionSummary>(tx => {
    const { amount, direction } = signedAmountToDirectedAmount(tx.attributes.income)

    return {
      amount,
      direction,
      date: formatDateTime(tx.attributes.block_timestamp),
      txHash: tx.attributes.transaction_hash,
      tokenName,
      status: TransactionStatus.Committed,
    }
  })

  transfers = syncWithLocalStorage(tokenName, transfers)

  const direction = options?.direction
  if (!direction) return transfers

  return transfers.filter(t => t.direction === direction)
}
