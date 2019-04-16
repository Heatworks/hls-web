const LOAD = 'hls/tests/LOAD';
const LOAD_SUCCESS = 'hls/tests/LOAD_SUCCESS';
const LOAD_FAIL = 'hls/tests/LOAD_FAIL';
const TEST_LOAD = 'hls/tests/test/LOAD';
const TEST_LOAD_SUCCESS = 'hls/tests/test/LOAD_SUCCESS';
const TEST_LOAD_FAIL = 'hls/tests/test/LOAD_FAIL';

const TEST_CHECK_EXISTS = 'hls/tests/test/CHECK_EXISTS';
const TEST_CHECK_EXISTS_SUCCESS = 'hls/tests/test/CHECK_EXISTS_SUCCESS';
const TEST_CHECK_EXISTS_FAIL = 'hls/tests/test/CHECK_EXISTS_FAIL';

const TEST_SAVE = 'hls/tests/test/SAVE';
const TEST_SAVE_SUCCESS = 'hls/tests/test/SAVE_SUCCESS';
const TEST_SAVE_FAIL = 'hls/tests/test/SAVE_FAIL';

const TEST_DELETE = 'hls/tests/test/DELETE';
const TEST_DELETE_SUCCESS = 'hls/tests/test/DELETE_SUCCESS';
const TEST_DELETE_FAIL = 'hls/tests/test/DELETE_FAIL';

const LOAD_PREFIXES = 'hls/tests/prefixes/LOAD';
const LOAD_PREFIXES_SUCCESS = 'hls/tests/prefixes/LOAD_SUCCESS';
const LOAD_PREFIXES_FAIL = 'hls/tests/prefixes/LOAD_FAIL';

export { LOAD, LOAD_SUCCESS, LOAD_FAIL, TEST_LOAD, TEST_LOAD_SUCCESS, TEST_LOAD_FAIL, TEST_CHECK_EXISTS, TEST_CHECK_EXISTS_SUCCESS, TEST_CHECK_EXISTS_FAIL, TEST_SAVE, TEST_SAVE_FAIL, TEST_SAVE_SUCCESS, TEST_DELETE, TEST_DELETE_SUCCESS, TEST_DELETE_FAIL, LOAD_PREFIXES, LOAD_PREFIXES_SUCCESS, LOAD_PREFIXES_FAIL }

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
	},
	exists: {
		name: undefined,
		exists: false,
		loading: false,
		loaded: false,
		error: null
	},
	prefixes: {
		loading: false,
		loaded: false,
		data: [],
		error: null
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
		case TEST_CHECK_EXISTS:
			return {
				...state,
				exists: {
					name: undefined,
					loading: true,
					loaded: false,
					exists: false
				}
			};
		case TEST_CHECK_EXISTS_SUCCESS:
			return {
				...state,
				exists: {
					name: action.payload.name,
					loading: false,
					loaded: true,
					error: null,
					exists: action.payload.exists
				}
			};
		case TEST_CHECK_EXISTS_FAIL:
			return {
				...state,
				exists: {
					name: undefined,
					loading: false,
					loaded: false,
					error: action.error
				}
			};
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

		case LOAD_PREFIXES:
			return {
				...state,
				prefixes: {
					...state.prefixes,
					loading: true,
					loaded: false,
					error: null
				}
			}
		case LOAD_PREFIXES_SUCCESS:
			return {
				...state,
				prefixes: {
					...state.prefixes,
					loading: false,
					loaded: true,
					data: action.payload,
					error: null
				}
			}
		case LOAD_PREFIXES_FAIL:
			return {
				...state,
				prefixes: {
					...state.prefixes,
					loading: false,
					loaded: false,
					error: action.error
				},
				error: action.error
			}
		default:
			return state;
	}
}