import { useState } from 'react'
import { createContainer } from 'unstated-next'

export function App() {
  const [fullLoading, setFullLoading] = useState({
    show: false,
    tip: '',
  })

  const setFullLoadingInfo = (spin: { tip?: string; show?: boolean }) => {
    setFullLoading({
      ...fullLoading,
      ...spin,
    })
  }

  return {
    setFullLoadingInfo,
    setFullLoading,
    fullLoading,
  }
}

export const AppContainer = createContainer(App)

export default AppContainer
