import axios from 'axios'
import { HISTORY_PARAMS } from '../utils'

const SERVER_URL = process.env.REACT_APP_SERVER_URL || 'http://192.168.110.123:8080'

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

export function getHistoryOrders(lockArgs: string) {
  const query = new URLSearchParams([
    ['public_key_hash', lockArgs],
    ['type_code_hash', HISTORY_PARAMS.typeCodeHash],
    ['type_hash_type', HISTORY_PARAMS.typeHashType],
    ['type_args', HISTORY_PARAMS.typeArgs],
  ])
  return axios.get(`${SERVER_URL}/order-history?${query}`)
}

export default getLiveCells
