import { PageActions } from '../actions'

export const appReducer = (
  state: State.AppState,
  { type, payload }: { type: PageActions; payload: State.PageState },
): State.AppState => {
  switch (type) {
    case PageActions.UpdateAddress:
      return {
        ...state
      }
    default:
      return state
  }
}

export default appReducer
