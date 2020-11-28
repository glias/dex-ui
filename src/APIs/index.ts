import CKB from '@nervosnetwork/ckb-sdk-core'
import { Address, AddressType, Script, SUDT } from '@lay2/pw-core'
import type { Cell } from '@ckb-lumos/base'
import axios, { AxiosResponse } from 'axios'
import { OrderType } from '../containers/order'
import { CKB_NODE_URL, EXPLORER_API, ORDER_BOOK_LOCK_SCRIPT, SUDT_GLIA } from '../constants'
import { spentCells } from '../utils'

export * from './checkSubmittedTxs'

const SERVER_URL = process.env.REACT_APP_SERVER_URL!
const FORCE_BRIDGER_SERVER_URL = 'http://121.196.29.165:3003'

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

export function getTransactionHeader(blockHashes: string[]) {
  const requests: Array<['getHeader', any]> = blockHashes.map(hash => ['getHeader', hash])
  return ckb.rpc.createBatchRequest(requests).exec()
}

export function getOrCreateBridgeCell(
  ckbAddress: string,
  ethAddress = '0x0000000000000000000000000000000000000000',
  bridgeFee = '0x0',
) {
  const orderLock = new Script(
    ORDER_BOOK_LOCK_SCRIPT.codeHash,
    new Address(ckbAddress, AddressType.ckb).toLockScript().toHash(),
    ORDER_BOOK_LOCK_SCRIPT.hashType,
  )
  return axios.post(`${FORCE_BRIDGER_SERVER_URL}/get_or_create_bridge_cell`, {
    recipient_address: orderLock.toAddress().toCKBAddress(),
    eth_token_address: ethAddress,
    bridge_fee: bridgeFee,
  })
}
