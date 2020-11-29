import PWCore, { Provider, SUDT } from '@lay2/pw-core'
import { getSudtTransactions, isSudtIncomingTransaction } from 'APIs'

export type TransactionStatus = 'pending' | 'success' | 'failed'
export type TransferDirection = 'in' | 'out'

export interface TransferSummary {
  tokenName: string
  direction: TransferDirection
  status: TransactionStatus
  date: string
  amount: string
  txHash: string
}

interface GetSudtTransferSummariesOptions {
  sudt: SUDT
  direction?: TransferDirection
  provider?: Provider
}

export async function getSudtTransferSummaries(options: GetSudtTransferSummariesOptions): Promise<TransferSummary[]> {
  const { sudt, provider = PWCore.provider, direction } = options
  const sudtTxRes = await getSudtTransactions(sudt.toTypeScript(), provider.address.toLockScript())
  const sudtTxs = sudtTxRes.data
  if (!sudtTxs.length) return []

  // TODO
  //   const ckbTxs = await getCkbTransactions(provider.address.toCKBAddress())

  // eslint-disable-next-line no-console
  //   console.log(ckbTxs)

  const transfers = sudtTxs.map<TransferSummary>(tx => ({
    amount: isSudtIncomingTransaction(tx) ? tx.income : tx.outgoing,
    direction: isSudtIncomingTransaction(tx) ? 'in' : 'out',
    tokenName: sudt.info?.name ?? '',
    txHash: tx.hash,
    date: '1970-01-01 00:00:00',
    status: 'pending',
  }))

  if (!direction) return transfers

  return transfers.filter(t => t.direction === direction)
}

// interface GetCkbTransferSummariesOptions {
//   provider?: Provider
// }

export async function getCkbTransferSummaries(): Promise<TransferSummary[]> {
  // const transactions = getCkbTransactions(provider.address.toCKBAddress())

  return []
}
