import type { Cell } from '@ckb-lumos/base'
import { Script } from '@lay2/pw-core'
import axios, { AxiosResponse } from 'axios'
import { TransactionDirection, TransactionStatus } from 'components/Header/AssetsManager/api'
import { findByTxHash } from 'components/Header/AssetsManager/pendingTxs'
import { SUDT_GLIA } from '../constants'
import { OrderType } from '../containers/order'
import { spentCells } from '../utils'

export * from './checkSubmittedTxs'

const SERVER_URL = process.env.REACT_APP_SERVER_URL!

export function getLiveCells(typeCodeHash: string, typeArgs: string, lockCodeHash: string, lockArgs: string) {
  return axios.get(`${SERVER_URL}/cells`, {
    params: {
      type_code_hash: typeCodeHash,
      type_hash_type: 'type',
      type_args: typeArgs,
      lock_code_hash: lockCodeHash,
      lock_hash_type: 'type',
      lock_args: lockArgs,
    },
  })
}

export function getCkbLiveCells(lock: Script, ckbAmount: string): Promise<AxiosResponse<Cell[]>> {
  const params = {
    lock_code_hash: lock.codeHash,
    lock_hash_type: lock.hashType,
    lock_args: lock.args,
    ckb_amount: ckbAmount,
    spent_cells: spentCells.get(),
  }

  return axios.post(`${SERVER_URL}/cells-for-amount`, params)
}

export function getSudtLiveCells(type: Script, lock: Script, amount: string): Promise<AxiosResponse<Cell[]>> {
  const params = {
    type_code_hash: type.codeHash,
    type_hash_type: type.hashType,
    type_args: type.args,
    lock_code_hash: lock.codeHash,
    lock_hash_type: lock.hashType,
    lock_args: lock.args,
    sudt_amount: amount,
    spent_cells: spentCells.get(),
  }

  return axios.post(`${SERVER_URL}/cells-for-amount`, params)
}

export function getSudtBalance(type: Script, lock: Script) {
  const params = {
    type_code_hash: type.codeHash,
    type_hash_type: type.hashType,
    type_args: type.args,
    lock_code_hash: lock.codeHash,
    lock_hash_type: lock.hashType,
    lock_args: lock.args,
  }
  return axios.get(`${SERVER_URL}/sudt-balance`, {
    params,
  })
}

export function getCkbBalance(lock: Script) {
  const params = {
    lock_code_hash: lock.codeHash,
    lock_hash_type: lock.hashType,
    lock_args: lock.args,
  }
  return axios.get(`${SERVER_URL}/ckb-balance`, {
    params,
  })
}

export async function getBestPrice(type: Script, orderType: OrderType) {
  const params = {
    type_code_hash: type.codeHash,
    type_hash_type: type.hashType,
    type_args: type.args,
    is_bid: orderType === OrderType.Bid,
  }

  try {
    // if there is no order existed, get best price may failed
    const data = await axios.get(`${SERVER_URL}/best-price`, {
      params,
    })

    return data
  } catch (error) {
    return Promise.resolve({ data: { price: '0' } })
  }
}

export function getHistoryOrders(lockArgs: string) {
  const TypeScript = SUDT_GLIA.toTypeScript()

  const params = {
    order_lock_args: lockArgs,
    type_code_hash: TypeScript.codeHash,
    type_hash_type: TypeScript.hashType,
    type_args: TypeScript.args,
  }

  // TODO: order history should get all sudt
  return axios.get(`${SERVER_URL}/order-history`, {
    params,
  })
}

export type SudtTransaction = {
  hash: string
  income: string
  timestamp: string
}

export function isSudtIncomingTransaction(sudtTransaction: SudtTransaction): boolean {
  return !sudtTransaction.income.startsWith('-')
}

export function getSudtTransactions(type: Script, lock: Script): Promise<AxiosResponse<SudtTransaction[]>> {
  const params = {
    type_code_hash: type.codeHash,
    type_hash_type: type.hashType,
    type_args: type.args,
    lock_code_hash: lock.codeHash,
    lock_hash_type: lock.hashType,
    lock_args: lock.args,
  }

  return axios.get(`${SERVER_URL}/sudt-transactions`, { params })
}

interface RawResponseTransactionDetail {
  amount: string
  block_no: number
  from: string
  hash: string
  status: TransactionStatus
  to: string
  transaction_fee: string
}

export interface TransactionDetailModel {
  from: string
  to: string
  amount: string
  fee: string
  blockNumber: number
  status: TransactionStatus
  direction: TransactionDirection
  txHash: string
}

function transformResponseTransactionDetail(res: AxiosResponse<RawResponseTransactionDetail>): TransactionDetailModel {
  const direction = res.data.amount.startsWith('-') ? TransactionDirection.Out : TransactionDirection.In

  return {
    amount: res.data.amount,
    direction,
    blockNumber: res.data.block_no,
    fee: res.data.transaction_fee,
    from: res.data.from,
    to: res.data.to,
    status: res.data.status,
    txHash: res.data.hash,
  }
}

interface GetCkbTransactionDetailOptions {
  lock: Script
  txHash: string
}

async function unwrapGetTransactionByTxHash(txHash: string, params: any): Promise<TransactionDetailModel> {
  const res = await axios.get<RawResponseTransactionDetail>(`${SERVER_URL}/transactions-tx-hash`, { params })
  if (!res.data) return findByTxHash(txHash)!

  return transformResponseTransactionDetail(res)
}

export async function getCkbTransactionDetail(
  options: GetCkbTransactionDetailOptions,
): Promise<TransactionDetailModel> {
  const { lock, txHash } = options

  const params = {
    lock_code_hash: lock.codeHash,
    lock_hash_type: lock.hashType,
    lock_args: lock.args,
    tx_hash: txHash,
  }

  return unwrapGetTransactionByTxHash(txHash, params)
}

interface GetSudtTransactionDetailOptions {
  txHash: string
  type: Script
  lock: Script
}

export async function getSudtTransactionDetail(
  options: GetSudtTransactionDetailOptions,
): Promise<TransactionDetailModel> {
  const { lock, type, txHash } = options

  const params = {
    type_code_hash: type.codeHash,
    type_hash_type: type.hashType,
    type_args: type.args,
    lock_code_hash: lock.codeHash,
    lock_hash_type: lock.hashType,
    lock_args: lock.args,
    tx_hash: txHash,
  }
  return unwrapGetTransactionByTxHash(txHash, params)
}
