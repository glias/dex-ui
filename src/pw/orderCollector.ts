import { Collector, Amount, Cell, Script, OutPoint, AmountUnit, Address, CollectorOptions } from '@lay2/pw-core'
import { CKB_INDEXER_URL } from '../utils/const'

export default class OrderCollector extends Collector {
  getParams = (address: Address) => {
    return {
      id: 2,
      jsonrpc: '2.0',
      method: 'get_cells',
      params: [
        {
          script: address.toLockScript().serializeJson(),
          script_type: 'lock',
        },
        'asc',
        '0x2710',
      ],
    }
  }

  async getCells(address: Address) {
    const res = await fetch(CKB_INDEXER_URL, {
      method: 'POST',
      body: JSON.stringify(this.getParams(address)),
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors',
    })

    const json = await res.json()
    const rawCells = json.result.objects

    return rawCells.map((rawCell: any) => {
      return new Cell(
        new Amount(rawCell.output.capacity, AmountUnit.shannon),
        Script.fromRPC(rawCell.output.lock)!!,
        Script.fromRPC(rawCell.output.type),
        OutPoint.fromRPC(rawCell.out_point),
        rawCell.output_data,
      )
    })
  }

  async getBalance(address: Address) {
    const cells = await this.getCells(address)
    if (!cells.length) return Amount.ZERO
    return cells.map((c: any) => c.capacity).reduce((sum: Amount, cap: Amount) => sum.add(cap))
  }

  async collect(address: Address, _neededAmount: Amount, { withData }: CollectorOptions) {
    const cells = await this.getCells(address)

    if (withData) {
      return cells.filter((c: any) => !c.isEmpty() && !c.type)
    }

    return cells.filter((c: any) => c.isEmpty() && !c.type)
  }

  getSUDTBalance = (): Promise<Amount> => {
    return new Promise(() => {})
  }

  collectSUDT = (): Promise<Cell[]> => {
    return new Promise(() => {})
  }
}
