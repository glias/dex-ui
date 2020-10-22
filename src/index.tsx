import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import 'ant-design-icons/dist/anticons.min.css'
import styled from 'styled-components'
import 'antd/dist/antd.css'
import './utils/i18n'
import Routers from './routes'
import store from './context/store'
import { Provider } from 'react-redux'

const AppDiv = styled.div`
  width: 100%;
  height: 100%;
`


ReactDOM.render(
  <Provider store={store}>
    <AppDiv>
      <Routers />
    </AppDiv>
  </Provider>,
  document.getElementById('root')
)
