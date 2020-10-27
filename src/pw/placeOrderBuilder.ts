import PWCore, {
  Builder,
  Transaction,
  Cell,
  Amount,
  AmountUnit,
  RawTransaction,
  Address,
  Script,
  OutPoint,
} from '@lay2/pw-core'
import { getSudtLiveCels } from '../APIs'
import { OrderType } from '../containers/order'
import { buildSellData, getAmountFromCellData } from '../utils/buffer'
import { ORDER_BOOK_LOOK_SCRIPT, ORDER_CELL_CAPACITY, SUDT_DEP, SUDT_TYPE_SCRIPT } from '../utils/const'
import calcReceive from '../utils/fee'

export class PlaceOrderBuilder extends Builder {
  address: Address

  amount: Amount

  cellData: string

  orderType: OrderType

  price: string

  constructor(
    address: Address,
    amount: Amount,
    cellData = '0x',
    orderType: OrderType,
    price: string,
    feeRate?: number,
  ) {
    super(feeRate)
    this.address = address
    this.amount = amount
    this.cellData = cellData
    this.orderType = orderType
    this.price = price
  }

  async buildSellTx(fee: Amount = Amount.ZERO): Promise<Transaction> {
    // eslint-disable-next-line no-debugger
    debugger
    const needAmount = this.amount.add(fee)
    console.log(needAmount)

    let sudtSum = BigInt(0)
    let inputSum = Amount.ZERO
    const orderLockAmount = new Amount(ORDER_CELL_CAPACITY.toString())
    const lockScript = PWCore.provider.address.toLockScript()

    const inputCells: Cell[] = []

    const orderLock = new Script(
      ORDER_BOOK_LOOK_SCRIPT.codeHash,
      this.address.toLockScript().args,
      ORDER_BOOK_LOOK_SCRIPT.hashType,
    )

    const orderOutput = new Cell(orderLockAmount, orderLock, SUDT_TYPE_SCRIPT)
    const pay = parseFloat(this.amount.toString())
    const price = parseFloat(this.price)

    // eslint-disable-next-line no-debugger

    const { data: cells } = await getSudtLiveCels(SUDT_TYPE_SCRIPT, lockScript, this.amount.toString())

    cells.forEach((cell: any) => {
      const sudtToken = BigInt(getAmountFromCellData(cell.data))
      sudtSum += sudtToken
      const cellOutput = cell.cell_output
      inputCells.push(
        new Cell(
          new Amount(cellOutput.capacity),
          new Script(cellOutput.lock.code_hash, cellOutput.lock.args, cellOutput.lock.hash_type),
          new Script(cellOutput.type.code_hash, cellOutput.type.args, cellOutput.type.hash_type),
          new OutPoint(cell.out_point.tx_hash, cell.out_point.index),
          cell.data,
        ),
      )
      inputSum = inputSum.add(new Amount(cellOutput.capacity, AmountUnit.shannon))
    })

    const orderOutputData = buildSellData(sudtSum.toString(), calcReceive(pay, price), price.toString())
    orderOutput.setHexData(orderOutputData)

    if (inputSum.lte(orderLockAmount)) {
      const [extraCell] = await this.collector.collect(this.address, Builder.MIN_CHANGE)
      inputCells.push(extraCell)
    }

    const changeCell = new Cell(inputSum.sub(orderLockAmount), this.address.toLockScript())
    // eslint-disable-next-line no-debugger
    const sudtChange = sudtSum - BigInt(this.amount.toString())
    changeCell.setHexData(buildSellData(sudtChange.toString(), '0', '0'))
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

    return tx
  }

  async build(fee: Amount = Amount.ZERO): Promise<Transaction> {
    if (this.orderType === OrderType.Sell) {
      return this.buildSellTx()
    }

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
