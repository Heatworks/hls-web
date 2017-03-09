const LOAD = 'hls/views/LOAD';
const LOAD_SUCCESS = 'hls/views/LOAD_SUCCESS';
const LOAD_FAIL = 'hls/views/LOAD_FAIL';
const VIEW_LOAD = 'hls/views/view/LOAD';
const VIEW_LOAD_SUCCESS = 'hls/views/view/LOAD_SUCCESS';
const VIEW_LOAD_FAIL = 'hls/views/view/LOAD_FAIL';

const VIEW_SAVE = 'hls/views/view/SAVE';
const VIEW_SAVE_SUCCESS = 'hls/views/view/SAVE_SUCCESS';
const VIEW_SAVE_FAIL = 'hls/views/view/SAVE_FAIL';

const VIEW_DELETE = 'hls/views/view/DELETE';
const VIEW_DELETE_SUCCESS = 'hls/views/view/DELETE_SUCCESS';
const VIEW_DELETE_FAIL = 'hls/views/view/DELETE_FAIL';

export { LOAD, LOAD_SUCCESS, LOAD_FAIL, VIEW_LOAD, VIEW_LOAD_SUCCESS, VIEW_LOAD_FAIL, VIEW_SAVE, VIEW_SAVE_FAIL, VIEW_SAVE_SUCCESS, VIEW_DELETE, VIEW_DELETE_SUCCESS, VIEW_DELETE_FAIL }

const initialState = {
	loaded: false,
	loading: false,
	data: [],
	view: {
		loaded: false,
		loading: false,
		saving: false,
		saved: false,
		deleting: false,
		deleted: false,
		data: null
	}
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
		case VIEW_LOAD:
			state.view.loading = true
			return state
		case VIEW_LOAD_SUCCESS:
			return {
                ...state,
				view: {
					loading: false,
					loaded: true,
					data: action.payload
				}
			};
		case VIEW_LOAD_FAIL:
			return {...state,
				view: {
					loading: false,
					loaded: false,
					error: action.error
				}
			}
		case VIEW_SAVE:
			state.view.saving = true
			return state
		case VIEW_SAVE_SUCCESS:
			return {
                ...state,
				view: {
					...state.view,
					saving: false,
					saved: true,
					data: action.payload
				}
			};
		case VIEW_SAVE_FAIL:
			return {...state,
				view: {
					...state.view,
					saving: false,
					saved: false,
					error: action.error
				}
			}
		case VIEW_DELETE:
			return {
				...state,
				view: {
					...state.view,
					deleting: true
				}
			}
		case VIEW_DELETE_FAIL:
			return {
				...state,
				view: {
					...state.view,
					deleting: false,
					deleted: false,
					error: action.error
				}
			}
		case VIEW_DELETE_SUCCESS:
			return {
				...state,
				view: {
					...state.view,
					deleting: false,
					deleted: true,
				}
			}
		default:
			return state;
	}
}