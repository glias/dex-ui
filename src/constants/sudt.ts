import { CellDep, DepType, OutPoint, Script, HashType, SUDT } from '@lay2/pw-core'

export const SUDT_DEP = new CellDep(DepType.code, new OutPoint(process.env.REACT_APP_SUDT_DEP_OUT_POINT!, '0x0'))

export const SUDT_TYPE_SCRIPT = new Script(
  process.env.REACT_APP_SUDT_TYPE_HASH!,
  process.env.REACT_APP_SUDT_TYPE_ARGS!,
  (process.env.REACT_APP_SUDT_TYPE_HASH_TYPE as HashType) || HashType.type,
)

export const SUDT_DAI = new SUDT(process.env.REACT_APP_SUDT_TYPE_ARGS!, {
  symbol: 'DAI',
  name: 'DAI',
  decimals: 8,
})
