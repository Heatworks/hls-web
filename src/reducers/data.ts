const LOAD = 'hls/data/LOAD';
const LOAD_SUCCESS = 'hls/data/LOAD_SUCCESS';
const LOAD_FAIL = 'hls/data/LOAD_FAIL';

export { LOAD, LOAD_SUCCESS, LOAD_FAIL }

const initialState = {
	loaded: false,
	loading: false,
	data: []
};

export default function reducer(state:any = initialState, action:{type?:string, error?:string, payload?: any} = {}) {
	switch (action.type) {
		case LOAD:
			state.loading = true
			return state
		case LOAD_SUCCESS:
			return {
                ...state,
				loading: false,
				loaded: true,
				data: action.payload,
			};
		case LOAD_FAIL:
			return {...state,
				loading: false,
				loaded: false,
				error: action.error
			}
		default:
			return state;
	}
}