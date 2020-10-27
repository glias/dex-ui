import { Collector, Amount, Cell, Script, OutPoint, AmountUnit, Address, SUDT } from '@lay2/pw-core'
import { getAmountFromCellData } from '../utils/buffer'
import getLiveCells from '../APIs'

export default class SUDTCollector extends Collector {
  getSUDTCells = async (sudt: SUDT, address: Address) => {
    const { codeHash: typeCodeHash, args: typeArgs } = sudt.toTypeScript()
    const { codeHash: lockCodeHash, args: lockArgs } = address.toLockScript()
    const liveCells = (await getLiveCells(typeCodeHash, typeArgs, lockCodeHash, lockArgs)).data
    return liveCells.map(
      (rawCell: any) =>
        new Cell(
          new Amount(rawCell.output.capacity, AmountUnit.shannon),
          Script.fromRPC(rawCell.output.lock)!!,
          Script.fromRPC(rawCell.output.type),
          OutPoint.fromRPC(rawCell.out_point),
          rawCell.output_data,
        ),
    )
  }

  getSUDTBalance = async (sudt: SUDT, address: Address) => {
    const cells = await this.getSUDTCells(sudt, address)
    if (!cells.length) return Amount.ZERO
    return cells.map((c: any) => getAmountFromCellData(c.data)).reduce((sum: Amount, cap: Amount) => sum.add(cap))
  }

  collectSUDT = async (sudt: SUDT, address: Address, neededAmount?: Amount) => {
    const cells = await this.getSUDTCells(sudt, address)
    const needAmount = neededAmount ? BigInt(neededAmount.toHexString()) : BigInt(0)
    const sumAmount = BigInt(0)
    const resultCells = [] as Cell[]
    cells.forEach((cell: any) => {
      if (sumAmount < needAmount) {
        // sumAmount += BigInt(getAmountFromCellData(cell.data))
        resultCells.push(
          new Cell(
            new Amount(cell.output.capacity, AmountUnit.shannon),
            Script.fromRPC(cell.output.lock)!!,
            Script.fromRPC(cell.output.type),
            OutPoint.fromRPC(cell.out_point),
            cell.output_data,
          ),
        )
      }
    })
    return resultCells
  }

  getBalance = (): Promise<Amount> => {
    return new Promise(() => {})
  }

  collect = (): Promise<Cell[]> => {
    return new Promise(() => {})
  }
}
