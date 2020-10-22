import initApp from './app'
import initCountState from './count'
import initTrace from './trace'

export type FetchStatus = keyof State.FetchStatus

const initState: State.AppState = {
  app: initApp,
  counterState: initCountState,
  traceState: initTrace
}

export default initState
