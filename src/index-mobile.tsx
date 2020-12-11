import 'ant-design-icons/dist/anticons.min.css'
import 'mobile/index.css'
import Routers from 'mobile/route'
import { theme } from 'mobile/theme'
import React from 'react'
import 'sanitize.css'
import { ThemeProvider } from 'styled-components'
import { TransactionListenerContainer } from './containers/listener'
import { OrderContainer } from './containers/order'
import { WalletContainer } from './containers/wallet'
import './utils/i18n'

const MobileApp: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <WalletContainer.Provider>
        <TransactionListenerContainer.Provider>
          <OrderContainer.Provider>
            <Routers />
          </OrderContainer.Provider>
        </TransactionListenerContainer.Provider>
      </WalletContainer.Provider>
    </ThemeProvider>
  )
}

export default MobileApp
