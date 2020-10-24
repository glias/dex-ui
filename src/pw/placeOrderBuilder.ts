import PWCore, { Builder, Transaction, Cell, Amount, AmountUnit, RawTransaction, Address, Script } from '@lay2/pw-core'
import { ORDER_BOOK_LOOK_SCRIPT, SUDT_DEP, SUDT_TYPE_SCRIPT } from '../utils/const'

export class PlaceOrderBuilder extends Builder {
  address: Address

  amount: Amount

  cellData: string

  constructor(address: Address, amount: Amount, cellData = '0x', feeRate?: number) {
    super(feeRate)
    this.address = address
    this.amount = amount
    this.cellData = cellData
  }

  async build(fee: Amount = Amount.ZERO): Promise<Transaction> {
    const neededAmount = this.amount.add(fee)
    let inputSum = Amount.ZERO
    const inputCells: Cell[] = []

    const orderLock = new Script(
      ORDER_BOOK_LOOK_SCRIPT.codeHash,
      this.address.toLockScript().args,
      ORDER_BOOK_LOOK_SCRIPT.hashType,
    )

    const orderOutput = new Cell(this.amount, orderLock, SUDT_TYPE_SCRIPT)

    // fill the inputs
    const cells = await this.collector.collect(PWCore.provider.address, neededAmount)
    cells.forEach(cell => {
      if (inputSum.lte(neededAmount.add(Builder.MIN_CHANGE))) {
        inputCells.push(cell)
        inputSum = inputSum.add(cell.capacity)
      }
    })

    if (inputSum.lt(neededAmount)) {
      throw new Error(
        `input capacity not enough, need ${neededAmount.toString(AmountUnit.ckb)}, got ${inputSum.toString(
          AmountUnit.ckb,
        )}`,
      )
    }

    const changeCell = new Cell(inputSum.sub(neededAmount), PWCore.provider.address.toLockScript())

    const tx = new Transaction(new RawTransaction(inputCells, [orderOutput, changeCell]), [
      Builder.WITNESS_ARGS.Secp256k1,
    ])

    tx.raw.cellDeps.push(SUDT_DEP)
    tx.raw.outputsData = [this.cellData, '0x']

    this.fee = Builder.calcFee(tx)

    if (changeCell.capacity.gte(Builder.MIN_CHANGE.add(this.fee))) {
      changeCell.capacity = changeCell.capacity.sub(this.fee)
      tx.raw.outputs.pop()
      tx.raw.outputs.push(changeCell)
      return tx
    }

    return this.build(this.fee)
  }
}

export default PlaceOrderBuilder
