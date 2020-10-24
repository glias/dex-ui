import axios from 'axios'

const SERVER_URL = 'http://192.168.110.123:8080'

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
  const url = `${SERVER_URL}/order-history?public_key_hash=${lockArgs}&type_code_hash=0xc5e5dcf215925f7ef4dfaf5f4b4f105bc321c02776d6e7d52a1db3fcd9d011a4&type_hash_type=type&type_args=0x6fe3733cd9df22d05b8a70f7b505d0fb67fb58fb88693217135ff5079713e902`
  return axios.get(url)
}

export default getLiveCells