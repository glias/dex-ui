import {
  Address,
  AddressType,
  Amount,
  AmountUnit,
  Builder,
  Cell,
  CellDep,
  OutPoint,
  RawTransaction,
  Script,
  SUDT,
  Transaction,
} from '@lay2/pw-core'
import CKB from '@nervosnetwork/ckb-sdk-core'
import axios, { AxiosResponse } from 'axios'
import BigNumber from 'bignumber.js'
import { RPC as ToolKitRpc } from 'ckb-js-toolkit'
import { TransactionDirection, TransactionStatus } from 'components/Header/AssetsManager/api'
import { findByTxHash } from 'components/Header/AssetsManager/pendingTxs'
import DEXCollector from 'pw/dexCollector'
import PlaceOrderBuilder from 'pw/placeOrderBuilder'
import { calcAskReceive } from 'utils/fee'
import Web3 from 'web3'
import { CKB_NODE_URL, CROSS_CHAIN_FEE_RATE, ORDER_BOOK_LOCK_SCRIPT, SUDT_GLIA, SUDT_LIST } from '../constants'
import { OrderType } from '../containers/order'
import { buildSellData, replayResistOutpoints, spentCells, toHexString } from '../utils'

export * from './checkSubmittedTxs'
export * from './bridge'

const SERVER_URL = process.env.REACT_APP_SERVER_URL!
const FORCE_BRIDGER_SERVER_URL = process.env.REACT_APP_FORCE_BRIDGE_SERVER_URL!

export const ckb = new CKB(CKB_NODE_URL)

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

