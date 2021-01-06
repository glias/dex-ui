import 'ant-design-icons/dist/anticons.min.css'
import React from 'react'
import ReactDOM from 'react-dom'
import styled from 'styled-components'
import { QueryClientProvider, QueryClient } from 'react-query'
import { ReactQueryDevtools } from 'react-query/devtools'
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

const queryClient = new QueryClient()

ReactDOM.render(
  <QueryClientProvider client={queryClient}>
    <WalletContainer.Provider>
      <TransactionListenerContainer.Provider>
        <OrderContainer.Provider>
          <AppDiv>
            <Routers />
          </AppDiv>
        </OrderContainer.Provider>
      </TransactionListenerContainer.Provider>
    </WalletContainer.Provider>
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>,
  document.getElementById('root'),
)
