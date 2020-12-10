import PWCore, {
  Builder,
  Transaction,
  Cell,
  Script,
  Amount,
  RawTransaction,
  Address,
  OutPoint,
  AmountUnit,
} from '@lay2/pw-core'
import { CKBNotEnough, LiveCellNotEnough } from 'exceptions'
import { ORDER_BOOK_LOCK_DEP, SUDT_DEP, CKB_NODE_URL } from '../constants'

export class CancelOrderBuilder extends Builder {
  address: Address

  orderOutPoint: OutPoint

  core = new PWCore(CKB_NODE_URL)

  constructor(address: Address, outPoint: OutPoint) {
    super()
    this.address = address
    this.orderOutPoint = outPoint
  }

  async build(): Promise<Transaction> {
    const cells = await this.collector.collect(this.address, { neededAmount: Builder.MIN_CHANGE })

    if (!cells.length) {
      // @ts-ignore
      const allCells = await this.collector.collect(this.address, { neededAmount: Builder.MIN_CHANGE }, true)
      if (allCells.length) {
        throw new LiveCellNotEnough()
      }
      throw new CKBNotEnough()
    }

    const [normalCell] = cells

    const orderCell = await this.#getOrderCell()

    const inputCells: Cell[] = [normalCell, orderCell]
    const outputCells: Cell[] = [normalCell, orderCell.clone()]

    const data = outputCells[1].getHexData().slice(0, 34)

    const isAmountZero = Amount.fromUInt128LE(data).toString() === '0'

    if (isAmountZero) {
      outputCells[1].setHexData('0x')
      outputCells[1].type = undefined
    } else {
      outputCells[1].setHexData(outputCells[1].getHexData().slice(0, 34))
    }

    const tx = new Transaction(new RawTransaction(inputCells, outputCells), [Builder.WITNESS_ARGS.Secp256k1])

    tx.raw.cellDeps.push(ORDER_BOOK_LOCK_DEP)
    tx.raw.cellDeps.push(SUDT_DEP)

    outputCells[1].lock = this.address.toLockScript()
    this.fee = Builder.calcFee(tx)
    outputCells[1].capacity = outputCells[1].capacity.sub(this.fee)
    return tx
  }

  send(tx?: Transaction) {
    return this.core.sendTransaction(tx ?? this)
  }

  #getOrderCell = async () => {
    const res = await this.core.rpc.get_transaction(this.orderOutPoint.txHash)
    const index = +this.orderOutPoint.index
    const cell = res.transaction.outputs[index]
    const outputData = res.transaction.outputs_data[index]
    const lockScript = new Script(cell.lock.code_hash, cell.lock.args, cell.lock.hash_type)
    const typeScript = cell.type ? new Script(cell.type.code_hash, cell.type.args, cell.type.hash_type) : undefined
    const orderCell = new Cell(
      new Amount(cell.capacity, AmountUnit.shannon),
      lockScript,
      typeScript,
      this.orderOutPoint,
      outputData,
    )
    return orderCell
  }
}

export default CancelOrderBuilder