export function getCkbLiveCells(
  lock: Script,
  ckbAmount: string,
  skipSpentCells = false,
): Promise<AxiosResponse<Cell[]>> {
  const params = {
    lock_code_hash: lock.codeHash,
    lock_hash_type: lock.hashType,
    lock_args: lock.args,
    ckb_amount: ckbAmount,
    spent_cells: skipSpentCells ? [] : spentCells.get(),
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

export async function getAllHistoryOrders(lockArgs: string) {
  const res = await Promise.all(SUDT_LIST.map(sudt => getHistoryOrders(lockArgs, sudt)))
  return res
    .map((r, index) => {
      return r.data.map((d: any) => {
        return {
          ...d,
          tokenName: SUDT_LIST[index]?.info?.symbol ?? '',
        }
      })
    })
    .flat()
}

export function getHistoryOrders(lockArgs: string, sudt: SUDT = SUDT_GLIA) {
  const TypeScript = sudt.toTypeScript()

  const params = {
    order_lock_args: lockArgs,
    type_code_hash: TypeScript.codeHash,
    type_hash_type: TypeScript.hashType,
    type_args: TypeScript.args,
  }

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
  return axios.get<SudtTransaction[]>(`${SERVER_URL}/transactions`, { params })
}

export function getCkbTransactions(lock: Script): Promise<AxiosResponse<SudtTransaction[]>> {
  const params = {
    lock_code_hash: lock.codeHash,
    lock_hash_type: lock.hashType,
    lock_args: lock.args,
  }
  return axios.get<SudtTransaction[]>(`${SERVER_URL}/transactions`, { params })
}

export function getTransactionHeader(blockHashes: string[]) {
  const requests: Array<['getHeader', any]> = blockHashes.map(hash => ['getHeader', hash])
  return ckb.rpc.createBatchRequest(requests).exec()
}

// eslint-disable-next-line consistent-return
export async function getOrCreateBridgeCell(
  ckbAddress: string,
  ethAddress = '0x0000000000000000000000000000000000000000',
  bridgeFee = '0x0',
  retry = 0,
): Promise<AxiosResponse<any>> {
  try {
    const res = await axios.post(`${FORCE_BRIDGER_SERVER_URL}/get_or_create_bridge_cell`, {
      recipient_address: ckbAddress,
      eth_token_address: ethAddress,
      bridge_fee: bridgeFee,
    })

    return res
  } catch (error) {
    if (retry >= 5) {
      return Promise.resolve(Object.create({}))
    }
    // eslint-disable-next-line no-param-reassign
    retry += 1
    return getOrCreateBridgeCell(ckbAddress, ethAddress, bridgeFee, retry)
  }
}

export async function shadowAssetCrossOut(
  pay: string,
  ckbAddress: string,
  ethAddress: string,
  tokenAddress = '0x0000000000000000000000000000000000000000',
  decimal = ETH_DECIMAL_INT,
) {
  const payWithDecimal = new BigNumber(pay).times(new BigNumber(10).pow(decimal))
  const totalPay = payWithDecimal.times(1 + CROSS_CHAIN_FEE_RATE)
  const amount = `0x${totalPay.toString(16)}`
  const unlockFee = `0x${payWithDecimal.times(CROSS_CHAIN_FEE_RATE).toString(16)}`

  return axios.post(`${FORCE_BRIDGER_SERVER_URL}/burn`, {
    from_lockscript_addr: ckbAddress,
    unlock_fee: unlockFee,
    amount,
    token_address: tokenAddress,
    recipient_address: ethAddress,
    sender: ethAddress,
  })
}

export async function shadowAssetCrossIn(
  pay: string,
  ckbAddress: string,
  ethAddress: string,
  web3: Web3,
  tokenAddress = '0x0000000000000000000000000000000000000000',
  decimal = ETH_DECIMAL_INT,
  bridgeFee = '0x0',
) {
  const amount = `0x${new BigNumber(pay).times(new BigNumber(10).pow(decimal)).toString(16)}`
  const key = `${ckbAddress}-${tokenAddress}`
  const outpoints = replayResistOutpoints.get()[key]
  const op = outpoints.shift()
  const gasPrice = await web3.eth.getGasPrice()
  const nonce = await web3.eth.getTransactionCount(ethAddress)
  const res = await axios.post(`${FORCE_BRIDGER_SERVER_URL}/lock`, {
    token_address: tokenAddress,
    amount,
    bridge_fee: bridgeFee,
    ckb_recipient_address: ckbAddress,
    replay_resist_outpoint: op,
    sudt_extra_data: '',
    gas_price: toHexString(gasPrice),
    nonce: toHexString(nonce),
    sender: ethAddress,
  })
  if (outpoints.length <= 1) {
    getOrCreateBridgeCell(ckbAddress, ethAddress).then(r => {
      replayResistOutpoints.add(key, r.data.outpoints)
    })
  }
  replayResistOutpoints.remove(key, op)
  return res
}

const ETH_DECIMAL_INT = 18

export async function placeCrossChainOrder(
  pay: string,
  price: string,
  _: string,
  ckbAddress: string,
  ethAddress: string,
  web3: Web3,
  sudt: SUDT,
  tokenAddress = '0x0000000000000000000000000000000000000000',
  bridgeFee = '0x0',
) {
  const decimal = sudt?.info?.decimals ?? ETH_DECIMAL_INT

  // TODO: remove place order
  const builder = new PlaceOrderBuilder(
    new Address(ckbAddress, AddressType.ckb),
    new Amount(pay, decimal),
    OrderType.Ask,
    price,
    sudt,
    new DEXCollector() as any,
  )

  const receive = calcAskReceive(builder.pay.toString(decimal), price)
  const data = buildSellData(builder.totalPay.toString(decimal), receive, price, decimal).slice(2)
  const amount = new BigNumber(builder.totalPay.toString(decimal)).times(new BigNumber(10).pow(decimal)).toString()
  const sudtData = data.slice(32, data.length)

  const orderLock = new Script(
    ORDER_BOOK_LOCK_SCRIPT.codeHash,
    new Address(ckbAddress, AddressType.ckb).toLockScript().toHash(),
    ORDER_BOOK_LOCK_SCRIPT.hashType,
  )

  const recipientAddress = orderLock.toAddress().toCKBAddress()
  const key = `${recipientAddress}-${tokenAddress}`
  const outpoints = replayResistOutpoints.get()[key]
  const op = outpoints.shift()

  const gasPrice = await web3.eth.getGasPrice()
  const nonce = await web3.eth.getTransactionCount(ethAddress)

  const res = await axios.post(`${FORCE_BRIDGER_SERVER_URL}/lock`, {
    sender: ethAddress,
    token_address: tokenAddress,
    amount: toHexString(amount),
    bridge_fee: bridgeFee,
    ckb_recipient_address: recipientAddress,
    replay_resist_outpoint: op,
    sudt_extra_data: sudtData,
    gas_price: toHexString(gasPrice),
    nonce: toHexString(nonce),
  })
  if (outpoints.length <= 1) {
    getOrCreateBridgeCell(recipientAddress, ethAddress).then(r => {
      replayResistOutpoints.add(key, r.data.outpoints)
    })
  }
  replayResistOutpoints.remove(key, op)
  return res
}

export type Orders = Record<'receive' | 'price', string>[]

export interface OrdersResult {
  bid_orders: Orders
  ask_orders: Orders
}

export function getOrders(sudt: SUDT = SUDT_GLIA): Promise<AxiosResponse<OrdersResult>> {
  const TypeScript = sudt.toTypeScript()

  const params = {
    type_code_hash: TypeScript.codeHash,
    type_hash_type: TypeScript.hashType,
    type_args: TypeScript.args,
    decimal: sudt?.info?.decimals,
  }

  return axios.get(`${SERVER_URL}/orders`, {
    params,
  })
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

export function getCurrentPrice(sudt: SUDT = SUDT_GLIA): Promise<AxiosResponse<string>> {
  const TypeScript = sudt.toTypeScript()

  const params = {
    type_code_hash: TypeScript.codeHash,
    type_hash_type: TypeScript.hashType,
    type_args: TypeScript.args,
  }

  return axios.get(`${SERVER_URL}/current-price`, {
    params,
  })
}

export interface ForceBridgeHistory {
  ckb_to_eth: ForceBridgeItem[]
  eth_to_ckb: ForceBridgeItem[]
}

export interface ForceBridgeItem {
  ckb_tx_hash?: string
  eth_tx_hash: string
  id: string
  amount: string
  token_addr: string
  status: 'error' | 'pending' | 'success'
}

export function getForceBridgeHistory(
  ckbAddress: string,
  ethAddress: string,
  pureCross = false,
): Promise<AxiosResponse<ForceBridgeHistory>> {
  const orderLock = new Script(
    ORDER_BOOK_LOCK_SCRIPT.codeHash,
    new Address(ckbAddress, AddressType.ckb).toLockScript().toHash(),
    ORDER_BOOK_LOCK_SCRIPT.hashType,
  )
  return axios.post(`${FORCE_BRIDGER_SERVER_URL}/get_crosschain_history`, {
    ckb_recipient_lockscript_addr: pureCross ? ckbAddress : orderLock.toAddress().toCKBAddress(),
    eth_recipient_addr: ethAddress,
  })
}

export function relayEthToCKB(hash: string) {
  return axios.post(`${FORCE_BRIDGER_SERVER_URL}/relay_eth_to_ckb_proof`, {
    eth_lock_tx_hash: hash,
  })
}

export const toolkitRPC = new ToolKitRpc(CKB_NODE_URL)

export async function rawTransactionToPWTransaction(rawTx: RPC.RawTransaction) {
  const inputs = await Promise.all(
    rawTx.inputs.map(i =>
      Cell.loadFromBlockchain(toolkitRPC, new OutPoint(i.previous_output?.tx_hash!, i.previous_output?.index!)),
    ),
  )

  const outputs = rawTx.outputs.map(
    (o, index) =>
      new Cell(
        new Amount(o.capacity, AmountUnit.shannon),
        new Script(o.lock.code_hash, o.lock.args, o.lock.hash_type as any),
        o.type ? new Script(o.type.code_hash, o.type.args, o.type.hash_type as any) : undefined,
        undefined,
        rawTx.outputs_data[index],
      ),
  )

  const cellDeps = rawTx.cell_deps.map(
    c => new CellDep(c.dep_type as any, new OutPoint(c.out_point?.tx_hash!, c.out_point?.index!)),
  )

  const tx = new Transaction(new RawTransaction(inputs, outputs, cellDeps, rawTx.header_deps, rawTx.version), [
    Builder.WITNESS_ARGS.Secp256k1,
  ])

  return tx
}

export function getForceBridgeSettings() {
  return axios.get(`${FORCE_BRIDGER_SERVER_URL}/settings`)
}
