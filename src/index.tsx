import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import 'ant-design-icons/dist/anticons.min.css'
import styled from 'styled-components'
import './utils/i18n'
import Routers from './routes'
import { WalletContainer } from './containers/wallet'
import { OrderContainer } from './containers/order'

const AppDiv = styled.div`
  width: 100%;
  height: 100%;
  background-color: #fff;
`

ReactDOM.render(
  <WalletContainer.Provider>
    <OrderContainer.Provider>
      <AppDiv>
        <Routers />
      </AppDiv>
    </OrderContainer.Provider>
  </WalletContainer.Provider>,
  document.getElementById('root'),
)
