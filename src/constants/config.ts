import { CellDep, DepType, HashType, OutPoint, Script } from '@lay2/pw-core'

export const INFURA_ID = process.env.REACT_APP_INFURA_ID!

export const IS_DEVNET = !!process.env.REACT_APP_IS_DEVNET

export const PW_DEV_CHAIN_CONFIG = {
  daoType: {
    cellDep: new CellDep(
      DepType.code,
      new OutPoint('0xa563884b3686078ec7e7677a5f86449b15cf2693f3c1241766c6996f206cc541', '0x2'),
    ),
    script: new Script('0x82d76d1b75fe2fd9a27dfbaa65a039221a380d76c926f378d3f81cf3e7e13f2e', '0x', HashType.type),
  },
  sudtType: {
    cellDep: new CellDep(
      DepType.code,
      new OutPoint('0xbf8264248a7c15820f343a356bb1d01379d42e1eb0305ab5b07ef14b566de41f', '0x0'),
    ),
    script: new Script('0xe1e354d6d643ad42724d40967e334984534e0367405c5ae42a9d7d63d77df419', '0x', HashType.data),
  },
  defaultLock: {
    cellDep: new CellDep(
      DepType.depGroup,
      new OutPoint('0xace5ea83c478bb866edf122ff862085789158f5cbff155b7bb5f13058555b708', '0x0'),
    ),
    script: new Script('0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8', '0x', HashType.type),
  },
  multiSigLock: {
    cellDep: new CellDep(
      DepType.depGroup,
      new OutPoint('0xace5ea83c478bb866edf122ff862085789158f5cbff155b7bb5f13058555b708', '0x1'),
    ),
    script: new Script('0x5c5069eb0857efc65e1bca0c07df34c31663b3622fd3876c876320fc9634e2a8', '0x', HashType.type),
  },
  pwLock: {
    cellDep: new CellDep(
      DepType.code,
      new OutPoint('0xe4ddfd424edc84211b35cca756ecf1f9708291cf15ae965e38afc45451c7aee1', '0x0'),
    ),
    script: new Script('0xe6acf70d7e336db0368c920a833d9d9f9ca8c3c8aba39f24741c45db435c3e18', '0x', HashType.type),
  },
  acpLockList: [
    new Script('0xe6acf70d7e336db0368c920a833d9d9f9ca8c3c8aba39f24741c45db435c3e18', '0x', HashType.type),
    new Script('0x0fb343953ee78c9986b091defb6252154e0bb51044fd2879fde5b27314506111', '0x', HashType.data),
  ],
}
