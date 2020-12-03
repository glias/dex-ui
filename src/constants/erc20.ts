import { HashType, Script, SUDT, SudtInfo } from '@lay2/pw-core'

export const FORCE_BRIDGE_SETTINGS = {
  eth_token_locker_addr: '0xE9e7593081828a222E38E22578D9241D32504013',
  eth_ckb_chain_addr: '0xcD62E77cFE0386343c15C13528675aae9925D7Ae',
  bridge_lockscript: {
    code_hash: '5e90ac3cf9f5d1ce3f140639ad3b427aa44b185b602c4a84f703cb46beb86260',
    outpoint: { tx_hash: 'f214cddbf9540124f0fc123d39da44d391bc9fc06874b7503d883c418a3e1cdc', index: 0 },
  },
  bridge_typescript: {
    code_hash: 'e2d6a6a10ea4b5a31a441c4f05e6c994182b419e25a5356d94f6f3050b9988f3',
    outpoint: { tx_hash: 'f214cddbf9540124f0fc123d39da44d391bc9fc06874b7503d883c418a3e1cdc', index: 1 },
  },
  light_client_typescript: {
    code_hash: 'afc2c74e01ad9cc6a39837996fb247d33d5abc53b257cf5e98ed5207df736ba7',
    outpoint: { tx_hash: 'f214cddbf9540124f0fc123d39da44d391bc9fc06874b7503d883c418a3e1cdc', index: 2 },
  },
  light_client_lockscript: {
    code_hash: '7a031ad689c0acb49ee203fa22f6ff89e1a538baa6bf1c37576d074ebbfdf4ad',
    outpoint: { tx_hash: 'f214cddbf9540124f0fc123d39da44d391bc9fc06874b7503d883c418a3e1cdc', index: 3 },
  },
  recipient_typescript: {
    code_hash: 'a170baee8a38fcc33a83a51db412a51b74101e931f7f90586de1971b11154ad4',
    outpoint: { tx_hash: 'f214cddbf9540124f0fc123d39da44d391bc9fc06874b7503d883c418a3e1cdc', index: 4 },
  },
  sudt: {
    code_hash: 'e1e354d6d643ad42724d40967e334984534e0367405c5ae42a9d7d63d77df419',
    outpoint: { tx_hash: 'f214cddbf9540124f0fc123d39da44d391bc9fc06874b7503d883c418a3e1cdc', index: 5 },
  },
  dag_merkle_roots: { tx_hash: 'f214cddbf9540124f0fc123d39da44d391bc9fc06874b7503d883c418a3e1cdc', index: 6 },
  light_client_cell_script: { cell_script: '' },
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
