import ICON_BTC from '../assets/img/token/bitcoin.png'
import ICON_CKB from '../assets/img/token/ckb.svg'
import ICON_DAI from '../assets/img/token/dai.png'
import ICON_ETH from '../assets/img/token/eth.png'
import ICON_USDT from '../assets/img/token/usdt.png'

// eslint-disable-next-line
export enum BuiltinAssetType {
  CKB = 'CKB',
  USDT = 'USDT',
  ETH = 'ETH',
  DAI = 'DAI',
  BTC = 'BTC',
}

export function isBuiltinAssetType(type: string): type is BuiltinAssetType {
  return Object.values(BuiltinAssetType).includes(type as BuiltinAssetType)
}

type AssetURL = string

interface BuiltinAsset {
  type: BuiltinAssetType
  icon: AssetURL
}

function defAsset(name: BuiltinAssetType, icon: string): BuiltinAsset {
  return { type: name, icon }
}

type BuiltinAssetRecord = Record<BuiltinAssetType, BuiltinAsset>

export const BUILTIN_ASSETS: BuiltinAssetRecord = {
  CKB: defAsset(BuiltinAssetType.CKB, ICON_CKB),
  USDT: defAsset(BuiltinAssetType.USDT, ICON_USDT),
  ETH: defAsset(BuiltinAssetType.ETH, ICON_ETH),
  DAI: defAsset(BuiltinAssetType.DAI, ICON_DAI),
  BTC: defAsset(BuiltinAssetType.BTC, ICON_BTC),
}
