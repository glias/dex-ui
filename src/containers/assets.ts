import { useState } from 'react'
import { createContainer } from 'unstated-next'

interface BalanceParam {
  tokenName: string
}

type AssetsView = 'balance' | 'send' | 'receive' | 'select-token'

type UnknownParams = unknown
// type ViewParams = BalanceParam | UnknownParams
type PushViewParams<T extends AssetsView> = T extends 'balance' ? BalanceParam : UnknownParams
// type PushFn = <V extends AssetsView>(view: V, params: PushViewParams<V>) => void

function useView() {
  const [currentView, setCurrentView] = useState<AssetsView>('balance')
  const [currentAssetType, setCurrentAssetType] = useState<string>('CKB')

  function push<V extends AssetsView>(view: V, params: PushViewParams<V>) {
    setCurrentView(view)

    if (view === 'balance' && params) {
      setCurrentAssetType((params as BalanceParam).tokenName)
    }
  }

  return { push, view: currentView, tokenName: currentAssetType }
}

export const AssetsContainer = createContainer(useView)
