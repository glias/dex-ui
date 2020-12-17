import React from 'react'
import ReactDOM from 'react-dom'
import { RippleSpinner } from './components/RippleSpinner'
import { checkIsMobileAndTablet } from './utils/user-agent'

const Root = () => {
  const App = React.lazy(() => (checkIsMobileAndTablet() ? import('./index-mobile') : import('./index-desktop')))

  return (
    <React.Suspense fallback={<RippleSpinner />}>
      <App />
    </React.Suspense>
  )
}

ReactDOM.render(<Root />, document.getElementById('root'))
