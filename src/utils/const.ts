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
