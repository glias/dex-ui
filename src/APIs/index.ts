import type { Cell } from '@ckb-lumos/base'
import { Script } from '@lay2/pw-core'
import axios, { AxiosResponse } from 'axios'
import { EXPLORER_API, SUDT_GLIA } from '../constants'
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

export function getCkbTransactions(address: string, page: number = 1, pageSize: number = 100) {
  const params = {
    page,
    page_size: pageSize,
  }

  // TODO: order history should get all sudt
  return axios.get(`${EXPLORER_API}address_transactions/${address}`, {
    params,
    headers: {
      'Content-Type': 'application/vnd.api+json',
      Accept: 'application/vnd.api+json',
    },
    data: null,
  })
}

interface SudtIncomingTransaction {
  hash: string
  income: string
}

interface SudtOutgoingTransaction {
  hash: string
  outgoing: string
}

export type SudtTransaction = SudtIncomingTransaction | SudtOutgoingTransaction

export function isSudtIncomingTransaction(
  sudtTransaction: SudtTransaction,
): sudtTransaction is SudtIncomingTransaction {
  return sudtTransaction && 'income' in sudtTransaction
}

export function isSudtOutgoingTransaction(
  sudtTransaction: SudtTransaction,
): sudtTransaction is SudtOutgoingTransaction {
  return sudtTransaction && 'outgoing' in sudtTransaction
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

export interface TransactionDetailModel {
  txHash: string
  from: string
  to: string
  amount: string
  fee: string
  blockNo: string
  blockNumber: number
  status: string
  token: string
  transactionFee: string
  direction: string
}

interface GetCkbTransactionDetailOptions {
  lock: Script
  txHash: string
}

export async function getCkbTransactionDetail(
  options: GetCkbTransactionDetailOptions,
): Promise<AxiosResponse<TransactionDetailModel>> {
  const { lock } = options

  const params = {
    lock_code_hash: lock.codeHash,
    lock_hash_type: lock.hashType,
    lock_args: lock.args,
    tx_hash: options.txHash,
  }
  return axios.get(`${SERVER_URL}/transactions-tx-hash`, { params })
}

interface GetSudtTransactionDetailOptions {
  txHash: string
  type: Script
  lock: Script
}

export async function getSudtTransactionDetail(options: GetSudtTransactionDetailOptions) {
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
  return axios.get(`${SERVER_URL}/transactions-tx-hash`, { params })
}
