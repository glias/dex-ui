import { CellDep, DepType, HashType, OutPoint, Script } from '@lay2/pw-core'

export const ORDER_BOOK_LOCK_SCRIPT = new Script(
  process.env.REACT_APP_ORDER_BOOK_LOCK_HASH!,
  '0x0000000000000000000000000000000000000000000000000000000000000000',
  HashType.type,
)

export const ORDER_BOOK_LOCK_DEP = new CellDep(
  DepType.code,
  new OutPoint(process.env.REACT_APP_ORDER_BOOK_LOCK_DEP_OUT_POINT!, '0x0'),
)
