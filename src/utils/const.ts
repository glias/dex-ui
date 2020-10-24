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
  '0xc5e5dcf215925f7ef4dfaf5f4b4f105bc321c02776d6e7d52a1db3fcd9d011a4',
  '0x6fe3733cd9df22d05b8a70f7b505d0fb67fb58fb88693217135ff5079713e902',
  HashType.type,
)

export const SUDT_DEP = new CellDep(
  DepType.code,
  new OutPoint('0xe12877ebd2c3c364dc46c5c992bcfaf4fee33fa13eebdf82c591fc9825aab769', '0x0'),
)

export const ORDER_BOOK_LOOK_SCRIPT = new Script(
  '0x6982301f72a13f64ed63cbb8985ca22f8f38f90405f86bf6b661f69a01a1dedf',
  '0xb74a976e3ceab91f27690b27473731d7ccdff45302bb082394a03cb97641edaa',
  HashType.type,
)

export const ORDER_BOOK_LOOK_DEP = new CellDep(
  DepType.code,
  new OutPoint('0x32f425601393d0162ac7f30f9c637f33ce3a64599d18108f65f98c27659d7be9', '0x0'),
)

export const CKB_NODE_URL = 'http://47.111.84.118:8000'
export const CKB_INDEXER_URL = 'http://47.111.84.118:8000/indexer'
