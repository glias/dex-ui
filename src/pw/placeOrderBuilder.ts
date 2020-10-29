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
import BigNumber from 'bignumber.js'
import { getSudtLiveCels } from '../APIs'
import { OrderType } from '../containers/order'
import { buildSellData, getAmountFromCellData, buildChangeData, buildBuyData } from '../utils/buffer'
import { ORDER_BOOK_LOCK_SCRIPT, ORDER_CELL_CAPACITY, SUDT_DEP, SUDT_TYPE_SCRIPT } from '../utils/const'
import calcBuyReceive, { calcSellReceive } from '../utils/fee'

export class PlaceOrderBuilder extends Builder {
  address: Address

  amount: Amount

  orderType: OrderType

  price: string

  pay: string

  constructor(address: Address, amount: Amount, pay: string, orderType: OrderType, price: string, feeRate?: number) {
    super(feeRate)
    this.address = address
    this.amount = amount
    this.orderType = orderType
    this.price = price
    this.pay = pay
  }

  async buildSellTx(fee: Amount = Amount.ZERO): Promise<Transaction> {
    let sudtSum = new BigNumber(0)
    let inputSum = Amount.ZERO
    const orderLockAmount = new Amount(ORDER_CELL_CAPACITY.toString())
    const lockScript = PWCore.provider.address.toLockScript()
    const sudtChangeAmount = new Amount('142')
    const neededAmount = orderLockAmount.add(sudtChangeAmount).add(fee)

    const inputCells: Cell[] = []

    const orderLock = new Script(
      ORDER_BOOK_LOCK_SCRIPT.codeHash,
      this.address.toLockScript().toHash(),
      ORDER_BOOK_LOCK_SCRIPT.hashType,
    )

    const orderOutput = new Cell(orderLockAmount, orderLock, SUDT_TYPE_SCRIPT)
    const pay = this.amount.toString()

    // eslint-disable-next-line no-debugger

    const { data: cells } = await getSudtLiveCels(SUDT_TYPE_SCRIPT, lockScript, this.amount.toString())

    cells.forEach((cell: any) => {
      // eslint-disable-next-line no-debugger
      const sudtToken = new BigNumber(getAmountFromCellData(cell.data))
      sudtSum = sudtSum.plus(sudtToken)
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
      // eslint-disable-next-line no-debugger
      inputSum = inputSum.add(new Amount(cellOutput.capacity, AmountUnit.shannon))
    })

    if (inputSum.lte(neededAmount)) {
      const extraCells = await this.collector.collect(this.address, neededAmount.sub(inputSum).add(Builder.MIN_CHANGE))
      extraCells.forEach(cell => {
        if (inputSum.lte(neededAmount)) {
          inputCells.push(cell)
          inputSum = inputSum.add(cell.capacity)
        }
      })
    }

    const orderOutputData = buildSellData(this.pay, calcSellReceive(pay, this.price), this.price)
    orderOutput.setHexData(orderOutputData)

    const ckbChangeCell = new Cell(inputSum.sub(neededAmount), this.address.toLockScript())

    const sudtChangeCell = new Cell(
      sudtChangeAmount,
      this.address.toLockScript(),
      new Script(SUDT_TYPE_SCRIPT.codeHash, SUDT_TYPE_SCRIPT.args, SUDT_TYPE_SCRIPT.hashType),
    )

    const sudtChange = new BigNumber(sudtSum.toString()).minus(new BigNumber(this.pay)).toString()
    sudtChangeCell.setHexData(buildChangeData(sudtChange))

    const tx = new Transaction(new RawTransaction(inputCells, [orderOutput, sudtChangeCell, ckbChangeCell]), [
      Builder.WITNESS_ARGS.Secp256k1,
    ])

    tx.raw.cellDeps.push(SUDT_DEP)
    this.fee = Builder.calcFee(tx)

    if (ckbChangeCell.capacity.gte(Builder.MIN_CHANGE.add(this.fee))) {
      ckbChangeCell.capacity = ckbChangeCell.capacity.sub(this.fee)
      tx.raw.outputs.pop()
      tx.raw.outputs.push(ckbChangeCell)
      // eslint-disable-next-line no-debugger
      return tx
    }

    return this.buildSellTx(this.fee)
  }

  async build(fee: Amount = Amount.ZERO): Promise<Transaction> {
    if (this.orderType === OrderType.Sell) {
      return this.buildSellTx()
    }

    const neededAmount = this.amount.add(fee)
    let inputSum = Amount.ZERO
    const inputCells: Cell[] = []

    const orderLock = new Script(
      ORDER_BOOK_LOCK_SCRIPT.codeHash,
      this.address.toLockScript().toHash(),
      ORDER_BOOK_LOCK_SCRIPT.hashType,
    )

    const orderOutput = new Cell(this.amount, orderLock, SUDT_TYPE_SCRIPT)
    orderOutput.setHexData(buildBuyData(calcBuyReceive(this.pay, this.price).toString(), this.price))
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
