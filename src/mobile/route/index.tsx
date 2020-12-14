import { AssetManager } from 'components/Header/AssetsManager'
import WalletContainer from 'containers/wallet'
import { useNotifyTransaction } from 'hooks/useNotifyTransaction'
import { NavigationMenu } from 'mobile/components/Header'
import { AppHeader } from 'mobile/components/Header/AppHeader'
import Trade from 'pages/Trade'
import React, { useEffect } from 'react'
import { BrowserRouter as Router, Route, Switch, useHistory, useLocation } from 'react-router-dom'
import styled from 'styled-components'
import BackgroundImageUrl from '../../assets/img/dex-bg.png'

const MobileWrapper = styled.div`
  position: relative;
  background: url('${BackgroundImageUrl}') fixed center;
  background-size: cover;
`

const Control = () => {
  useNotifyTransaction()

  return (
    <Switch>
      <Route exact path="/assets" component={AssetManager} />
      <Route>
        <NavigationMenu />
        <Route exact path="/trade" component={Trade} />
      </Route>
    </Switch>
  )
}

const RouterRoot = () => {
  const { connectStatus } = WalletContainer.useContainer()
  const { pathname } = useLocation()
  const history = useHistory()

  useEffect(() => {
    if (pathname === '/') history.replace('/trade')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <MobileWrapper>
      <AppHeader />
      {connectStatus === 'connected' && <Control />}
    </MobileWrapper>
  )
}

export default () => {
  return (
    <Router>
      <RouterRoot />
    </Router>
  )
}
