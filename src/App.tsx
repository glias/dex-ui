import React from 'react'
import styled, { ThemeProvider } from 'styled-components'
import 'antd/dist/antd.css'
import './utils/i18n'
import Routers from './routes'
import withProviders from './contexts/providers'

const Theme = {
  light: 'daylight',
  dark: 'NIGHT'
}

const AppDiv = styled.div`
  width: 100%;
  height: 100vh;
`

const App = withProviders(() => {
  return (
    <ThemeProvider theme={Theme}>
      <AppDiv>
        <Routers />
      </AppDiv>
    </ThemeProvider>
  )
})

export default App