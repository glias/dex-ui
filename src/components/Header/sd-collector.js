/* eslint-disable */
import { Collector, Amount, Cell, Script, OutPoint, AmountUnit } from '@lay2/pw-core'
import { CKB_INDEXER_URL } from '../../utils/const'

export class SDCollector extends Collector {
  indexerUrl = CKB_INDEXER_URL

  getParams(address) {
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

  constructor() {
    super()
  }

  async getCells(address) {
    this.cells = []

    const res = await (
      await fetch(this.indexerUrl, {
        method: 'POST',
        body: JSON.stringify(this.getParams(address)),
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      })
    ).json()

    const rawCells = res.result.objects

    for (const rawCell of rawCells) {
      const cell = new Cell(
        new Amount(rawCell.output.capacity, AmountUnit.shannon),
        Script.fromRPC(rawCell.output.lock),
        Script.fromRPC(rawCell.output.type),
        OutPoint.fromRPC(rawCell.out_point),
        rawCell.output_data,
      )

      this.cells.push(cell)
    }
    return this.cells
  }

  async getBalance(address) {
    const cells = await this.getCells(address)
    if (!cells.length) return Amount.ZERO
    return cells
      .map(c => c.capacity)
      .reduce((sum, cap) => {
        sum = sum.add(cap)
        return sum
      })
  }

  async collect(address, { withData }) {
    const cells = await this.getCells(address)

    if (withData) {
      return cells.filter(c => !c.isEmpty() && !c.type)
    }

    return cells.filter(c => c.isEmpty() && !c.type)
  }
}
