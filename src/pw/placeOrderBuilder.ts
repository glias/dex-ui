import PWCore, { Builder, Transaction, Cell, Amount, AmountUnit, RawTransaction, Address } from '@lay2/pw-core'
import { SUDT_DEP, SUDT_TYPE_SCRIPT } from '../utils/const'

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
    const neededAmount = Builder.MIN_CHANGE.add(fee)
    let inputSum = Amount.ZERO
    const inputCells: Cell[] = []

    const orderOutput = new Cell(this.amount, this.address.toLockScript(), SUDT_TYPE_SCRIPT)

    // fill the inputs
    const cells = await this.collector.collect(PWCore.provider.address, neededAmount)
    cells.forEach(cell => {
      if (inputSum.lte(neededAmount)) {
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

    const changeCell = new Cell(
      inputSum.sub(neededAmount.sub(Builder.MIN_CHANGE)),
      PWCore.provider.address.toLockScript(),
    )

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
