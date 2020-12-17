import { HashType, Script, SUDT, SudtInfo } from '@lay2/pw-core'
import { forceBridgeSettings } from 'utils'

// eslint-disable-next-line import/no-mutable-exports
export let FORCE_BRIDGE_SETTINGS = {
  eth_token_locker_addr: '0x58D633B74Ebc9B082635C30925894112F6943201',
  eth_ckb_chain_addr: '0x888e4635dfFE724DfddFe01850d1a11b3CbD2e27',
  bridge_lockscript: {
    code_hash: '5007dca88a4300061f467173aac902940c473c2a9a7c954e62c972f38b980033',
    hash_type: 1,
    outpoint: { tx_hash: 'fd1e938e86676525b769ac66674f4385927033ca35dcd7b7475a778c34586dcf', index: 0, dep_type: 0 },
  },
  bridge_typescript: {
    code_hash: '117c7c1ffcdbb8755f9bb8862868eb3e0e1223be6f81ad344c41367b95dffb85',
    hash_type: 1,
    outpoint: { tx_hash: 'fd1e938e86676525b769ac66674f4385927033ca35dcd7b7475a778c34586dcf', index: 1, dep_type: 0 },
  },
  recipient_typescript: {
    code_hash: '97635d388321b531bb4c1627a4e67f7eee5f93fd142c620e137e89eca2fafb0b',
    hash_type: 1,
    outpoint: { tx_hash: 'fd1e938e86676525b769ac66674f4385927033ca35dcd7b7475a778c34586dcf', index: 2, dep_type: 0 },
  },
  sudt: {
    code_hash: 'c5e5dcf215925f7ef4dfaf5f4b4f105bc321c02776d6e7d52a1db3fcd9d011a4',
    hash_type: 1,
    outpoint: { tx_hash: 'e12877ebd2c3c364dc46c5c992bcfaf4fee33fa13eebdf82c591fc9825aab769', index: 0, dep_type: 0 },
  },
  light_client_cell_script: {
    cell_script:
      '490000001000000030000000310000005c5069eb0857efc65e1bca0c07df34c31663b3622fd3876c876320fc9634e2a80114000000e45a989ac83122cc94480805c378b384b4ce203d',
  },
  multisig_address: { addresses: ['ckt1qyqv2jkh9k8lrv8xsgsmk8t8tm88p4yaends6vnnuv'], require_first_n: 0, threshold: 1 },
  pw_locks: {
    inner: [
      { tx_hash: '57a62003daeab9d54aa29b944fc3b451213a5ebdf2e232216a3cfed0dde61b38', index: 0, dep_type: 0 },
      { tx_hash: 'f8de3bb47d055cdf460d93a2a6e1b05f7432f9777c8c474abf4eec1d4aee5d37', index: 0, dep_type: 1 },
    ],
  },
}

export interface ERC20 {
  tokenName: string
  decimals: number
  address: string
}

export const ERC20_DAI: ERC20 = {
  tokenName: 'DAI',
  decimals: 18,
  address: '0xC4401D8D5F05B958e6f1b884560F649CdDfD9615',
}

export const ERC20_USDT: ERC20 = {
  tokenName: 'USDT',
  decimals: 6,
  address: '0x1cf98d2a2f5b0BFc365EAb6Ae1913C275bE2618F',
}

export const ERC20_USDC: ERC20 = {
  tokenName: 'USDC',
  decimals: 6,
  address: '0x1F0D2251f51b88FaFc90f06F7022FF8d82154B1a',
}

export const ERC20_ETH: ERC20 = {
  tokenName: 'ETH',
  decimals: 18,
  address: '0x0000000000000000000000000000000000000000',
}

export const ERC20_LIST = [ERC20_DAI, ERC20_USDT, ERC20_USDC]

export const setForceBridgeServer = (settings: any) => {
  forceBridgeSettings.set(settings)
  FORCE_BRIDGE_SETTINGS = settings
}

export const buildBridgeLockScript = (erc20Address: string = '0x0000000000000000000000000000000000000000') => {
  const lockArgs = `0x${FORCE_BRIDGE_SETTINGS.eth_token_locker_addr.slice(2)}${erc20Address.slice(2)}`
  return new Script(`0x${FORCE_BRIDGE_SETTINGS.bridge_lockscript.code_hash}`, lockArgs, HashType.type)
}

export const buildShadowAssetSUDT = (
  info: SudtInfo,
  erc20Address: string = '0x0000000000000000000000000000000000000000',
) => {
  const scriptHash = buildBridgeLockScript(erc20Address).toHash()
  return new SUDT(scriptHash, info)
}
