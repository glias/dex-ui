import PWCore, { Amount, AmountUnit } from '@lay2/pw-core'
import { useCallback, useState } from 'react'
import { createContainer } from 'unstated-next'
import Web3 from 'web3'
import { getCkbBalance, getSudtBalance } from '../APIs'
import { SUDT_TYPE_SCRIPT } from '../utils'

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
  const [ckbWallet, setCkbWallet] = useState<CkbWallet>({
    balance: Amount.ZERO,
    inuse: Amount.ZERO,
    free: Amount.ZERO,
    lockedOrder: Amount.ZERO,
    address: '',
  })
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

  const setEthBalance = (balance: Amount) => {
    setEthWallet({
      ...ethWallet,
      balance,
    })
  }

  const setEthAddress = (address: string) => {
    setEthWallet({
      ...ethWallet,
      address,
    })
  }

  const setCkbAddress = (address: string) => {
    setCkbWallet({
      ...ckbWallet,
      address,
    })
  }

  const setCkbBalance = (balance: Amount) => {
    setCkbWallet({
      ...ckbWallet,
      balance,
    })
  }

  const reloadCkbWallet = useCallback(async (address: string) => {
    const res = (await getCkbBalance(PWCore.provider.address.toLockScript())).data
    const free = new Amount(res.free, AmountUnit.shannon)
    const occupied = new Amount(res.occupied, AmountUnit.shannon)
    const lockedOrder = new Amount(res.locked_order, AmountUnit.shannon)
    // eslint-disable-next-line no-debugger
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
  }
}

export const WalletContainer = createContainer(useWallet)

export default WalletContainer
