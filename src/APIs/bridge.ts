import { FORCE_BRIDGE_SETTINGS } from 'constants/erc20'
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
