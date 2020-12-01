import { AxiosResponse } from 'axios'
import { explorerClient } from '.'

export interface DisplayInput {
  id: string
  from_cellbase: boolean
  capacity: string
  address_hash: string
  generated_tx_hash: string
  cell_index: string
  cell_type: string
}

export interface DisplayOutput {
  id: string
  capacity: string
  address_hash: string
  status: string
  consumed_tx_hash: string
  cell_type: string
}

export interface Attributes {
  is_cellbase: boolean
  transaction_hash: string
  block_number: string
  block_timestamp: string
  display_inputs: DisplayInput[]
  display_outputs: DisplayOutput[]
  income: string
}

export interface Datum {
  id: string
  type: string
  attributes: Attributes
}

export interface Meta {
  total: number
  page_size: number
}

export interface Links {
  self: string
}

export interface RootObject {
  data: Datum[]
  meta: Meta
  links: Links
}

export function getCkbTransactions(
  address: string,
  page: number = 1,
  pageSize: number = 100,
): Promise<AxiosResponse<RootObject>> {
  const params = {
    page,
    page_size: pageSize,
  }

  return explorerClient({
    method: 'get',
    url: `/address_transactions/${address}`,
    params,
    data: null,
  })
}
