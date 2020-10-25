import React from 'react'
import ReactDOM from 'react-dom'
import { Spin } from 'antd'
import { useContainer } from 'unstated-next'
import './index.css'
import 'ant-design-icons/dist/anticons.min.css'
import 'antd/dist/antd.css'
import './utils/i18n'
import { Provider } from 'react-redux'
import Routers from './routes'
import store from './context/store'
import { WalletContainer } from './containers/wallet'
import { OrderContainer } from './containers/order'
import { AppContainer } from './containers/app'

const App = () => {
  const app = useContainer(AppContainer)

  return (
    <Spin spinning={app.fullLoading.show} tip={app.fullLoading.tip}>
      <Routers />
    </Spin>
  )
}

ReactDOM.render(
  <Provider store={store}>
    <AppContainer.Provider>
      <WalletContainer.Provider>
        <OrderContainer.Provider>
          <App />
        </OrderContainer.Provider>
      </WalletContainer.Provider>
    </AppContainer.Provider>
  </Provider>,
  document.getElementById('root'),
)
