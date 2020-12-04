import CKB from '@nervosnetwork/ckb-sdk-core'
import { EventEmitter } from 'eventemitter3'

// type TransactionHash = string

interface TransactionEvents {
  // pending: [TransactionHash]
  fetched: [CKBComponents.TransactionWithStatus[]]
  committed: [CKBComponents.Transaction[]]
}

interface Options {
  rpc: CKB['rpc']
  pollingMilliseconds?: number
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type Fn = (...args: any[]) => any
type UnwrapPromise<T> = T extends Promise<infer X> ? X : T

export function asyncPatch<T, K extends keyof T>(
  obj: T,
  methodName: K,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  patch: { after?: T[K] extends Fn ? (arg: UnwrapPromise<ReturnType<T[K]>>) => void : unknown },
): void {
  if (typeof obj[methodName] !== 'function') return
  const originMethod = ((obj[methodName] as unknown) as Fn).bind(obj)

  // @ts-ignore
  // eslint-disable-next-line no-param-reassign
  obj[methodName] = async function patched(...args: any[]) {
    const originResult = await originMethod(...args)
    if (typeof patch.after === 'function') patch.after(originResult)
    return originResult
  }
}

function checkIfIsCommittedTransaction(
  x: undefined | CKBComponents.TransactionWithStatus,
): x is CKBComponents.TransactionWithStatus {
  if (!x) return false
  return x.txStatus.status === 'committed'
}

export class CkbTransactionListener extends EventEmitter<TransactionEvents> {
  #tasks = new Set<string>()

  #fetchingTasks = new Set<string>()

  #pollingIntervalTask: number | undefined

  private options: Options

  constructor(options?: Options) {
    super()

    this.options = {
      rpc: options?.rpc || new CKB().rpc,
      pollingMilliseconds: options?.pollingMilliseconds || 3000,
    }
  }

  registerTransactions(...txHashes: string[]) {
    txHashes
      .filter(hash => !this.#tasks.has(hash) && !this.#fetchingTasks.has(hash))
      .forEach(hash => this.#tasks.add(hash))
  }

  private async execTasks() {
    if (this.#tasks.size === 0) return
    const requests: Array<['getTransaction', string]> = Array.from(this.#tasks).map(hash => ['getTransaction', hash])
    this.#tasks.forEach(txHash => this.#fetchingTasks.add(txHash))
    this.#tasks.clear()
    const res = await this.options.rpc
      .createBatchRequest<'getTransaction', string[], (CKBComponents.TransactionWithStatus | undefined)[]>(requests)
      .exec()

    const committed: CKBComponents.Transaction[] = []
    requests.forEach(([, hash], i) => {
      const tx = res[i]
      if (checkIfIsCommittedTransaction(tx)) {
        committed.push(tx.transaction)
        this.#fetchingTasks.delete(hash)
        return
      }
      this.#tasks.add(hash)
    })
    this.emit(
      'fetched',
      // @ts-ignore
      res.filter<CKBComponents.TransactionWithStatus>(x => x != null),
    )
    this.emit('committed', committed)
  }

  getPendingHashes(): string[] {
    return Array.from(this.#tasks).concat(Array.from(this.#fetchingTasks))
  }

  start() {
    this.#pollingIntervalTask = setInterval(() => this.execTasks(), this.options.pollingMilliseconds)
  }

  pause() {
    clearInterval(this.#pollingIntervalTask)
  }

  stop() {
    clearInterval(this.#pollingIntervalTask)
    this.#tasks.clear()
    this.#fetchingTasks.clear()
  }
}
