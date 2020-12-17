import PWCore, { Address, AddressType, AmountUnit, Script, SUDT } from '@lay2/pw-core'
import { Modal } from 'antd'
import BigNumber from 'bignumber.js'
import { useCallback, useMemo, useRef, useState } from 'react'
import { createContainer } from 'unstated-next'
import { replayResistOutpoints } from 'utils'
import Web3 from 'web3'
import Web3Modal from 'web3modal'
import { getCkbBalance, getOrCreateBridgeCell, getSudtBalance } from '../APIs'
import {
  CKB_DECIMAL,
  CKB_NODE_URL,
  ERC20,
  ERC20_LIST,
  IS_DEVNET,
  IssuerLockHash,
  ORDER_BOOK_LOCK_SCRIPT,
  PW_DEV_CHAIN_CONFIG,
  SUDT_DEP,
  SUDT_GLIA,
  SUDT_LIST,
} from '../constants'
import DEXCollector from '../pw/dexCollector'
import { Web3ModalProviderFix } from './patch/Web3ModalProviderFix'

export interface Wallet {
  balance: BigNumber
  lockedOrder: BigNumber
  address: string
  tokenName: string
}

export interface CkbWallet extends Wallet {
  inuse: BigNumber
  free: BigNumber
}

export function isCkbWallet(wallet: Wallet): wallet is CkbWallet {
  return wallet.tokenName === 'CKB'
}

export interface SudtWallet extends Wallet {
  lockedOrder: BigNumber
  lockHash: IssuerLockHash
}

const defaultCkbWallet: CkbWallet = {
  balance: new BigNumber(0),
  inuse: new BigNumber(0),
  free: new BigNumber(0),
  lockedOrder: new BigNumber(0),
  address: '',
  tokenName: 'CKB',
}

const defaultSUDTWallet: SudtWallet = {
  balance: new BigNumber(0),
  lockedOrder: new BigNumber(0),
  address: '',
  lockHash: '',
  tokenName: 'GLIA',
}

const defaultSUDTWallets = SUDT_LIST.map(sudt => {
  return {
    ...defaultSUDTWallet,
    lockHash: sudt.issuerLockHash,
    tokenName: sudt.info?.name!,
  }
})

const defaultERC20Wallets = ERC20_LIST.map(erc20 => {
  return {
    balance: new BigNumber(0),
    lockedOrder: new BigNumber(0),
    address: erc20.address,
    tokenName: erc20.tokenName,
  }
})

const defaultEthWallet: Wallet = {
  balance: new BigNumber(0),
  lockedOrder: new BigNumber(0),
  address: '',
  tokenName: 'ETH',
}

