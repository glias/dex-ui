import PWCore, { Amount, AmountUnit, Web3ModalProvider } from '@lay2/pw-core'
import { useCallback, useState, useRef } from 'react'
import { createContainer } from 'unstated-next'
import Web3 from 'web3'
import Web3Modal from 'web3modal'
import { getCkbBalance, getSudtBalance } from '../APIs'
import { CKB_NODE_URL, SUDT_TYPE_SCRIPT } from '../utils'

const { SDCollector } = require('./sd-collector')

interface Wallet {
  balance: Amount
  lockedOrder: Amount
  address: string
}

interface CkbWallet extends Wallet {
  inuse: Amount
  free: Amount
}

interface SudtWallet extends Wallet {
  lockedOrder: Amount
}

export function useWallet() {
  const [pw, setPw] = useState<null | PWCore>(null)
  const [web3, setWeb3] = useState<null | Web3>(null)
  const web3ModalRef = useRef<Web3Modal | null>(null)
  const [ckbWallet, setCkbWallet] = useState<CkbWallet>({
    balance: Amount.ZERO,
    inuse: Amount.ZERO,
    free: Amount.ZERO,
    lockedOrder: Amount.ZERO,
    address: '',
  })
  const [connecting, setConnecting] = useState(false)
  const [ethWallet, setEthWallet] = useState<Wallet>({
    balance: Amount.ZERO,
    lockedOrder: Amount.ZERO,
    address: '',
  })

  const [sudtWallet, setSudtWallet] = useState<SudtWallet>({
    balance: Amount.ZERO,
    lockedOrder: Amount.ZERO,
    address: '',
  })

  const setEthBalance = useCallback(
    (balance: Amount) => {
      setEthWallet({
        ...ethWallet,
        balance,
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
    (balance: Amount) => {
      setCkbWallet({
        ...ckbWallet,
        balance,
      })
    },
    [ckbWallet],
  )

  const reloadCkbWallet = useCallback(async (address: string) => {
    const res = (await getCkbBalance(PWCore.provider.address.toLockScript())).data
    const free = new Amount(res.free, AmountUnit.shannon)
    const occupied = new Amount(res.occupied, AmountUnit.shannon)
    const lockedOrder = new Amount(res.locked_order, AmountUnit.shannon)
    setCkbWallet({
      balance: free,
      inuse: occupied,
      free,
      lockedOrder,
      address,
    })
  }, [])

  const reloadSudtWallet = useCallback(async () => {
    const res = (await getSudtBalance(SUDT_TYPE_SCRIPT, PWCore.provider.address.toLockScript())).data
    const free = new Amount(res.free, AmountUnit.shannon)
    const lockedOrder = new Amount(res.locked_order, AmountUnit.shannon)
    setSudtWallet({
      balance: free,
      lockedOrder,
      address: '',
    })
  }, [])

  const reloadWallet = useCallback(
    (address: string) => {
      reloadCkbWallet(address)
      reloadSudtWallet()
    },
    [reloadCkbWallet, reloadSudtWallet],
  )

  const connectWallet = useCallback(async () => {
    setConnecting(true)
    try {
      const provider = await web3ModalRef.current?.connect()
      const newWeb3 = new Web3(provider)
      const newPw = await new PWCore(CKB_NODE_URL).init(new Web3ModalProvider(newWeb3), new SDCollector() as any)
      const [ethAddr] = await newWeb3.eth.getAccounts()
      const ckbAddr = PWCore.provider.address.toCKBAddress()

      setWeb3(newWeb3)
      setPw(newPw)

      setEthAddress(ethAddr.toLowerCase())
      setCkbAddress(ckbAddr)
      reloadWallet(ckbAddr)
    } catch (error) {
      // @TODO: error handling
      // eslint-disable-next-line no-console
      console.error(error)
    } finally {
      setConnecting(false)
    }
  }, [reloadWallet, setEthAddress, setCkbAddress])

  const disconnectWallet = useCallback(
    async (cb: Function) => {
      await PWCore.provider.close()
      await web3ModalRef.current?.clearCachedProvider()
      setCkbAddress('')
      setEthAddress('')
      setConnecting(false)
      cb()
    },
    [setCkbAddress, setEthAddress],
  )

  return {
    pw,
    web3,
    setPw,
    setWeb3,
    ckbWallet,
    setCkbWallet,
    ethWallet,
    sudtWallet,
    setEthBalance,
    setCkbBalance,
    setEthAddress,
    setCkbAddress,
    reloadCkbWallet,
    reloadSudtWallet,
    reloadWallet,
    connecting,
    setConnecting,
    connectWallet,
    disconnectWallet,
    web3ModalRef,
  }
}

export const WalletContainer = createContainer(useWallet)

export default WalletContainer
