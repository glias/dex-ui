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

export const TraceTableList = ['All', 'Pedding', 'Opening', 'Complete', 'Claimed', 'Aborted']

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
  '0xb28fd2b266d3bb6ace9b1d49231e0eb5c23e2097ce0791bf86b227bb7aa3a1c0',
  '0xb74a976e3ceab91f27690b27473731d7ccdff45302bb082394a03cb97641edaa',
  HashType.type,
)

export const SUDT_DEP = new CellDep(
  DepType.code,
  new OutPoint('0xe12877ebd2c3c364dc46c5c992bcfaf4fee33fa13eebdf82c591fc9825aab769', '0x0'),
)

export const ORDER_BOOK_LOOK_SCRIPT = new Script(
  '0x5f2b49c5b75f834bf4ff3bc1bc486cc904bf67f4138778276092855c4b93b734',
  '0xb74a976e3ceab91f27690b27473731d7ccdff45302bb082394a03cb97641edaa',
  HashType.type,
)

export const ORDER_BOOK_LOOK_DEP = new CellDep(
  DepType.code,
  new OutPoint('0xe12877ebd2c3c364dc46c5c992bcfaf4fee33fa13eebdf82c591fc9825aab769', '0x0'),
)

export const CKB_NODE_URL = 'http://47.111.84.118:8000'
export const CKB_INDEXER_URL = 'http://47.111.84.118:8000/indexer'
