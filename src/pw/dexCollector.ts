import {
  Amount,
  Cell,
  Script,
  OutPoint,
  AmountUnit,
  Address,
  SUDT,
  SUDTCollector,
  // Collector,
  CollectorOptions,
} from '@lay2/pw-core'
import type { Cell as LumosCell } from '@ckb-lumos/base'
import { getCkbBalance, getCkbLiveCells, getSudtBalance, getSudtLiveCells } from '../APIs'
import { ORDER_BOOK_LOCK_SCRIPT } from '../constants'

export default class DEXCollector extends SUDTCollector {
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

  // eslint-disable-next-line no-useless-constructor
  public constructor() {
    super()
  }

  public getSUDTBalance = async (sudt: SUDT, address: Address) => {
    const lockScript = new Script(
      ORDER_BOOK_LOCK_SCRIPT.codeHash,
      address.toLockScript().toHash(),
      ORDER_BOOK_LOCK_SCRIPT.hashType,
    )
    const { free } = (await getSudtBalance(sudt.toTypeScript(), lockScript)).data
    return new Amount(free, sudt.info?.decimals ?? AmountUnit.shannon)
  }

  public collectSUDT = async (sudt: SUDT, address: Address, { neededAmount }: CollectorOptions) => {
    const { data: cells } = await getSudtLiveCells(
      sudt.toTypeScript(),
      address.toLockScript(),
      neededAmount!.toString(sudt.info?.decimals ?? AmountUnit.shannon),
    )

    return cells.map(DEXCollector.fromLumosCell)
  }

  public getBalance = async (address: Address): Promise<Amount> => {
    const { free } = (await getCkbBalance(address.toLockScript())).data
    return new Amount(free, AmountUnit.shannon)
  }

  public collect = async (address: Address, { neededAmount }: CollectorOptions): Promise<Cell[]> => {
    const { data: cells } = await getCkbLiveCells(address.toLockScript(), neededAmount!.toString(AmountUnit.shannon))
    return cells.map(DEXCollector.fromLumosCell)
  }
}
