import { ckb, ForceBridgeItem, getForceBridgeHistory, relayEthToCKB } from 'APIs'
import BigNumber from 'bignumber.js'
import { ERC20, ERC20_ETH, ERC20_LIST, FORCE_BRIDGE_SETTINGS } from 'constants/erc20'
import { relayEthTxHash } from 'utils'
import Web3 from 'web3'
import { APPROVE_ABI } from './ABI'

const uint256Max = `0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff`

export async function getAllowanceForTarget(
  ethAddress: string,
  erc20Address: string,
  web3: Web3,
  targetAddress = FORCE_BRIDGE_SETTINGS.eth_token_locker_addr,
) {
  const contract = new web3.eth.Contract(APPROVE_ABI, erc20Address)
  return contract.methods.allowance(ethAddress, targetAddress).call()
}

export async function approveERC20ToBridge(
  ethAddress: string,
  erc20Address: string,
  web3: Web3,
  confirmCallback: () => void,
  targetAddress = FORCE_BRIDGE_SETTINGS.eth_token_locker_addr,
) {
  const contract = new web3.eth.Contract(APPROVE_ABI, erc20Address)
  return new Promise((resolve, reject) => {
    contract.methods
      .approve(targetAddress, uint256Max)
      .send({ from: ethAddress })
      .once('transactionHash', (t: any) => {
        confirmCallback()
        setTimeout(() => {
          resolve(t)
        }, 1.5 * 60 * 1000)
      })
      .once('receipt', (r: any) => {
        resolve(r)
      })
      .on('error', (err: any) => {
        reject(err)
      })
  })
}

export enum CrossChainOrderStatus {
  Completed = 'Completed',
  ConfirmInETH = 'ConfirmInETH',
  ConfirmInCKB = 'ConfirmInCKB',
}

export interface CrossChainOrder {
  tokenName: string
  amount: string
  timestamp: string
  ckbTxHash: string
  ethTxHash: string
  status: CrossChainOrderStatus
  isLock: boolean
}

export function normalizeTxHash(txhash?: string) {
  if (!txhash) {
    return ''
  }
  if (txhash.startsWith('0x')) {
    return txhash
  }

  return `0x${txhash}`
}

export function isSameTxHash(hash1?: string, hash2?: string) {
  if (!hash1 || !hash2) {
    return false
  }

  return normalizeTxHash(hash1) === normalizeTxHash(hash2)
}

export function normalizeBridgeOrders<T extends ForceBridgeItem>(orders: T[]): T[] {
  return orders.map(order => {
    return {
      ...order,
      eth_tx_hash: normalizeTxHash(order.eth_tx_hash),
      ckb_tx_hash: normalizeTxHash(order.ckb_tx_hash),
      token_addr: normalizeTxHash(order.token_addr),
    }
  })
}

export async function getPureCrossChainHistory(ckbAddress: string, ethAddress: string) {
  const { ckb_to_eth, eth_to_ckb } = (await getForceBridgeHistory(ckbAddress, ethAddress, true)).data
  const orders = normalizeBridgeOrders(
    ckb_to_eth
      .map(o => ({ ...o, isLock: false }))
      .concat(eth_to_ckb.map(o => ({ ...o, isLock: true })))
      .map(o => {
        const erc20 = [ERC20_ETH, ...ERC20_LIST].find(e => e.address.toLowerCase() === o.token_addr.toLowerCase())
        return {
          ...o,
          erc20,
        }
      })
      .filter(e => e.status !== 'error' && e.erc20),
  )

  return Promise.all(
    orders.map(order => {
      return getCKBCrossChainInfo(order, order.isLock)
    }),
  )
}

export async function getCKBCrossChainInfo(
  order: ForceBridgeItem & { erc20?: ERC20 },
  isLock: boolean,
): Promise<CrossChainOrder> {
  const erc20 = order.erc20!
  const txhash = order.ckb_tx_hash!
  const txWithStatus = await ckb.rpc.getTransaction(txhash)
  const { tokenName, decimals } = erc20
  const block = await ckb.rpc.getBlock(txWithStatus.txStatus.blockHash!)
  const amount = new BigNumber(order.amount).div(new BigNumber(10).pow(decimals)).toFormat(4)

  return {
    tokenName,
    amount,
    timestamp: `${Number(block.header.timestamp)}`,
    status: CrossChainOrderStatus.Completed,
    ckbTxHash: order.ckb_tx_hash!,
    ethTxHash: order.eth_tx_hash,
    isLock,
  }
}

let isRelaying = false

export function relayEthToCKBForerver() {
  setInterval(() => {
    if (isRelaying) {
      return
    }
    const hashes = relayEthTxHash.get()
    if (hashes.length === 0) {
      return
    }
    isRelaying = true
    Promise.all(
      hashes.map(h =>
        relayEthToCKB(h).then(() => {
          relayEthTxHash.remove(h)
        }),
      ),
    )
      .then(() => {
        isRelaying = false
      })
      .finally(() => {
        isRelaying = false
      })
  }, 5000)
}
