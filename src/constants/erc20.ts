import { HashType, Script, SUDT, SudtInfo } from '@lay2/pw-core'
import { forceBridgeSettings } from 'utils'

// eslint-disable-next-line import/no-mutable-exports
export let FORCE_BRIDGE_SETTINGS = {
  eth_token_locker_addr: '0xF264A2Adf7D5c683855828B5bE39c25CEe0a13df',
  eth_ckb_chain_addr: '0xb01e8fd9657cCf5c4BE4fb4b1D665E1a3a491c1E',
  bridge_lockscript: {
    code_hash: 'fd9515dc15ce2385aab85af21a6c89d7c003eac115dcbd195a8f29ad916ab316',
    hash_type: 1,
    outpoint: { tx_hash: '23f30b8479415e5813e019b6b1783464f9c45dc5af333decda9650f90b0e3107', index: 0, dep_type: 0 },
  },
  bridge_typescript: {
    code_hash: 'a878bee27cf7fae49a028cf3e506af946dd2ea86f19586d68db3029ab3f20dd3',
    hash_type: 1,
    outpoint: { tx_hash: '23f30b8479415e5813e019b6b1783464f9c45dc5af333decda9650f90b0e3107', index: 1, dep_type: 0 },
  },
  light_client_typescript: {
    code_hash: '3130dc7bbf8b9e00ca9f7e9040bb59d242ee48375a322621be36e1f502a227ed',
    hash_type: 1,
    outpoint: { tx_hash: '23f30b8479415e5813e019b6b1783464f9c45dc5af333decda9650f90b0e3107', index: 3, dep_type: 0 },
  },
  recipient_typescript: {
    code_hash: 'ceb3993bd660eec67ab045f7853dd60b4b9d4e006db7069f7aae0e2e7a5037a5',
    hash_type: 1,
    outpoint: { tx_hash: '23f30b8479415e5813e019b6b1783464f9c45dc5af333decda9650f90b0e3107', index: 2, dep_type: 0 },
  },
  sudt: {
    code_hash: 'c5e5dcf215925f7ef4dfaf5f4b4f105bc321c02776d6e7d52a1db3fcd9d011a4',
    hash_type: 1,
    outpoint: { tx_hash: 'e12877ebd2c3c364dc46c5c992bcfaf4fee33fa13eebdf82c591fc9825aab769', index: 0, dep_type: 0 },
  },
  light_client_cell_script: {
    cell_script:
      '590000001000000030000000310000003130dc7bbf8b9e00ca9f7e9040bb59d242ee48375a322621be36e1f502a227ed0124000000ce121a960ca47b8cea3a9b3ddc75cb03e07c894c10d5557f865b50ddc6d68c8d01000000',
  },
  multisig_address: { addresses: ['ckt1qyqyr27ps67cwn9cldgzvvmsa0lvry2wu5us4g430u'], require_first_n: 0, threshold: 1 },
  ckb_relay_mutlisig_threshold: { threshold: 0 },
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

const lightClientTypeScript = new Script(
  '0x3130dc7bbf8b9e00ca9f7e9040bb59d242ee48375a322621be36e1f502a227ed',
  '0xce121a960ca47b8cea3a9b3ddc75cb03e07c894c10d5557f865b50ddc6d68c8d01000000',
  HashType.type,
)

export const buildBridgeLockScript = (erc20Address: string = '0x0000000000000000000000000000000000000000') => {
  const lockArgs = `0x${FORCE_BRIDGE_SETTINGS.eth_token_locker_addr.slice(2)}${erc20Address.slice(
    2,
  )}${lightClientTypeScript.toHash().slice(2)}`
  return new Script(`0x${FORCE_BRIDGE_SETTINGS.bridge_lockscript.code_hash}`, lockArgs, HashType.type)
}

export const buildShadowAssetSUDT = (
  info: SudtInfo,
  erc20Address: string = '0x0000000000000000000000000000000000000000',
) => {
  const scriptHash = buildBridgeLockScript(erc20Address).toHash()
  return new SUDT(scriptHash, info)
}
