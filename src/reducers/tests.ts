const LOAD = 'hls/tests/LOAD';
const LOAD_SUCCESS = 'hls/tests/LOAD_SUCCESS';
const LOAD_FAIL = 'hls/tests/LOAD_FAIL';
const TEST_LOAD = 'hls/tests/test/LOAD';
const TEST_LOAD_SUCCESS = 'hls/tests/test/LOAD_SUCCESS';
const TEST_LOAD_FAIL = 'hls/tests/test/LOAD_FAIL';

const TEST_SAVE = 'hls/tests/test/SAVE';
const TEST_SAVE_SUCCESS = 'hls/tests/test/SAVE_SUCCESS';
const TEST_SAVE_FAIL = 'hls/tests/test/SAVE_FAIL';

const TEST_DELETE = 'hls/tests/test/DELETE';
const TEST_DELETE_SUCCESS = 'hls/tests/test/DELETE_SUCCESS';
const TEST_DELETE_FAIL = 'hls/tests/test/DELETE_FAIL';

export { LOAD, LOAD_SUCCESS, LOAD_FAIL, TEST_LOAD, TEST_LOAD_SUCCESS, TEST_LOAD_FAIL, TEST_SAVE, TEST_SAVE_FAIL, TEST_SAVE_SUCCESS, TEST_DELETE, TEST_DELETE_SUCCESS, TEST_DELETE_FAIL }

const initialState = {
	loaded: false,
	loading: false,
	data: [],
	test: {
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
		case TEST_LOAD:
			state.test.loading = true
			return state
		case TEST_LOAD_SUCCESS:
			return {
                ...state,
				test: {
					loading: false,
					loaded: true,
					data: action.payload
				}
			};
		case TEST_LOAD_FAIL:
			return {...state,
				test: {
					loading: false,
					loaded: false,
					error: action.error
				}
			}
		case TEST_SAVE:
			state.test.saving = true
			return state
		case TEST_SAVE_SUCCESS:
			return {
                ...state,
				test: {
					...state.test,
					saving: false,
					saved: true,
					data: action.payload
				}
			};
		case TEST_SAVE_FAIL:
			return {...state,
				test: {
					...state.test,
					saving: false,
					saved: false,
					error: action.error
				}
			}
		case TEST_DELETE:
			return {
				...state,
				test: {
					...state.test,
					deleting: true
				}
			}
		case TEST_DELETE_FAIL:
			return {
				...state,
				test: {
					...state.test,
					deleting: false,
					deleted: false,
					error: action.error
				}
			}
		case TEST_DELETE_SUCCESS:
			return {
				...state,
				test: {
					...state.test,
					deleting: false,
					deleted: true,
				}
			}
		default:
			return state;
	}
}