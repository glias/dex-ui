import { CellDep, DepType, OutPoint, Script, HashType, SUDT } from '@lay2/pw-core'
import { buildShadowAssetSUDT, ERC20_LIST } from './erc20'

export const SUDT_DEP = new CellDep(DepType.code, new OutPoint(process.env.REACT_APP_SUDT_DEP_OUT_POINT!, '0x0'))

export const SUDT_TYPE_SCRIPT = new Script(
  process.env.REACT_APP_SUDT_TYPE_HASH!,
  process.env.REACT_APP_SUDT_TYPE_ARGS!,
  (process.env.REACT_APP_SUDT_TYPE_HASH_TYPE as HashType) || HashType.type,
)

export const SUDT_GLIA = new SUDT(process.env.REACT_APP_SUDT_TYPE_ARGS!, {
  symbol: 'GLIA',
  name: 'GLIA',
  decimals: 8,
})

export const SUDT_CK_ETH = buildShadowAssetSUDT({
  symbol: 'ckETH',
  name: 'ckETH',
  decimals: 18,
})

export type IssuerLockHash = string

export const SHADOW_ASSETS = ERC20_LIST.map(erc20 => {
  const { tokenName, decimals, address } = erc20
  const symbol = `ck${tokenName}`
  return buildShadowAssetSUDT(
    {
      symbol,
      name: symbol,
      decimals,
    },
    address,
  )
})

export const SUDT_LIST = [SUDT_GLIA, SUDT_CK_ETH].concat(SHADOW_ASSETS)

export const SUDT_MAP = new Map<IssuerLockHash, SUDT>()
SUDT_LIST.forEach(sudt => {
  SUDT_MAP.set(sudt.issuerLockHash, sudt)
})

// SUDT class that does not require PW initialization
export class SUDTWithoutPw extends SUDT {
  toTypeScript() {
    return new Script(SUDT_TYPE_SCRIPT.codeHash, this.issuerLockHash, SUDT_TYPE_SCRIPT.hashType)
  }
}
