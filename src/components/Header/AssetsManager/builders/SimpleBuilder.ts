import PWCore, {
  Address,
  Amount,
  AmountUnit,
  Builder,
  Cell,
  Collector,
  RawTransaction,
  Transaction,
} from '@lay2/pw-core'

export class ForceSimpleBuilder extends Builder {
  constructor(private address: Address, private amount: Amount, feeRate?: number, collector?: Collector) {
    super(feeRate, collector)
  }

  async build(fee: Amount = Amount.ZERO): Promise<Transaction> {
    const outputCell = new Cell(this.amount, this.address.toLockScript())
    const neededAmount = this.amount.add(fee)
    let inputSum = new Amount('0')
    const inputCells: Cell[] = []

    // fill the inputs
    const cells = await this.collector.collect(PWCore.provider.address, {
      neededAmount,
    })

    cells.forEach(cell => {
      inputCells.push(cell)
      inputSum = inputSum.add(cell.capacity)
    })

    if (inputSum.lt(neededAmount)) {
      throw new Error(
        `input capacity not enough, need ${neededAmount.toString(AmountUnit.ckb)}, got ${inputSum.toString(
          AmountUnit.ckb,
        )}`,
      )
    }

    if (inputSum.sub(outputCell.capacity).lt(Builder.MIN_CHANGE)) {
      const tx = new Transaction(new RawTransaction(inputCells, [outputCell]), [Builder.WITNESS_ARGS.Secp256k1])
      this.fee = Builder.calcFee(tx, this.feeRate)
      outputCell.capacity = outputCell.capacity.sub(this.fee)
      return tx
    }

    const changeCell = new Cell(inputSum.sub(outputCell.capacity), PWCore.provider.address.toLockScript())

    const tx = new Transaction(new RawTransaction(inputCells, [outputCell, changeCell]), [
      Builder.WITNESS_ARGS.Secp256k1,
    ])

    this.fee = Builder.calcFee(tx, this.feeRate)

    if (changeCell.capacity.gte(Builder.MIN_CHANGE.add(this.fee))) {
      changeCell.capacity = changeCell.capacity.sub(this.fee)
      tx.raw.outputs.pop()
      tx.raw.outputs.push(changeCell)
      return tx
    }

    return this.build(this.fee)
  }

  getCollector() {
    return this.collector
  }
}
