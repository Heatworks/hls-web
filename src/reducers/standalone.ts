const ENGAGE = 'hls/standalone/ENGAGE';

export { ENGAGE }

const queryString = require('query-string');
var params = queryString.parse(window.location.search)
var standalone = false;
if ('accessToken' in params) {
    standalone = true;
}

const initialState = {
	engaged: standalone
};

export default function reducer(state:{
	engaged: boolean
	} = initialState, action:{type?: string} = {}) {
	switch (action.type) {
		case ENGAGE:
			return {
                ...state,
                engaged: true
            }
		default:
			return state;
	}
}