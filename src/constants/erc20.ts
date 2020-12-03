import { HashType, Script, SUDT, SudtInfo } from '@lay2/pw-core'

export const FORCE_BRIDGE_SETTINGS = {
  eth_token_locker_addr: '0x3A284DE04DEA407583001b829c5C0c0c96Ecf51E',
  eth_ckb_chain_addr: '0x77B3561E850A08F34f70c2b25c45D2d4259a330c',
  bridge_lockscript: {
    code_hash: 'e695bd8fb75c5e5d0a938f65f891af8cd45ac583ac38e90ac2f955d019962d11',
    outpoint: { tx_hash: 'b2cc421b5ec451167b15dd3893a1a3676371e426b22491d3009c17810cdfc5ac', index: 0, dep_type: 0 },
  },
  bridge_typescript: {
    code_hash: 'e2d6a6a10ea4b5a31a441c4f05e6c994182b419e25a5356d94f6f3050b9988f3',
    outpoint: { tx_hash: 'b2cc421b5ec451167b15dd3893a1a3676371e426b22491d3009c17810cdfc5ac', index: 1, dep_type: 0 },
  },
  light_client_typescript: {
    code_hash: '9b806672568046c1c3e629d1fcc5e055d89aea98fd70dca4f4fcbcfca7c413c0',
    outpoint: { tx_hash: 'b2cc421b5ec451167b15dd3893a1a3676371e426b22491d3009c17810cdfc5ac', index: 2, dep_type: 0 },
  },
  light_client_lockscript: {
    code_hash: '7a031ad689c0acb49ee203fa22f6ff89e1a538baa6bf1c37576d074ebbfdf4ad',
    outpoint: { tx_hash: 'b2cc421b5ec451167b15dd3893a1a3676371e426b22491d3009c17810cdfc5ac', index: 3, dep_type: 0 },
  },
  recipient_typescript: {
    code_hash: 'a170baee8a38fcc33a83a51db412a51b74101e931f7f90586de1971b11154ad4',
    outpoint: { tx_hash: 'b2cc421b5ec451167b15dd3893a1a3676371e426b22491d3009c17810cdfc5ac', index: 4, dep_type: 0 },
  },
  sudt: {
    code_hash: 'e1e354d6d643ad42724d40967e334984534e0367405c5ae42a9d7d63d77df419',
    outpoint: { tx_hash: 'b2cc421b5ec451167b15dd3893a1a3676371e426b22491d3009c17810cdfc5ac', index: 5, dep_type: 0 },
  },
  dag_merkle_roots: {
    tx_hash: 'b2cc421b5ec451167b15dd3893a1a3676371e426b22491d3009c17810cdfc5ac',
    index: 6,
    dep_type: 0,
  },
  light_client_cell_script: {
    cell_script:
      '590000001000000030000000310000009b806672568046c1c3e629d1fcc5e055d89aea98fd70dca4f4fcbcfca7c413c00024000000906ba2261c1a4e9932ca84d4e4a871f668ba3a2ecde63c4bd40e559d1bfb068a01000000',
  },
  pw_locks: {
    inner: [
      { tx_hash: 'ace5ea83c478bb866edf122ff862085789158f5cbff155b7bb5f13058555b708', index: 0, dep_type: 1 },
      { tx_hash: 'e4ddfd424edc84211b35cca756ecf1f9708291cf15ae965e38afc45451c7aee1', index: 0, dep_type: 0 },
      { tx_hash: 'bf8264248a7c15820f343a356bb1d01379d42e1eb0305ab5b07ef14b566de41f', index: 0, dep_type: 0 },
    ],
  },
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
