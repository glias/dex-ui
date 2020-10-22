import { SELECTED_TRADE } from './types'

export const signupUser = (selectOrder: string) => async (dispatch: Function) => {
  dispatch({
    type: SELECTED_TRADE,
    payload: {
      selectOrder,
    },
  })
}
