import PWCore, { Amount } from '@lay2/pw-core'
import { useCallback, useState } from 'react'
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

  const reloadCkbWallet = useCallback(async (address: string) => {
    const balance = await PWCore.defaultCollector.getBalance(PWCore.provider.address)
    const filledCells = await PWCore.defaultCollector.collect(PWCore.provider.address, {
      withData: true,
    } as any)
    const emptyCells = await PWCore.defaultCollector.collect(PWCore.provider.address, {
      withData: false,
    } as any)

    const inuse = filledCells.length ? filledCells.map(c => c.capacity).reduce((sum, cap) => sum.add(cap)) : Amount.ZERO
    const free = emptyCells.length ? emptyCells.map(c => c.capacity).reduce((sum, cap) => sum.add(cap)) : Amount.ZERO

    // eslint-disable-next-line no-debugger
    setCkbWallet({
      balance,
      inuse,
      free,
      address,
    })
  }, [])

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
    reloadCkbWallet,
  }
}

export const WalletContainer = createContainer(useWallet)

export default WalletContainer
