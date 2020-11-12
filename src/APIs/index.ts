import { Script } from '@lay2/pw-core'
import type { Cell } from '@ckb-lumos/base'
import axios, { AxiosResponse } from 'axios'
import { OrderType } from '../containers/order'
import { SUDT_TYPE_SCRIPT } from '../utils'

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
    is_bid: orderType === OrderType.Sell,
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
  const params = {
    order_lock_args: lockArgs,
    type_code_hash: SUDT_TYPE_SCRIPT.codeHash,
    type_hash_type: SUDT_TYPE_SCRIPT.hashType,
    type_args: SUDT_TYPE_SCRIPT.args,
  }

  return axios.get(`${SERVER_URL}/order-history`, {
    params,
  })
}

export default getLiveCells
