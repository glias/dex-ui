import CKB from '@nervosnetwork/ckb-sdk-core'
import { useMemo } from 'react'
import { createContainer } from 'unstated-next'
import { CKB_NODE_URL } from '../constants'
import { asyncPatch, CkbTransactionListener } from './patch/wallet-patch'
import WalletContainer from './wallet'

function useListener() {
  const { pw } = WalletContainer.useContainer()
  const listener = useMemo(() => {
    if (!pw) return null

    const txListener = new CkbTransactionListener({ rpc: new CKB(CKB_NODE_URL).rpc })
    asyncPatch(pw, 'sendTransaction', { after: hash => txListener.registerTransactions(hash) })
    return txListener
  }, [pw])

  return { listener }
}

export const TransactionListenerContainer = createContainer(useListener)
