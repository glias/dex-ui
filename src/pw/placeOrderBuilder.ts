import {
  Builder,
  Transaction,
  Cell,
  Amount,
  AmountUnit,
  RawTransaction,
  Address,
  Script,
  SUDT,
  SUDTCollector,
} from '@lay2/pw-core'
import { LiveCellNotEnough } from 'exceptions'
import BigNumber from 'bignumber.js'
import { OrderType } from '../containers/order'
import { buildSellData, buildChangeData, buildBuyData } from '../utils/buffer'
import {
  ORDER_BOOK_LOCK_SCRIPT,
  ORDER_CELL_CAPACITY,
  SUDT_DEP,
  MIN_SUDT_CAPACITY,
  MAX_TRANSACTION_FEE,
  COMMISSION_FEE,
} from '../constants'
import { calcBidReceive, calcAskReceive } from '../utils/fee'

export class PlaceOrderBuilder extends Builder {
  address: Address

  orderType: OrderType

  price: string

  pay: Amount

  totalPay: Amount

  orderLock: Script

  inputLock: Script

  sudt: SUDT

  collector: SUDTCollector

  decimal: number

  constructor(
    address: Address,
    pay: Amount,
    orderType: OrderType,
    price: string,
    sudt: SUDT,
    collector: SUDTCollector,
    feeRate?: number,
  ) {
    super(feeRate)
    this.collector = collector
    this.address = address
    this.orderType = orderType
    this.price = price
    this.pay = pay
    const amount = new BigNumber(this.pay.toString())
    this.decimal = sudt?.info?.decimals ?? AmountUnit.ckb
    this.totalPay = new Amount(amount.plus(amount.times(COMMISSION_FEE)).toString())
    this.sudt = sudt
    this.orderLock = new Script(
      ORDER_BOOK_LOCK_SCRIPT.codeHash,
      this.address.toLockScript().toHash(),
      ORDER_BOOK_LOCK_SCRIPT.hashType,
    )

    this.inputLock = this.address.toLockScript()
  }

  async buildSellTx(fee: Amount = Amount.ZERO): Promise<Transaction> {
    let sudtSumAmount = Amount.ZERO
    let inputCapacity = Amount.ZERO
    const neededCapacity = new Amount(ORDER_CELL_CAPACITY.toString()).add(fee).add(new Amount(`${MAX_TRANSACTION_FEE}`))

    const inputs: Cell[] = []
    let outputs: Cell[] = []

    const orderOutput = new Cell(neededCapacity, this.orderLock, this.sudt.toTypeScript())

    const cells = await this.collector.collectSUDT(this.sudt, this.address, { neededAmount: this.totalPay })
    cells.forEach(cell => {
      // TODO: decimal
      sudtSumAmount = sudtSumAmount.add(cell.getSUDTAmount())
      inputs.push(cell)
      inputCapacity = inputCapacity.add(cell.capacity)
    })

    if (sudtSumAmount.lt(this.totalPay)) {
      throw new LiveCellNotEnough()
    }

    if (inputCapacity.lt(neededCapacity)) {
      const extraCells = await this.collector.collect(this.address, {
        neededAmount: neededCapacity.sub(inputCapacity).add(new Amount(MIN_SUDT_CAPACITY.toString())),
      })

      extraCells.forEach(cell => {
        if (inputCapacity.lte(neededCapacity)) {
          inputs.push(cell)
          inputCapacity = inputCapacity.add(cell.capacity)
        }
      })
    }

    if (inputCapacity.lt(neededCapacity)) {
      throw new LiveCellNotEnough()
    }

    const receive = calcAskReceive(this.pay.toString(this.decimal), this.price)
    if (inputCapacity.lt(neededCapacity.add(new Amount(MIN_SUDT_CAPACITY.toString())))) {
      orderOutput.capacity = inputCapacity
      orderOutput.setHexData(buildSellData(sudtSumAmount.toString(this.decimal), receive, this.price, this.decimal))
      outputs.push(orderOutput)
    } else {
      orderOutput.capacity = neededCapacity
      orderOutput.setHexData(buildSellData(this.totalPay.toString(this.decimal), receive, this.price, this.decimal))
      const changeOutput = new Cell(inputCapacity.sub(neededCapacity), this.inputLock, this.sudt.toTypeScript())
      const changeAmount = sudtSumAmount.sub(this.totalPay).toString(this.decimal)
      changeOutput.setHexData(buildChangeData(changeAmount, this.decimal))
      outputs = outputs.concat([orderOutput, changeOutput])
    }

    const tx = new Transaction(new RawTransaction(inputs, outputs), [Builder.WITNESS_ARGS.Secp256k1])

    tx.raw.cellDeps.push(SUDT_DEP)
    this.fee = Builder.calcFee(tx)

    const lastOutput = outputs[outputs.length - 1]
    if (lastOutput.capacity.gte(new Amount(MIN_SUDT_CAPACITY.toString()).add(this.fee))) {
      lastOutput.capacity = lastOutput.capacity.sub(this.fee)
      tx.raw.outputs.pop()
      tx.raw.outputs.push(lastOutput)
      return tx
    }

    return this.buildSellTx(this.fee)
  }

  async build(fee: Amount = Amount.ZERO): Promise<Transaction> {
    if (this.orderType === OrderType.Ask) {
      return this.buildSellTx()
    }

    const buyCellCapacity = this.totalPay.add(new Amount(ORDER_CELL_CAPACITY.toString()))

    const neededCapacity = buyCellCapacity.add(fee).add(new Amount(`${MAX_TRANSACTION_FEE}`))
    let inputCapacity = Amount.ZERO
    const inputs: Cell[] = []

    const orderOutput = new Cell(buyCellCapacity, this.orderLock, this.sudt.toTypeScript())
    const receive = calcBidReceive(this.pay.toString(), this.price, this.decimal)
    orderOutput.setHexData(buildBuyData(receive, this.price, this.decimal))
    // fill the inputs
    const cells = await this.collector.collect(this.address, { neededAmount: neededCapacity })
    cells.forEach(cell => {
      if (inputCapacity.lte(neededCapacity)) {
        inputs.push(cell)
        inputCapacity = inputCapacity.add(cell.capacity)
      }
    })

    const outputs = []
    if (inputCapacity.lt(neededCapacity)) {
      throw new LiveCellNotEnough()
    }

    if (inputCapacity.lt(neededCapacity.add(Builder.MIN_CHANGE))) {
      orderOutput.capacity = inputCapacity
      outputs.push(orderOutput)
    } else {
      outputs.push(orderOutput)
      outputs.push(new Cell(inputCapacity.sub(neededCapacity), this.inputLock))
    }

    const tx = new Transaction(new RawTransaction(inputs, outputs), [Builder.WITNESS_ARGS.Secp256k1])

    tx.raw.cellDeps.push(SUDT_DEP)

    this.fee = Builder.calcFee(tx)

    const lastOutput = outputs[outputs.length - 1]
    if (lastOutput.capacity.gte(Builder.MIN_CHANGE.add(this.fee))) {
      lastOutput.capacity = lastOutput.capacity.sub(this.fee)
      tx.raw.outputs.pop()
      tx.raw.outputs.push(lastOutput)
      return tx
    }

    return this.build(this.fee)
  }
}

export default PlaceOrderBuilder
