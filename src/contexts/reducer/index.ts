import StateActions, { AppActions, PageActions } from '../actions'
import appReducer from './app'
import pageReducer from './page'

export type AppDispatch = React.Dispatch<{ type: StateActions; payload: any }> // TODO: add type of payload
export type StateWithDispatch = State.App & { dispatch: AppDispatch }

export const reducer = (
  state: State.AppState,
  { type, payload }: { type: StateActions; payload: any },
): State.AppState => {
  if (Object.values(AppActions).includes(type as AppActions)) {
    return appReducer(state, { type: type as AppActions, payload })
  } else if (Object.values(PageActions).includes(type as PageActions)) {
    return pageReducer(state, { type: type as PageActions, payload })
  } else {
    return pageReducer(state, { type: type as PageActions, payload })
  }
}
