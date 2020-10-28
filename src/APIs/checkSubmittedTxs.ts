import CKB from '@nervosnetwork/ckb-sdk-core'
import { CKB_NODE_URL } from '../utils'

export const checkSubmittedTxs = (hashes: Array<string>) => {
  const ckb = new CKB(CKB_NODE_URL)
  const requests: Array<['getTransaction', string]> = hashes.map(hash => ['getTransaction', hash])
  return ckb.rpc
    .createBatchRequest(requests)
    .exec()
    .then(resList => resList.map(res => res.txStatus.status === 'committed'))
    .catch(() => {
      return new Array<boolean>(requests.length).fill(false)
    })
}

export default { checkSubmittedTxs }
