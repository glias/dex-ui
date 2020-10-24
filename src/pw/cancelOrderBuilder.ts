import PWCore, { Builder, Transaction, Cell, Amount, RawTransaction, Address, OutPoint } from '@lay2/pw-core'
import { CKB_NODE_URL, ORDER_BOOK_LOOK_DEP, SUDT_DEP } from '../utils/const'

export class CancelOrderBuilder extends Builder {
  address: Address

  outPoint: OutPoint

  inputCapacity: Amount

  constructor(address: Address, outPoint: OutPoint, inputCapacity: Amount, feeRate?: number) {
    super(feeRate)
    this.address = address
    this.outPoint = outPoint
    this.inputCapacity = inputCapacity
  }

  async build(fee: Amount = Amount.ZERO): Promise<Transaction> {
    const outputCapacity = this.inputCapacity.sub(fee)
    const input = await Cell.loadFromBlockchain(new PWCore(CKB_NODE_URL).rpc, this.outPoint)
    const lockArgs = this.address.toLockScript()
    // eslint-disable-next-line no-debugger
    const output = new Cell(outputCapacity, lockArgs)

    const tx = new Transaction(new RawTransaction([input], [output]), [Builder.WITNESS_ARGS.Secp256k1])
    tx.raw.cellDeps.push(ORDER_BOOK_LOOK_DEP)
    tx.raw.cellDeps.push(SUDT_DEP)
    tx.raw.outputsData = ['0x']
    this.fee = Builder.calcFee(tx)
    tx.raw.outputs[0].capacity = outputCapacity.sub(this.fee)

    return tx
  }
}

export default CancelOrderBuilder
