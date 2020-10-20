import initApp from './app'
import initCountState from './count'

export type FetchStatus = keyof State.FetchStatus

const initState: State.AppState = {
  app: initApp,
  counterState: initCountState
}

export default initState
