import { ckb, ForceBridgeItem, getForceBridgeHistory } from 'APIs'
import BigNumber from 'bignumber.js'
import { SHADOW_ASSETS, SUDT_CK_ETH } from 'constants/sudt'
import { ERC20_ETH, ERC20_LIST, FORCE_BRIDGE_SETTINGS } from 'constants/erc20'
import Web3 from 'web3'
import { getAmountFromCellData } from 'utils'
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
      .once('transactionHash', () => {
        confirmCallback()
      })
      .once('receipt', () => {
        resolve()
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
}

export async function getPureCrossChainHistory(ckbAddress: string, web3: Web3) {
  const { crosschain_history: orders } = (await getForceBridgeHistory(ckbAddress, true)).data

  return Promise.all(
    orders.reverse().map(order => {
      return getCKBCrossChainInfo(order)
        .then(res => {
          return res
        })
        .catch(() => {
          return getETHCrossChainInfo(order, web3)
        })
    }),
  )
}

export async function getETHCrossChainInfo(order: ForceBridgeItem, web3: Web3): Promise<CrossChainOrder> {
  const txHash = order.eth_lock_tx_hash
  const receipt = await web3.eth.getTransactionReceipt(txHash)
  const [transfer] = receipt.logs
  const erc20 =
    transfer.address === FORCE_BRIDGE_SETTINGS.eth_token_locker_addr
      ? ERC20_ETH
      : ERC20_LIST.find(e => e.address === transfer.address)!
  if (!erc20) {
    // eslint-disable-next-line no-debugger
    debugger
    return {} as any
  }
  const amount = new BigNumber(
    erc20 === ERC20_ETH ? web3.utils.hexToNumberString(transfer.data.slice(0, 66)) : transfer.data,
  )
    .div(new BigNumber(10).pow(erc20?.decimals!))
    .toFixed(4, 1)
  const { timestamp } = await web3.eth.getBlock(transfer.blockNumber)
  return {
    tokenName: erc20.tokenName,
    amount,
    timestamp: `${timestamp}`,
    status: CrossChainOrderStatus.Completed,
    ckbTxHash: order.ckb_tx_hash!,
    ethTxHash: order.eth_lock_tx_hash,
  }
}

export async function getCKBCrossChainInfo(order: ForceBridgeItem): Promise<CrossChainOrder> {
  const txhash = order.ckb_tx_hash!
  const txWithStatus = await ckb.rpc.getTransaction(txhash)
  const [sudtOutput] = txWithStatus.transaction.outputs
  const [outputData] = txWithStatus.transaction.outputsData
  const sudt = [SUDT_CK_ETH, ...SHADOW_ASSETS].find(s => s.toTypeScript().args === sudtOutput?.type?.args)
  if (!sudt) {
    throw new Error('')
  }
  const tokenName = sudt.info?.symbol!
  const decimal = sudt.info?.decimals!
  const block = await ckb.rpc.getBlock(txWithStatus.txStatus.blockHash!)
  const amount = new BigNumber(getAmountFromCellData(outputData, decimal)).toFormat(4)

  return {
    tokenName,
    amount,
    timestamp: `${Number(block.header.timestamp)}`,
    status: CrossChainOrderStatus.Completed,
    ckbTxHash: order.ckb_tx_hash!,
    ethTxHash: order.eth_lock_tx_hash,
  }
}
