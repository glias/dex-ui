import dai from '../assets/img/token/dai.png'
import eth from '../assets/img/token/eth.png'
import usdt from '../assets/img/token/usdt.png'
import bitcoin from '../assets/img/token/bitcoin.png'
import ckb from '../assets/img/token/ckb.png'
import usdc from '../assets/img/token/usdc.png'

export const TOKEN_LOGOS = new Map<string, string>()
TOKEN_LOGOS.set('GLIA', bitcoin)
TOKEN_LOGOS.set('CKB', ckb)
TOKEN_LOGOS.set('USDT', usdt)
TOKEN_LOGOS.set('USDC', usdc)
TOKEN_LOGOS.set('DAI', dai)
TOKEN_LOGOS.set('ETH', eth)
TOKEN_LOGOS.set('ckETH', eth)
TOKEN_LOGOS.set('ckDAI', dai)
TOKEN_LOGOS.set('ckUSDT', usdt)
TOKEN_LOGOS.set('ckUSDC', usdc)
