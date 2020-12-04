import { HashType, Script, SUDT, SudtInfo } from '@lay2/pw-core'
import { forceBridgeSettings } from 'utils'

// eslint-disable-next-line import/no-mutable-exports
export let FORCE_BRIDGE_SETTINGS = {
  eth_token_locker_addr: '0xA7e3e799095A8E46297BDdFd7b8f416E77e9AB21',
  eth_ckb_chain_addr: '0xB534aCDD594e1870FEa3436629F5dbc0b8006D07',
  bridge_lockscript: {
    code_hash: 'e695bd8fb75c5e5d0a938f65f891af8cd45ac583ac38e90ac2f955d019962d11',
    outpoint: { tx_hash: 'db303713587e2395fdc87dc4a3cdce042e1150ebeeda4b82ccf2f422bd2d990a', index: 0, dep_type: 0 },
  },
  bridge_typescript: {
    code_hash: 'e2d6a6a10ea4b5a31a441c4f05e6c994182b419e25a5356d94f6f3050b9988f3',
    outpoint: { tx_hash: 'db303713587e2395fdc87dc4a3cdce042e1150ebeeda4b82ccf2f422bd2d990a', index: 1, dep_type: 0 },
  },
  light_client_typescript: {
    code_hash: 'd7dd62bbf85b6b181a269b7865cba8a143a03f10b1e472f3f6f7d04c50da6f43',
    outpoint: { tx_hash: 'db303713587e2395fdc87dc4a3cdce042e1150ebeeda4b82ccf2f422bd2d990a', index: 2, dep_type: 0 },
  },
  light_client_lockscript: {
    code_hash: '7a031ad689c0acb49ee203fa22f6ff89e1a538baa6bf1c37576d074ebbfdf4ad',
    outpoint: { tx_hash: 'db303713587e2395fdc87dc4a3cdce042e1150ebeeda4b82ccf2f422bd2d990a', index: 3, dep_type: 0 },
  },
  recipient_typescript: {
    code_hash: 'a170baee8a38fcc33a83a51db412a51b74101e931f7f90586de1971b11154ad4',
    outpoint: { tx_hash: 'db303713587e2395fdc87dc4a3cdce042e1150ebeeda4b82ccf2f422bd2d990a', index: 4, dep_type: 0 },
  },
  sudt: {
    code_hash: 'e1e354d6d643ad42724d40967e334984534e0367405c5ae42a9d7d63d77df419',
    outpoint: { tx_hash: 'db303713587e2395fdc87dc4a3cdce042e1150ebeeda4b82ccf2f422bd2d990a', index: 5, dep_type: 0 },
  },
  dag_merkle_roots: {
    tx_hash: 'db303713587e2395fdc87dc4a3cdce042e1150ebeeda4b82ccf2f422bd2d990a',
    index: 6,
    dep_type: 0,
  },
  light_client_cell_script: {
    cell_script:
      '59000000100000003000000031000000d7dd62bbf85b6b181a269b7865cba8a143a03f10b1e472f3f6f7d04c50da6f4300240000007df3dcbcdbc6033c90c2a5f6c570465ec936f211d9f1681223a4afd75d0f230301000000',
  },
  pw_locks: { inner: [] },
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
