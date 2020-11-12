import {
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
import type { Cell as LumosCell } from '@ckb-lumos/base'
import { getCkbLiveCells, getSudtLiveCells } from '../APIs'
import { OrderType } from '../containers/order'
import { buildSellData, getAmountFromCellData, buildChangeData, buildBuyData } from '../utils/buffer'
import {
  ORDER_BOOK_LOCK_SCRIPT,
  ORDER_CELL_CAPACITY,
  SUDT_DEP,
  SUDT_TYPE_SCRIPT,
  MIN_SUDT_CAPACITY,
  MAX_TRANSACTION_FEE,
} from '../utils/const'
import { calcBuyReceive, calcBuyAmount, calcSellReceive } from '../utils/fee'

export class PlaceOrderBuilder extends Builder {
  address: Address

  orderType: OrderType

  price: string

  pay: Amount

  orderLock: Script

  inputLock: Script

  constructor(address: Address, pay: Amount, orderType: OrderType, price: string, feeRate?: number) {
    super(feeRate)
    this.address = address
    this.orderType = orderType
    this.price = price
    this.pay = pay
    this.orderLock = new Script(
      ORDER_BOOK_LOCK_SCRIPT.codeHash,
      this.address.toLockScript().toHash(),
      ORDER_BOOK_LOCK_SCRIPT.hashType,
    )
    this.inputLock = this.address.toLockScript()
  }

  public static fromLumosCell(cell: LumosCell) {
    const {
      cell_output: { lock, type, capacity },
      data,
      out_point,
    } = cell
    const { tx_hash, index } = out_point!

    return new Cell(
      new Amount(capacity, AmountUnit.shannon),
      Script.fromRPC(lock)!,
      Script.fromRPC(type),
      new OutPoint(tx_hash, index),
      data,
    )
  }

  async buildSellTx(fee: Amount = Amount.ZERO): Promise<Transaction> {
    let sudtSumAmount = Amount.ZERO
    let inputCapacity = Amount.ZERO
    const neededCapacity = new Amount(ORDER_CELL_CAPACITY.toString()).add(fee).add(new Amount(`${MAX_TRANSACTION_FEE}`))

    const inputs: Cell[] = []
    let outputs: Cell[] = []

    const orderOutput = new Cell(neededCapacity, this.orderLock, SUDT_TYPE_SCRIPT)

    const { data: cells } = await getSudtLiveCells(
      SUDT_TYPE_SCRIPT,
      this.inputLock,
      this.pay.toString(AmountUnit.shannon),
    )

    cells.forEach(cell => {
      const input = PlaceOrderBuilder.fromLumosCell(cell)
      sudtSumAmount = sudtSumAmount.add(new Amount(getAmountFromCellData(cell.data)))
      inputs.push(input)
      inputCapacity = inputCapacity.add(input.capacity)
    })

    if (sudtSumAmount.lt(this.pay)) {
      throw new Error(`Input SUDT amount not enough, need ${this.pay.toString()}, got ${sudtSumAmount.toString()}`)
    }

    if (inputCapacity.lt(neededCapacity)) {
      const { data: extraCells } = await getCkbLiveCells(
        this.inputLock,
        neededCapacity.sub(inputCapacity).add(new Amount(MIN_SUDT_CAPACITY.toString())).toString(AmountUnit.shannon),
      )

      extraCells.forEach(cell => {
        if (inputCapacity.lte(neededCapacity)) {
          const input = PlaceOrderBuilder.fromLumosCell(cell)
          inputs.push(input)
          inputCapacity = inputCapacity.add(input.capacity)
        }
      })
    }

    if (inputCapacity.lt(neededCapacity)) {
      throw new Error(
        `Input capacity not enough, need ${neededCapacity.toString(AmountUnit.ckb)}, got ${inputCapacity.toString(
          AmountUnit.ckb,
        )}`,
      )
    }

    const receive = calcSellReceive(`${this.pay}`, this.price)
    if (inputCapacity.lt(neededCapacity.add(new Amount(MIN_SUDT_CAPACITY.toString())))) {
      orderOutput.capacity = inputCapacity
      orderOutput.setHexData(buildSellData(`${sudtSumAmount}`, receive, this.price))
      outputs.push(orderOutput)
    } else {
      orderOutput.capacity = neededCapacity
      orderOutput.setHexData(buildSellData(`${this.pay}`, receive, this.price))
      const changeOutput = new Cell(inputCapacity.sub(neededCapacity), this.inputLock, SUDT_TYPE_SCRIPT)
      const changeAmount = sudtSumAmount.sub(this.pay).toString()
      changeOutput.setHexData(buildChangeData(changeAmount))
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
    if (this.orderType === OrderType.Sell) {
      return this.buildSellTx()
    }

    const buyCellCapacity = new Amount(calcBuyAmount(this.pay.toString()))

    const neededCapacity = buyCellCapacity.add(fee).add(new Amount(`${MAX_TRANSACTION_FEE}`))
    let inputCapacity = Amount.ZERO
    const inputs: Cell[] = []

    const orderOutput = new Cell(buyCellCapacity, this.orderLock, SUDT_TYPE_SCRIPT)
    const receive = calcBuyReceive(this.pay.toString(), this.price).toString()
    orderOutput.setHexData(buildBuyData(receive, this.price))
    // fill the inputs
    const { data: cells } = await getCkbLiveCells(this.inputLock, neededCapacity.toString(AmountUnit.shannon))
    cells.forEach(cell => {
      if (inputCapacity.lte(neededCapacity)) {
        const input = PlaceOrderBuilder.fromLumosCell(cell)
        inputs.push(input)
        inputCapacity = inputCapacity.add(input.capacity)
      }
    })

    const outputs = []
    if (inputCapacity.lt(neededCapacity)) {
      throw new Error(
        `Input capacity not enough, need ${neededCapacity.toString(AmountUnit.ckb)}, got ${inputCapacity.toString(
          AmountUnit.ckb,
        )}`,
      )
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
