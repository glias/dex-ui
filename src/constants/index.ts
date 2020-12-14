import metaMask from '../assets/img/wallet/metamask.png'

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
export * from './erc20'
