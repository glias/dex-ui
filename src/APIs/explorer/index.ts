import axios from 'axios'
import { EXPLORER_API } from '../../constants'

export const BASE_HEADERS = {
  'Content-Type': 'application/vnd.api+json',
  accept: 'application/vnd.api+json',
}
export const explorerClient = axios.create({
  baseURL: EXPLORER_API,
  headers: BASE_HEADERS,
})

export { getCkbTransactions } from './getCkbTransactions'
