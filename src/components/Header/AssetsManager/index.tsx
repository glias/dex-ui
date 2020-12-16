import { checkSubmittedTxs } from 'APIs'
import React, { useEffect } from 'react'
import { MemoryRouter, Route, Switch, useHistory, useLocation } from 'react-router-dom'
import styled from 'styled-components'
import { AssetBalance } from './AssetBalance'
import { AssetDetail } from './AssetsDetail'
import { AssetManagerContainer } from './hooks'
import { getPendingTransactions } from './pendingTxs'
import { Receive } from './Receive'
import { Send } from './Send'
import { SendConfirm } from './Send/Confirm'
import { TransactionDetail } from './TransactionDetail'

const Control = () => {
  const { pathname } = useLocation()
  const { replace } = useHistory()

  if (pathname === '/') replace('/assets')

  return (
    <>
      <Switch>
        <Route exact path="/assets" component={AssetBalance} />
        <Route exact path="/assets/:tokenName" component={AssetDetail} />
        <Route exact path="/assets/:tokenName/receive" component={Receive} />
        <Route exact path="/assets/:tokenName/send/confirm" component={SendConfirm} />
        <Route exact path="/assets/:tokenName/send" component={Send} />
        <Route exact path="/assets/:tokenName/transactions/:txHash" component={TransactionDetail} />
      </Switch>
    </>
  )
}

const AssetManagerWrapper = styled.div`
  width: 375px;
  height: 675px;
  overflow-y: auto;
`

export const AssetManager: React.FC = () => {
  // check and clean the pending cell when the cell was dead
  useEffect(() => {
    const taskId = setInterval(() => {
      const hashes = getPendingTransactions().map(tx => tx.txHash)
      if (!hashes.length) return
      checkSubmittedTxs(hashes)
    }, 3000)

    return () => {
      clearInterval(taskId)
    }
  })

  return (
    <AssetManagerWrapper>
      <MemoryRouter>
        <AssetManagerContainer.Provider>
          <Control />
        </AssetManagerContainer.Provider>
      </MemoryRouter>
    </AssetManagerWrapper>
  )
}