export function useWallet() {
  const [pw, setPw] = useState<null | PWCore>(null)
  const [web3, setWeb3] = useState<null | Web3>(null)
  const web3ModalRef = useRef<Web3Modal | null>(null)
  const [ckbWallet, setCkbWallet] = useState<CkbWallet>(defaultCkbWallet)
  const [connectStatus, setConnectStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected')
  const [ethWallet, setEthWallet] = useState<Wallet>(defaultEthWallet)
  const web3Ref = useRef<Web3 | null>(null)
  const orderListAbortController = useRef<AbortController | null>(null)

  const [sudtWallets, setSudtWallets] = useState<SudtWallet[]>(defaultSUDTWallets)
  const [erc20Wallets, setERC20Wallets] = useState<Wallet[]>(defaultERC20Wallets)
  const [currentSudtLockHash, setCurrentSudtLockHash] = useState<IssuerLockHash>(SUDT_GLIA.issuerLockHash)
  const currentSudtWallet = useMemo(() => {
    return sudtWallets.find(w => w.lockHash === currentSudtLockHash)!
  }, [currentSudtLockHash, sudtWallets])

  const connecting = useMemo(() => connectStatus === 'connecting', [connectStatus])

  const setEthBalance = useCallback(
    (balance: BigNumber, addr: string) => {
      setEthWallet({
        ...ethWallet,
        balance,
        address: addr,
      })
    },
    [ethWallet, setEthWallet],
  )

  const setEthAddress = useCallback(
    (address: string) => {
      setEthWallet({
        ...ethWallet,
        address,
      })
    },
    [ethWallet, setEthWallet],
  )

  const setCkbAddress = useCallback(
    (address: string) => {
      setCkbWallet({
        ...ckbWallet,
        address,
      })
    },
    [ckbWallet, setCkbWallet],
  )

  const setCkbBalance = useCallback(
    (balance: BigNumber) => {
      setCkbWallet({
        ...ckbWallet,
        balance,
      })
    },
    [ckbWallet],
  )

  const reloadCkbWallet = useCallback(async (address: string) => {
    const res = (await getCkbBalance(PWCore.provider.address.toLockScript())).data
    const free = new BigNumber(res.free).div(CKB_DECIMAL)
    const occupied = new BigNumber(res.occupied).div(CKB_DECIMAL)
    const lockedOrder = new BigNumber(res.locked_order).div(CKB_DECIMAL)

    setCkbWallet({
      balance: free,
      inuse: occupied,
      free,
      lockedOrder,
      address,
      tokenName: 'CKB',
    })
  }, [])

  const reloadSudtWallet = useCallback(async (sudt: SUDT) => {
    const res = (await getSudtBalance(sudt.toTypeScript(), PWCore.provider.address.toLockScript())).data
    const decimal = new BigNumber(10).pow(sudt?.info?.decimals ?? AmountUnit.shannon)
    const free = new BigNumber(res.free).div(decimal)
    const lockedOrder = new BigNumber(res.locked_order).div(decimal)
    return {
      balance: free,
      lockedOrder,
      address: '',
      lockHash: sudt.issuerLockHash,
      tokenName: sudt.info?.symbol ?? '',
    }
  }, [])

  const reloadEthWallet = useCallback(async () => {
    if (!web3Ref.current) {
      return
    }
    const [ethAddr] = await web3Ref.current.eth.getAccounts()
    const ethBalance = await web3Ref.current.eth.getBalance(ethAddr)

    setEthBalance(new BigNumber(ethBalance).div(new BigNumber(10).pow(18)), ethAddr.toLowerCase())
  }, [web3Ref, setEthBalance])

  const reloadERC20Wallet = useCallback(async (erc20: ERC20, web3: Web3, ethAddress: string) => {
    const contract = new web3.eth.Contract(
      [
        {
          constant: true,
          inputs: [{ name: '_owner', type: 'address' }],
          name: 'balanceOf',
          outputs: [{ name: 'balance', type: 'uint256' }],
          type: 'function',
        },
      ],
      erc20.address,
    )

    const balance = await contract.methods.balanceOf(ethAddress).call()

    return {
      balance: new BigNumber(balance).div(10 ** erc20.decimals),
      lockedOrder: new BigNumber(0),
      tokenName: erc20.tokenName,
      address: erc20.address,
    } as Wallet
  }, [])

  const reloadSudtWallets = useCallback(async () => {
    const wallets = await Promise.all(SUDT_LIST.map(sudt => reloadSudtWallet(sudt)))
    setSudtWallets(wallets)
  }, [reloadSudtWallet])

  const reloadERC20Wallets = useCallback(
    (web3: Web3, ethAddress: string) => {
      Promise.all(ERC20_LIST.map(erc20 => reloadERC20Wallet(erc20, web3, ethAddress)))
        .then(wallets => {
          setERC20Wallets(wallets)
        })
        .catch(() => ({}))
    },
    [reloadERC20Wallet],
  )

  const reloadWallet = useCallback(
    (ckbAddress: string, ethAddress: string, web3: Web3) => {
      reloadCkbWallet(ckbAddress)
      reloadSudtWallets()
      reloadEthWallet()
      reloadERC20Wallets(web3, ethAddress)
    },
    [reloadCkbWallet, reloadSudtWallets, reloadEthWallet, reloadERC20Wallets],
  )

  const disconnectWallet = useCallback(
    async (cb?: Function) => {
      // eslint-disable-next-line no-unused-expressions
      orderListAbortController.current?.abort()
      await PWCore.provider.close()
      await web3ModalRef.current?.clearCachedProvider()
      setCkbAddress('')
      setEthAddress('')
      setConnectStatus('disconnected')
      // eslint-disable-next-line no-unused-expressions
      cb?.()
    },
    [setCkbAddress, setEthAddress, setConnectStatus],
  )

  const connectWallet = useCallback(async () => {
    setConnectStatus('connecting')
    try {
      const provider = await web3ModalRef.current?.connect()

      provider.on('accountsChanged', function reconnectWallet(accounts: string[]) {
        provider.off('accountsChanged', reconnectWallet)
        if (accounts?.length > 0) connectWallet()
        else disconnectWallet()
      })

      const newWeb3 = new Web3(provider)
      const chainID = await newWeb3.eth.getChainId()

      if (chainID !== 3) {
        Modal.error({
          title: 'Connect Wallet error',
          content:
            'This Ethereum network is not supported. Please connect your Ethereum wallet to Ropsten Test Network.',
        })
        throw new Error('Connect Wallet error')
      }

      const newPw = await new PWCore(CKB_NODE_URL).init(
        new Web3ModalProviderFix(newWeb3),
        new DEXCollector(),
        IS_DEVNET ? 2 : undefined,
        IS_DEVNET ? PW_DEV_CHAIN_CONFIG : undefined,
      )

      // TODO FIXME HACKED
      // Aggron testnet sudt dep code has updated, hard code here before PW upgrade
      // https://github.com/nervosnetwork/rfcs/pull/214
      PWCore.config.sudtType.cellDep = SUDT_DEP

      const [ethAddr] = await newWeb3.eth.getAccounts()
      const ethBalance = await newWeb3.eth.getBalance(ethAddr)
      const ckbAddr = PWCore.provider.address.toCKBAddress()

      setWeb3(newWeb3)
      web3Ref.current = newWeb3
      setPw(newPw)

      setEthBalance(new BigNumber(ethBalance).div(new BigNumber(10).pow(18)), ethAddr.toLowerCase())
      setCkbAddress(ckbAddr)
      reloadWallet(ckbAddr, ethAddr, newWeb3)
      setConnectStatus('connected')
    } catch (e) {
      setConnectStatus('disconnected')
    }
  }, [reloadWallet, setCkbAddress, setEthBalance, disconnectWallet])

  const resetWallet = useCallback(() => {
    setCkbWallet(defaultCkbWallet)
    setSudtWallets(defaultSUDTWallets)
    setEthWallet(defaultEthWallet)
  }, [])

  const wallets = useMemo(() => {
    return [ckbWallet, ethWallet, ...sudtWallets, ...erc20Wallets]
  }, [ckbWallet, ethWallet, sudtWallets, erc20Wallets])

  const lockHash = useMemo(() => (ckbWallet.address ? PWCore.provider?.address?.toLockScript().toHash() : ''), [
    ckbWallet.address,
  ])

  const getBridgeCell = useCallback(
    (tokenAddress: string, type: 'cross-order' | 'cross-in') => {
      if (!lockHash) {
        return null
      }
      const ckbAddress = ckbWallet.address
      const address = new Address(ckbAddress, AddressType.ckb)

      const orderLock = new Script(
        ORDER_BOOK_LOCK_SCRIPT.codeHash,
        address.toLockScript().toHash(),
        ORDER_BOOK_LOCK_SCRIPT.hashType,
      )
      const recipientAddress = type === 'cross-in' ? address.toCKBAddress() : orderLock.toAddress().toCKBAddress()
      const key = `${recipientAddress}-${tokenAddress}`
      const ops = replayResistOutpoints.get()[key]

      return ops
    },
    [lockHash, ckbWallet.address],
  )

  const createBridgeCell = useCallback(
    (tokenAddress: string, type: 'cross-order' | 'cross-in', cb?: Function) => {
      if (!lockHash) {
        return
      }
      const ckbAddress = ckbWallet.address
      const address = new Address(ckbAddress, AddressType.ckb)

      const orderLock = new Script(
        ORDER_BOOK_LOCK_SCRIPT.codeHash,
        address.toLockScript().toHash(),
        ORDER_BOOK_LOCK_SCRIPT.hashType,
      )
      const recipientAddress = type === 'cross-in' ? address.toCKBAddress() : orderLock.toAddress().toCKBAddress()
      const key = `${recipientAddress}-${tokenAddress}`
      const ops = replayResistOutpoints.get()[key]
      const isOpsEmpty = !ops || (Array.isArray(ops) && ops.length === 0)
      if (isOpsEmpty) {
        getOrCreateBridgeCell(recipientAddress, tokenAddress).then(res => {
          if (res && res.data) {
            replayResistOutpoints.add(key, res.data.outpoints)
            // eslint-disable-next-line no-unused-expressions
            cb?.()
          }
        })
      }
    },
    [lockHash, ckbWallet.address],
  )

  const isWalletNotConnected = useMemo(() => {
    return connectStatus !== 'connected'
  }, [connectStatus])

  return {
    pw,
    web3,
    setPw,
    setWeb3,
    ckbWallet,
    setCkbWallet,
    ethWallet,
    sudtWallets,
    setEthBalance,
    setCkbBalance,
    setEthAddress,
    setCkbAddress,
    reloadCkbWallet,
    reloadSudtWallet,
    reloadSudtWallets,
    reloadWallet,
    connecting,
    connectWallet,
    connectStatus,
    disconnectWallet,
    web3ModalRef,
    resetWallet,
    setCurrentSudtLockHash,
    currentSudtWallet,
    wallets,
    createBridgeCell,
    getBridgeCell,
    lockHash,
    erc20Wallets,
    isWalletNotConnected,
    orderListAbortController,
  }
}

export const WalletContainer = createContainer(useWallet)

export default WalletContainer
