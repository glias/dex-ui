/** eslint-disable import/no-unresolved */
import CKB from '@nervosnetwork/ckb-sdk-core'
import { CKB_NODE_URL } from '../constants'
import { spentCells } from '../utils'

export const checkSubmittedTxs = async (hashes: Array<string>) => {
  const ckb = new CKB(CKB_NODE_URL)
  const allSpentCells = spentCells.get()
  const spentCellsLength = allSpentCells.length
  const requests: Array<['getTransaction', string]> = hashes.map(hash => ['getTransaction', hash])
  try {
    const resList = await ckb.rpc.createBatchRequest(requests).exec()
    const unconfirmedHashes: Array<boolean> = []
    for (let i = 0; i < resList.length; i++) {
      const tx = resList[i]
      const inputs = tx?.transaction?.inputs ?? []
      if (tx?.txStatus?.status === 'committed') {
        unconfirmedHashes.push(true)
        for (let j = 0; j < spentCellsLength; j++) {
          const cell = allSpentCells[j] || {}
          if (
            inputs.some(
              (input: any) => input.previousOutput.index === cell.index && input.previousOutput.txHash === cell.tx_hash,
            )
          ) {
            allSpentCells.splice(j, 1)
          }
        }
      } else {
        unconfirmedHashes.push(false)
      }
    }

    if (spentCellsLength !== allSpentCells.length) {
      spentCells.set(allSpentCells)
    }

    return unconfirmedHashes
  } catch (e) {
    return new Array<boolean>(requests.length).fill(false)
  }
}

export default { checkSubmittedTxs }
