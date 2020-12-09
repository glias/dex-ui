import { HashType, Script, SUDT, SudtInfo } from '@lay2/pw-core'
import { forceBridgeSettings } from 'utils'

// eslint-disable-next-line import/no-mutable-exports
export let FORCE_BRIDGE_SETTINGS = {
  eth_token_locker_addr: '0xb0f48013B895A583fB32be6fAadE5871248eAbED',
  eth_ckb_chain_addr: '0xe9e09849c07B60a84ba4bfc5F2c0b23482B816D9',
  bridge_lockscript: {
    code_hash: '2592f19010f5ced579a89554d27d1e30047c4bf41f81ecef4ea762d022077ee9',
    hash_type: 0,
    outpoint: { tx_hash: '62558a89f6792446c7b5c834d523a2d75eba515b75662a3d699a3e198ef44496', index: 0, dep_type: 0 },
  },
  bridge_typescript: {
    code_hash: 'fe14b0c716bfcbf55067296e424031cb28a35855e8849d2921f23f7916d03b40',
    hash_type: 0,
    outpoint: { tx_hash: '62558a89f6792446c7b5c834d523a2d75eba515b75662a3d699a3e198ef44496', index: 1, dep_type: 0 },
  },
  light_client_typescript: {
    code_hash: 'f86dc52e6ea959c1dfb0e2433ad4578e97ab06f2735bd899302206d504b6cd14',
    hash_type: 0,
    outpoint: { tx_hash: '62558a89f6792446c7b5c834d523a2d75eba515b75662a3d699a3e198ef44496', index: 2, dep_type: 0 },
  },
  light_client_lockscript: {
    code_hash: '7a031ad689c0acb49ee203fa22f6ff89e1a538baa6bf1c37576d074ebbfdf4ad',
    hash_type: 0,
    outpoint: { tx_hash: '62558a89f6792446c7b5c834d523a2d75eba515b75662a3d699a3e198ef44496', index: 3, dep_type: 0 },
  },
  recipient_typescript: {
    code_hash: '5da121aa6b22039b33aa373f8a0131e6db7eb60225afc63138b3d91ce2528ded',
    hash_type: 0,
    outpoint: { tx_hash: '62558a89f6792446c7b5c834d523a2d75eba515b75662a3d699a3e198ef44496', index: 4, dep_type: 0 },
  },
  sudt: {
    code_hash: 'c5e5dcf215925f7ef4dfaf5f4b4f105bc321c02776d6e7d52a1db3fcd9d011a4',
    hash_type: 1,
    outpoint: { tx_hash: 'e12877ebd2c3c364dc46c5c992bcfaf4fee33fa13eebdf82c591fc9825aab769', index: 0, dep_type: 0 },
  },
  light_client_cell_script: {
    cell_script:
      '59000000100000003000000031000000f86dc52e6ea959c1dfb0e2433ad4578e97ab06f2735bd899302206d504b6cd140024000000b2b04f94c000440d4dbee69a84ede70e1c6b5fca8ebb258419fdc2598799da7b01000000',
  },
  pw_locks: {
    inner: [{ tx_hash: '57a62003daeab9d54aa29b944fc3b451213a5ebdf2e232216a3cfed0dde61b38', index: 0, dep_type: 0 }],
  },
}

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
