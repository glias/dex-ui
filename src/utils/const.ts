import BigNumber from 'bignumber.js'
import { CellDep, DepType, HashType, OutPoint, Script } from '@lay2/pw-core'
import metaMask from '../assets/img/wallet/metamask.png'
import dai from '../assets/img/token/dai.png'
import eth from '../assets/img/token/eth.png'
import usdt from '../assets/img/token/usdt.png'
import bitcoin from '../assets/img/token/bitcoin.png'
import ckb from '../assets/img/token/ckb.png'

export const thirdPartyLinks = [
  {
    name: 'FAQ',
    link: 'https://bihu.com/',
  },
  {
    name: 'Github',
    link: 'https://github.com/',
  },
]

export const TraceTableList = ['all', 'pending', 'opening', 'complete', 'claimed', 'aborted']

export const ConnectLists = [
  {
    name: 'MetaMask',
    logo: metaMask,
  },
]
export const PairList = [
  {
    name: 'CKB',
    logo: ckb,
  },
  {
    name: 'DAI',
    logo: dai,
  },
  {
    name: 'USDT',
    logo: usdt,
  },
  {
    name: 'ETH',
    logo: eth,
  },
  {
    name: 'USDT(REC20)',
    logo: bitcoin,
  },
]

export const SUDT_TYPE_SCRIPT = new Script(
  process.env.REACT_APP_SUDT_TYPE_HASH || '0xc5e5dcf215925f7ef4dfaf5f4b4f105bc321c02776d6e7d52a1db3fcd9d011a4',
  process.env.REACT_APP_SUDT_TYPE_ARGS || '0x6fe3733cd9df22d05b8a70f7b505d0fb67fb58fb88693217135ff5079713e902',
  (process.env.REACT_APP_SUDT_TYPE_HASH_TYPE as HashType) || HashType.type,
)

export const SUDT_DEP = new CellDep(
  DepType.code,
  new OutPoint(
    process.env.REACT_APP_SUDT_DEP_OUT_POINT || '0xe12877ebd2c3c364dc46c5c992bcfaf4fee33fa13eebdf82c591fc9825aab769',
    '0x0',
  ),
)

export const ORDER_BOOK_LOCK_SCRIPT = new Script(
  process.env.REACT_APP_ORDER_BOOK_LOCK_HASH || '0x9c833b9ebd4259ca044d2c47c5e51b7fc25380b07291e54b248d3808f08ed7fd',
  '0x0000000000000000000000000000000000000000000000000000000000000000',
  HashType.type,
)

export const ORDER_BOOK_LOCK_DEP = new CellDep(
  DepType.code,
  new OutPoint(
    process.env.REACT_APP_ORDER_BOOK_LOCK_DEP_OUT_POINT ||
      '0xcdfd397823f6a130294c72fbe397c469d459b83db401296c291db7b170b15839',
    '0x0',
  ),
)

export const CKB_NODE_URL = process.env.REACT_APP_CKB_NODE_URL || 'https://aggron.ckb.dev'
export const CKB_INDEXER_URL = process.env.REACT_APP_CKB_INDEXER_URL || 'https://prototype.ckbapp.dev/testnet/indexer'

export const COMMISSION_FEE = 0.003
export const PRICE_DECIMAL = new BigNumber(10).pow(new BigNumber(10))
export const SUDT_DECIMAL = new BigNumber(10).pow(new BigNumber(8))
export const CKB_DECIMAL = new BigNumber(10).pow(new BigNumber(8))

//  @TODO: comments
export const ORDER_CELL_CAPACITY = 179
export const MIN_SUDT_CAPACITY = 142

export const MIN_ORDER_DAI = 147
export const MIN_ORDER_CKB = 289
export const MAX_TRANSACTION_FEE = 0.1

export const HISTORY_PARAMS = {
  typeCodeHash: '0xc5e5dcf215925f7ef4dfaf5f4b4f105bc321c02776d6e7d52a1db3fcd9d011a4',
  typeHashType: 'type',
  typeArgs: '0x6fe3733cd9df22d05b8a70f7b505d0fb67fb58fb88693217135ff5079713e902',
}

export const HISTORY_QUERY_KEY = {
  type: 'history-type',
}

// TODO: use enum
export const REJECT_ERROR_CODE = 4001

export const EXPLORER_URL = process.env.REACT_APP_EXPLORER_URL || 'https://explorer.nervos.org/aggron/'

export const INFURA_ID = process.env.REACT_APP_INFURA_ID || '89a648e271d54224ba4827d348cbaa54'

export const IS_DEVNET = !!process.env.REACT_APP_IS_DEVNET

export const PW_DEV_CHAIN_CONFIG = {
  daoType: {
    cellDep: new CellDep(
      DepType.code,
      new OutPoint('0xa563884b3686078ec7e7677a5f86449b15cf2693f3c1241766c6996f206cc541', '0x2'),
    ),
    script: new Script('0x82d76d1b75fe2fd9a27dfbaa65a039221a380d76c926f378d3f81cf3e7e13f2e', '0x', HashType.type),
  },
  sudtType: {
    cellDep: new CellDep(
      DepType.code,
      new OutPoint('0xbf8264248a7c15820f343a356bb1d01379d42e1eb0305ab5b07ef14b566de41f', '0x0'),
    ),
    script: new Script('0xe1e354d6d643ad42724d40967e334984534e0367405c5ae42a9d7d63d77df419', '0x', HashType.data),
  },
  defaultLock: {
    cellDep: new CellDep(
      DepType.depGroup,
      new OutPoint('0xace5ea83c478bb866edf122ff862085789158f5cbff155b7bb5f13058555b708', '0x0'),
    ),
    script: new Script('0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8', '0x', HashType.type),
  },
  multiSigLock: {
    cellDep: new CellDep(
      DepType.depGroup,
      new OutPoint('0xace5ea83c478bb866edf122ff862085789158f5cbff155b7bb5f13058555b708', '0x1'),
    ),
    script: new Script('0x5c5069eb0857efc65e1bca0c07df34c31663b3622fd3876c876320fc9634e2a8', '0x', HashType.type),
  },
  pwLock: {
    cellDep: new CellDep(
      DepType.code,
      new OutPoint('0xe4ddfd424edc84211b35cca756ecf1f9708291cf15ae965e38afc45451c7aee1', '0x0'),
    ),
    script: new Script('0xe6acf70d7e336db0368c920a833d9d9f9ca8c3c8aba39f24741c45db435c3e18', '0x', HashType.type),
  },
  acpLockList: [
    new Script('0xe6acf70d7e336db0368c920a833d9d9f9ca8c3c8aba39f24741c45db435c3e18', '0x', HashType.type),
    new Script('0x0fb343953ee78c9986b091defb6252154e0bb51044fd2879fde5b27314506111', '0x', HashType.data),
  ],
}
