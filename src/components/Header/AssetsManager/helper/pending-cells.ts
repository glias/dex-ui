import { RawTransaction } from '@lay2/pw-core'
import { spentCells } from '../../../../utils'

export function markTransactionInputCellsAsPending(tx: RawTransaction) {
  spentCells.add(tx.inputs.map(input => input.previousOutput.serializeJson()) as any)
}
