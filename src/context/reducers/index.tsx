import PageAction from '../actions'
import initState from '../states'

const reducer = (state = initState, action: any) => {
	switch (action.type){
		case PageAction.ConnectWallet: 
			return {
				...state.app,
				...action.payload
			}
		default: 
			return state;
	}
}

export default reducer