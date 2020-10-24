import PWCore, { Amount } from '@lay2/pw-core'
import { useState } from 'react'
import { createContainer } from 'unstated-next'
import Web3 from 'web3'

interface Wallet {
  balance: Amount
  address: string
}

interface CkbWallet extends Wallet {
  inuse: Amount
  free: Amount
}

export function useWallet() {
  const [pw, setPw] = useState<null | PWCore>(null)
  const [web3, setWeb3] = useState<null | Web3>(null)
  const [ckbWallet, setCkbWallet] = useState<CkbWallet>({
    balance: Amount.ZERO,
    inuse: Amount.ZERO,
    free: Amount.ZERO,
    address: '',
  })
  const [ethWallet, setEthWallet] = useState<Wallet>({
    balance: Amount.ZERO,
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

  return {
    pw,
    web3,
    setPw,
    setWeb3,
    ckbWallet,
    setCkbWallet,
    ethWallet,
    setEthBalance,
    setCkbBalance,
    setEthAddress,
    setCkbAddress,
  }
}

export const WalletContainer = createContainer(useWallet)

export default WalletContainer
