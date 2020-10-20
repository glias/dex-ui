import { AppActions } from '../actions'

export const appReducer = (
  state: State.AppState,
  { type, payload }: { type: AppActions; payload: State.AppPayload },
): State.AppState => {
  switch (type) {
    case AppActions.ResizeWindow:
      return {
        ...state,
        app: {
          ...state.app,
          appWidth: payload.appWidth,
          appHeight: payload.appHeight,
        }
      }
    default:
      return state
  }
}

export default appReducer
