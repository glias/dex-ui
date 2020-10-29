import { Script } from '@lay2/pw-core'
import axios from 'axios'
import { OrderType } from '../containers/order'
import { SUDT_TYPE_SCRIPT } from '../utils'

export * from './checkSubmittedTxs'

const SERVER_URL = process.env.REACT_APP_SERVER_URL || 'https://dex-api.yuche.me'

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

export function getCkbLiveCels(type: Script, lock: Script, ckbAmount: string) {
  const params = {
    type_code_hash: type.codeHash,
    type_hash_type: type.hashType,
    type_args: type.args,
    lock_code_hash: lock.codeHash,
    lock_hash_type: lock.hashType,
    lock_args: lock.args,
    ckb_amount: ckbAmount,
  }

  return axios.get(`${SERVER_URL}/cells`, {
    params,
  })
}

export function getSudtLiveCels(type: Script, lock: Script, amount: string) {
  const params = {
    type_code_hash: type.codeHash,
    type_hash_type: type.hashType,
    type_args: type.args,
    lock_code_hash: lock.codeHash,
    lock_hash_type: lock.hashType,
    lock_args: lock.args,
    sudt_amount: amount,
  }

  return axios.get(`${SERVER_URL}/cells`, {
    params,
  })
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

export function getBestPrice(type: Script, orderType: OrderType) {
  const params = {
    type_code_hash: type.codeHash,
    type_hash_type: type.hashType,
    type_args: type.args,
    is_bid: orderType === OrderType.Sell,
  }

  return axios.get(`${SERVER_URL}/best-price`, {
    params,
  })
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
