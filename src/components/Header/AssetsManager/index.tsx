import React from 'react'
import { MemoryRouter, Route, Switch, useHistory, useLocation } from 'react-router-dom'
import styled from 'styled-components'
import { AssetBalance } from './AssetBalance'
import { AssetManagerContainer } from './hooks'
import { Receive } from './Receive'
import { Send } from './Send'
import { SendConfirm } from './Send/Confirm'
import { TransactionDetail } from './TransactionDetail'

const Control = () => {
  const { pathname } = useLocation()
  const { replace } = useHistory()

  if (pathname === '/') replace('/assets/CKB')

  return (
    <>
      <Switch>
        <Route exact path="/assets/:tokenName" component={AssetBalance} />
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
  max-height: 675px;
  overflow-y: auto;
  padding-bottom: 20px;
`

export const AssetManager: React.FC = () => {
  return (
    <AssetManagerContainer.Provider>
      <AssetManagerWrapper>
        <div className="content">
          <MemoryRouter>
            <Control />
          </MemoryRouter>
        </div>
      </AssetManagerWrapper>
    </AssetManagerContainer.Provider>
  )
}
