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
import { ORDER_BOOK_LOCK_DEP, SUDT_DEP, CKB_NODE_URL } from '../utils/const'

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
    const cells = await this.collector.collect(this.address, { withData: false } as any)

    if (!cells.length) {
      throw new Error('Cannot find extra cells for validation')
    }

    const orderCell = await this.#getOrderCell()

    const inputCells: Cell[] = [cells[0], orderCell]
    const outputCells: Cell[] = [cells[0], orderCell.clone()]

    const tx = new Transaction(new RawTransaction(inputCells, outputCells), [Builder.WITNESS_ARGS.Secp256k1])

    tx.raw.cellDeps.push(ORDER_BOOK_LOCK_DEP)
    tx.raw.cellDeps.push(SUDT_DEP)

    outputCells[1].lock = this.address.toLockScript()
    this.fee = Builder.calcFee(tx)
    outputCells[1].capacity = outputCells[1].capacity.sub(this.fee)
    return tx
  }

  send() {
    return this.core.sendTransaction(this)
  }

  #getOrderCell = async () => {
    const res = await this.core.rpc.get_transaction(this.orderOutPoint.txHash)
    const cell = res.transaction.outputs[+this.orderOutPoint.index]
    const lockScript = new Script(cell.lock.code_hash, cell.lock.args, cell.lock.hash_type)
    const orderCell = new Cell(new Amount(cell.capacity, AmountUnit.shannon), lockScript, undefined, this.orderOutPoint)
    return orderCell
  }
}

export default CancelOrderBuilder
