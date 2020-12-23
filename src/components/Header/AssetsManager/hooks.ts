import { AmountUnit } from '@lay2/pw-core'
import WalletContainer from 'containers/wallet'
import { useMemo, useState } from 'react'
import { createContainer } from 'unstated-next'
import { SUDT_LIST } from '../../../constants'
import { asserts, SendHelper } from './helper'

function useAssetManager() {
  const [tokenName, setTokenName] = useState('CKB')
  const { wallets, pw, dexCollector } = WalletContainer.useContainer()

  const sudt = useMemo(() => SUDT_LIST.find(sudt => sudt.info?.name === tokenName), [tokenName])
  const decimals = useMemo(() => (sudt ? sudt.info?.decimals ?? 0 : AmountUnit.ckb), [sudt])
  const wallet = useMemo(() => {
    return wallets.find(wallet => wallet.tokenName === tokenName)
  }, [wallets, tokenName])
  const isCkb = useMemo(() => tokenName === 'CKB', [tokenName])

  const sendHelper = useMemo(() => {
    asserts(pw)
    return new SendHelper(pw, dexCollector)
  }, [pw, dexCollector])

  return {
    tokenName,
    setTokenName,
    decimal: decimals,
    sudt,
    wallet,
    isCkb,
    sendHelper,
  }
}

export const AssetManagerContainer = createContainer(useAssetManager)
