import { HashType, Script, SUDT, SudtInfo } from '@lay2/pw-core'

export const FORCE_BRIDGE_SETTINGS = {
  eth_token_locker_addr: '0x0592Aa9Fd1CE50636C501e1e2db8688466acC1Ea',
  eth_ckb_chain_addr: '0x876fDe0F545ACf26ad75D5065370EFb4DFDC46C2',
  bridge_lockscript: {
    code_hash: 'f063a61a307ef090ff41f649ba1975860a24f0a500d0ad7cbf576d2d5ce202b8',
    outpoint: { tx_hash: '49d74c20aabbdce1338c6293fae4ca25b24ffbe05c078f33df4c54efc689c7c7', index: 0 },
  },
  bridge_typescript: {
    code_hash: 'e2d6a6a10ea4b5a31a441c4f05e6c994182b419e25a5356d94f6f3050b9988f3',
    outpoint: { tx_hash: '49d74c20aabbdce1338c6293fae4ca25b24ffbe05c078f33df4c54efc689c7c7', index: 1 },
  },
  light_client_typescript: {
    code_hash: 'd7d1626c1adc30f0583461993b0d8e624ad93b7e2b691f5fd3830983a2c8a7f0',
    outpoint: { tx_hash: '49d74c20aabbdce1338c6293fae4ca25b24ffbe05c078f33df4c54efc689c7c7', index: 2 },
  },
  light_client_lockscript: {
    code_hash: '7a031ad689c0acb49ee203fa22f6ff89e1a538baa6bf1c37576d074ebbfdf4ad',
    outpoint: { tx_hash: '49d74c20aabbdce1338c6293fae4ca25b24ffbe05c078f33df4c54efc689c7c7', index: 3 },
  },
  recipient_typescript: {
    code_hash: 'a170baee8a38fcc33a83a51db412a51b74101e931f7f90586de1971b11154ad4',
    outpoint: { tx_hash: '49d74c20aabbdce1338c6293fae4ca25b24ffbe05c078f33df4c54efc689c7c7', index: 4 },
  },
  sudt: {
    code_hash: 'e1e354d6d643ad42724d40967e334984534e0367405c5ae42a9d7d63d77df419',
    outpoint: { tx_hash: '49d74c20aabbdce1338c6293fae4ca25b24ffbe05c078f33df4c54efc689c7c7', index: 5 },
  },
  dag_merkle_roots: { tx_hash: '49d74c20aabbdce1338c6293fae4ca25b24ffbe05c078f33df4c54efc689c7c7', index: 6 },
  light_client_cell_script: {
    cell_script:
      '59000000100000003000000031000000d7d1626c1adc30f0583461993b0d8e624ad93b7e2b691f5fd3830983a2c8a7f000240000007f92e92c0577f5fed5f9c41bf9a06a09942fa7aea44a3d6951e7e4ef308d607a00000000',
  },
}

export const buildBridgeLockScript = (erc20Address: string = '0x0000000000000000000000000000000000000000') => {
  const lockArgs = `0x${erc20Address.slice(2)}${FORCE_BRIDGE_SETTINGS.eth_token_locker_addr.slice(2)}`
  return new Script(`0x${FORCE_BRIDGE_SETTINGS.bridge_lockscript.code_hash}`, lockArgs, HashType.data)
}

export const buildShadowAssetSUDT = (
  info: SudtInfo,
  erc20Address: string = '0x0000000000000000000000000000000000000000',
) => {
  const scriptHash = buildBridgeLockScript(erc20Address).toHash()
  return new SUDT(scriptHash, info)
}
