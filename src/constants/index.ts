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

// TODO: use enum
export const REJECT_ERROR_CODE = 4001

export const HISTORY_QUERY_KEY = {
  type: 'history-type',
}

export * from './sudt'
export * from './orderBook'
export * from './number'
export * from './url'
export * from './config'
export * from './tokens'
