import { combineReducers } from 'redux'
import trace from './trace'
import wallet from './wallet'

export default combineReducers({
  trace,
  wallet,
})
