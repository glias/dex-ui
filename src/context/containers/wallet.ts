import PWCore from '@lay2/pw-core'
import { useState } from 'react'
import { createContainer } from 'unstated-next'
import Web3 from 'web3'

interface Wallet {
  balance: number
  address: string
}

interface CkbWallet extends Wallet {
  inUse: number
  free: number
}

export function useWallet() {
  const [pw, setPw] = useState<null | PWCore>(null)
  const [web3, setWeb3] = useState<null | Web3>(null)
  const [ckbWallet, setCkbWallet] = useState<CkbWallet>({
    balance: 0,
    inUse: 0,
    free: 0,
    address: '',
  })
  const [ethWallet, setEthWallet] = useState<Wallet>({
    balance: 0,
    address: '',
  })
  const setEthBalance = (balance: number) => {
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

  const setCkbBalance = (balance: number) => {
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
