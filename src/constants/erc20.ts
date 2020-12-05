import { HashType, Script, SUDT, SudtInfo } from '@lay2/pw-core'
import { forceBridgeSettings } from 'utils'

// eslint-disable-next-line import/no-mutable-exports
export let FORCE_BRIDGE_SETTINGS = {
  eth_token_locker_addr: '0x9FDFB6DF838bCF951206Cf1A6B928a7573F544b7',
  eth_ckb_chain_addr: '0x9C457E40d39c967fc040E9da89BDcF4b34F21365',
  bridge_lockscript: {
    code_hash: 'e695bd8fb75c5e5d0a938f65f891af8cd45ac583ac38e90ac2f955d019962d11',
    outpoint: { tx_hash: '8277a95067f8d3fe731d2b5e631e7080f65a5b45107d5661b9c5f70ed1458733', index: 0, dep_type: 0 },
  },
  bridge_typescript: {
    code_hash: 'e2d6a6a10ea4b5a31a441c4f05e6c994182b419e25a5356d94f6f3050b9988f3',
    outpoint: { tx_hash: '8277a95067f8d3fe731d2b5e631e7080f65a5b45107d5661b9c5f70ed1458733', index: 1, dep_type: 0 },
  },
  light_client_typescript: {
    code_hash: 'dda5d9939f2c850fdb12a4a8386c18158cc0a476b7d5c7740ec56dda499fab9b',
    outpoint: { tx_hash: '8277a95067f8d3fe731d2b5e631e7080f65a5b45107d5661b9c5f70ed1458733', index: 2, dep_type: 0 },
  },
  light_client_lockscript: {
    code_hash: '7a031ad689c0acb49ee203fa22f6ff89e1a538baa6bf1c37576d074ebbfdf4ad',
    outpoint: { tx_hash: '8277a95067f8d3fe731d2b5e631e7080f65a5b45107d5661b9c5f70ed1458733', index: 3, dep_type: 0 },
  },
  recipient_typescript: {
    code_hash: 'a170baee8a38fcc33a83a51db412a51b74101e931f7f90586de1971b11154ad4',
    outpoint: { tx_hash: '8277a95067f8d3fe731d2b5e631e7080f65a5b45107d5661b9c5f70ed1458733', index: 4, dep_type: 0 },
  },
  sudt: {
    code_hash: 'e1e354d6d643ad42724d40967e334984534e0367405c5ae42a9d7d63d77df419',
    outpoint: { tx_hash: '8277a95067f8d3fe731d2b5e631e7080f65a5b45107d5661b9c5f70ed1458733', index: 5, dep_type: 0 },
  },
  dag_merkle_roots: {
    tx_hash: '8277a95067f8d3fe731d2b5e631e7080f65a5b45107d5661b9c5f70ed1458733',
    index: 6,
    dep_type: 0,
  },
  light_client_cell_script: {
    cell_script:
      '59000000100000003000000031000000dda5d9939f2c850fdb12a4a8386c18158cc0a476b7d5c7740ec56dda499fab9b0024000000c1994292c3bfff8030346871187447d7be566cb5690700345cfc5967db8f53bd01000000',
  },
  pw_locks: {
    inner: [
      { tx_hash: 'ace5ea83c478bb866edf122ff862085789158f5cbff155b7bb5f13058555b708', index: 0, dep_type: 1 },
      { tx_hash: 'e4ddfd424edc84211b35cca756ecf1f9708291cf15ae965e38afc45451c7aee1', index: 0, dep_type: 0 },
      { tx_hash: 'bf8264248a7c15820f343a356bb1d01379d42e1eb0305ab5b07ef14b566de41f', index: 0, dep_type: 0 },
    ],
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
