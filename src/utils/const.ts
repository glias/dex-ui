import BigNumber from 'bignumber.js'
import { CellDep, DepType, HashType, OutPoint, Script } from '@lay2/pw-core'
import metaMask from '../assets/img/wallet/metamask.png'
import dai from '../assets/img/token/dai.png'
import eth from '../assets/img/token/eth.png'
import usdt from '../assets/img/token/usdt.png'
import bitcoin from '../assets/img/token/bitcoin.png'
import ckb from '../assets/img/token/ckb.png'

export const HeaderNavgationLists = [
  {
    name: 'Trade',
    path: '/trade',
  },
  {
    name: 'Pool',
    path: '/pool',
  },
  {
    name: 'Match',
    path: '/match',
  },
]

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

export const TraceTableList = ['all', 'pedding', 'opening', 'complete', 'claimed', 'aborted']

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
  '0xc5e5dcf215925f7ef4dfaf5f4b4f105bc321c02776d6e7d52a1db3fcd9d011a4',
  '0x6fe3733cd9df22d05b8a70f7b505d0fb67fb58fb88693217135ff5079713e902',
  HashType.type,
)

export const SUDT_DEP = new CellDep(
  DepType.code,
  new OutPoint('0xe12877ebd2c3c364dc46c5c992bcfaf4fee33fa13eebdf82c591fc9825aab769', '0x0'),
)

export const ORDER_BOOK_LOCK_SCRIPT = new Script(
  '0x9c833b9ebd4259ca044d2c47c5e51b7fc25380b07291e54b248d3808f08ed7fd',
  '0xb74a976e3ceab91f27690b27473731d7ccdff45302bb082394a03cb97641edaa',
  HashType.type,
)

export const ORDER_BOOK_LOCK_DEP = new CellDep(
  DepType.code,
  new OutPoint('0xcdfd397823f6a130294c72fbe397c469d459b83db401296c291db7b170b15839', '0x0'),
)

export const CKB_NODE_URL = 'https://aggron.ckb.dev'
export const CKB_INDEXER_URL = 'https://prototype.ckbapp.dev/testnet/indexer'

export const COMMISSION_FEE = 0.003
export const PRICE_DECIMAL = new BigNumber(10).pow(new BigNumber(10))
export const SUDT_DECIMAL = new BigNumber(10).pow(new BigNumber(8))
export const CKB_DECIMAL = new BigNumber(10).pow(new BigNumber(8))

//  @TODO: comments
export const ORDER_CELL_CAPACITY = 179

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

export const EXPLORER_URL = 'https://explorer.nervos.org/aggron/'
