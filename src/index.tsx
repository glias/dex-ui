import 'ant-design-icons/dist/anticons.min.css'
import React from 'react'
import ReactDOM from 'react-dom'
import styled from 'styled-components'
import { TransactionListenerContainer } from './containers/listener'
import { OrderContainer } from './containers/order'
import { WalletContainer } from './containers/wallet'
import './index.css'
import Routers from './routes'
import './utils/i18n'

const AppDiv = styled.div`
  width: 100%;
  height: 100%;
`

ReactDOM.render(
  <WalletContainer.Provider>
    <TransactionListenerContainer.Provider>
      <OrderContainer.Provider>
        <AppDiv>
          <Routers />
        </AppDiv>
      </OrderContainer.Provider>
    </TransactionListenerContainer.Provider>
  </WalletContainer.Provider>,
  document.getElementById('root'),
)
