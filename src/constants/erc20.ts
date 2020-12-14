import { HashType, Script, SUDT, SudtInfo } from '@lay2/pw-core'
import { forceBridgeSettings } from 'utils'

// eslint-disable-next-line import/no-mutable-exports
export let FORCE_BRIDGE_SETTINGS = {
  eth_token_locker_addr: '0x9568e06B6CDA58eDf9469e4B6394184b4466a0b3',
  eth_ckb_chain_addr: '0xD3fF5d9400f1A209af64aE1fBb0F627FDDB98B49',
  bridge_lockscript: {
    code_hash: '7b802a58978016376e9b92d332c26b1ecdda11855b8250c9570bb2e2dd81f1c2',
    hash_type: 0,
    outpoint: { tx_hash: '17e44aabf1b96b1735fffa23419718615d829aa7e661ab02815b293fac5742e4', index: 0, dep_type: 0 },
  },
  bridge_typescript: {
    code_hash: 'fe14b0c716bfcbf55067296e424031cb28a35855e8849d2921f23f7916d03b40',
    hash_type: 0,
    outpoint: { tx_hash: '17e44aabf1b96b1735fffa23419718615d829aa7e661ab02815b293fac5742e4', index: 1, dep_type: 0 },
  },
  light_client_typescript: {
    code_hash: 'e2ff33937bc517ed32871a30dcf69a9cc237f81ffcb7f125beb4606ebc25513f',
    hash_type: 0,
    outpoint: { tx_hash: '17e44aabf1b96b1735fffa23419718615d829aa7e661ab02815b293fac5742e4', index: 2, dep_type: 0 },
  },
  light_client_lockscript: {
    code_hash: '7a031ad689c0acb49ee203fa22f6ff89e1a538baa6bf1c37576d074ebbfdf4ad',
    hash_type: 0,
    outpoint: { tx_hash: '17e44aabf1b96b1735fffa23419718615d829aa7e661ab02815b293fac5742e4', index: 3, dep_type: 0 },
  },
  recipient_typescript: {
    code_hash: '5da121aa6b22039b33aa373f8a0131e6db7eb60225afc63138b3d91ce2528ded',
    hash_type: 0,
    outpoint: { tx_hash: '17e44aabf1b96b1735fffa23419718615d829aa7e661ab02815b293fac5742e4', index: 4, dep_type: 0 },
  },
  sudt: {
    code_hash: 'c5e5dcf215925f7ef4dfaf5f4b4f105bc321c02776d6e7d52a1db3fcd9d011a4',
    hash_type: 1,
    outpoint: { tx_hash: 'e12877ebd2c3c364dc46c5c992bcfaf4fee33fa13eebdf82c591fc9825aab769', index: 0, dep_type: 0 },
  },
  light_client_cell_script: { cell_script: '' },
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
  tokenName: 'USDC',
  decimals: 6,
  address: '0x1cf98d2a2f5b0BFc365EAb6Ae1913C275bE2618F',
}

export const ERC20_USDC: ERC20 = {
  tokenName: 'USDT',
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
  return new Script(`0x${FORCE_BRIDGE_SETTINGS.bridge_lockscript.code_hash}`, lockArgs, HashType.data)
}

export const buildShadowAssetSUDT = (
  info: SudtInfo,
  erc20Address: string = '0x0000000000000000000000000000000000000000',
) => {
  const scriptHash = buildBridgeLockScript(erc20Address).toHash()
  // eslint-disable-next-line no-console
  console.log(scriptHash)
  return new SUDT(scriptHash, info)
}
