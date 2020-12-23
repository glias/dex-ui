import PWCore, {
  Address,
  Amount,
  AmountUnit,
  SimpleSUDTACPBuilder,
  SimpleSUDTBuilder,
  SUDT,
  SUDTCollector,
} from '@lay2/pw-core'
import { asserts } from '.'
import { TransactionDetailModel } from '../../../../APIs'
import { TransactionDirection, TransactionStatus } from '../api'
import { ForceSimpleBuilder } from '../builders/SimpleBuilder'
import { addPendingTransactions } from '../pendingTxs'
import { markTransactionInputCellsAsPending } from './pending-cells'
import { wrapAddress, wrapAmount } from './wrap'

type InputAddress = string | Address

interface BuildSudtTransactionOptions {
  to: InputAddress
  /**
   * send the sudt anyway, although this operation costs an additional 142 ckb
   */
  force?: boolean

  sudt: SUDT

  amount: string | Amount
}

export class SendHelper {
  private readonly pw: PWCore

  private readonly collector: SUDTCollector

  constructor(pw: PWCore, collector: SUDTCollector) {
    this.pw = pw
    this.collector = collector
  }

  async searchOrCheckIsAcpAddress(sudt: SUDT, address: InputAddress): Promise<null | Address> {
    const { collector } = this
    const wrapped = wrapAddress(address)
    if (wrapped.isAcp()) {
      const cells = await collector.collectSUDT(sudt, wrapped, { neededAmount: wrapAmount('1') })
      if (cells && cells.length > 0) return wrapped
    }

    // TODO search the AcpAddress
    return null
  }

  async buildSudtTransaction(options: BuildSudtTransactionOptions): Promise<SimpleSUDTACPBuilder | SimpleSUDTBuilder> {
    const { to, force, sudt, amount } = options

    const toAddress = wrapAddress(to)
    const acpAddress = await this.searchOrCheckIsAcpAddress(sudt, toAddress)
    const isAcp = acpAddress && acpAddress.isAcp()

    asserts(isAcp || force, 'This is not an ACP address and therefore cannot send')

    const toAmount = wrapAmount(amount)

    if (isAcp) return new SimpleSUDTACPBuilder(sudt, acpAddress!, toAmount)

    return new SimpleSUDTBuilder(sudt, toAddress, toAmount)
  }

  async sendSudt(address: string, amount: string, sudt: SUDT, force?: boolean): Promise<string> {
    const { pw } = this

    const sudtBuilder = await this.buildSudtTransaction({ amount, sudt, to: address, force })
    const built = await sudtBuilder.build()
    const txHash = await pw.sendTransaction(built)

    markTransactionInputCellsAsPending(built.raw)

    const fee = sudtBuilder.getFee()
    const tx: TransactionDetailModel = {
      amount,
      blockNumber: 0,
      direction: TransactionDirection.Out,
      fee: fee.toString(AmountUnit.shannon),
      from: PWCore.provider.address.toCKBAddress(),
      status: TransactionStatus.Pending,
      to: address,
      txHash,
    }
    addPendingTransactions({ ...tx, timestamp: Date.now(), tokenName: sudt.info?.name! })
    return txHash
  }

  async sendCkb(address: string, shannonCkb: string): Promise<string> {
    const { pw } = this
    const builder = new ForceSimpleBuilder(wrapAddress(address), new Amount(shannonCkb, AmountUnit.shannon))
    const txHash = await pw.sendTransaction(builder)
    const built = await builder.build()

    markTransactionInputCellsAsPending(built.raw)

    const fee = builder.getFee()

    const tx: TransactionDetailModel = {
      amount: shannonCkb,
      blockNumber: 0,
      direction: TransactionDirection.Out,
      fee: fee.toString(AmountUnit.shannon),
      from: PWCore.provider.address.toCKBAddress(),
      status: TransactionStatus.Pending,
      to: address,
      txHash,
    }

    addPendingTransactions({ ...tx, timestamp: Date.now(), tokenName: 'CKB' })

    return txHash
  }
}
