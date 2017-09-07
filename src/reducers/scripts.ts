const LOAD = 'hls/scripts/LOAD';
const LOAD_SUCCESS = 'hls/scripts/LOAD_SUCCESS';
const LOAD_FAIL = 'hls/scripts/LOAD_FAIL';
const SCRIPT_LOAD = 'hls/scripts/script/LOAD';
const SCRIPT_LOAD_SUCCESS = 'hls/scripts/script/LOAD_SUCCESS';
const SCRIPT_LOAD_FAIL = 'hls/scripts/script/LOAD_FAIL';

const SCRIPT_SAVE = 'hls/scripts/script/SAVE';
const SCRIPT_SAVE_SUCCESS = 'hls/scripts/script/SAVE_SUCCESS';
const SCRIPT_SAVE_FAIL = 'hls/scripts/script/SAVE_FAIL';

const SCRIPT_DELETE = 'hls/scripts/script/DELETE';
const SCRIPT_DELETE_SUCCESS = 'hls/scripts/script/DELETE_SUCCESS';
const SCRIPT_DELETE_FAIL = 'hls/scripts/script/DELETE_FAIL';

const SCRIPT_FILE_LOAD= 'hls/scripts/file/LOAD';
const SCRIPT_FILE_LOAD_SUCCESS = 'hls/scripts/file/LOAD_SUCCESS';
const SCRIPT_FILE_LOAD_FAIL = 'hls/scripts/file/LOAD_FAIL';

export { LOAD, LOAD_SUCCESS, LOAD_FAIL, SCRIPT_LOAD, SCRIPT_LOAD_SUCCESS, SCRIPT_LOAD_FAIL, SCRIPT_SAVE, SCRIPT_SAVE_FAIL, SCRIPT_SAVE_SUCCESS, SCRIPT_DELETE, SCRIPT_DELETE_SUCCESS, SCRIPT_DELETE_FAIL, SCRIPT_FILE_LOAD, SCRIPT_FILE_LOAD_FAIL, SCRIPT_FILE_LOAD_SUCCESS }

const initialState = {
	loaded: false,
	loading: false,
	data: [],
	script: {
		loaded: false,
		loading: false,
		saving: false,
		saved: false,
		deleting: false,
		deleted: false,
		data: null
	},
	file: {
		loaded: false,
		loading: false,
		saving: false,
		deleted: false,
		deleting: false,
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
		case SCRIPT_LOAD:
			state.script.loading = true
			return state
		case SCRIPT_LOAD_SUCCESS:
			return {
                ...state,
				script: {
					loading: false,
					loaded: true,
					data: action.payload
				}
			};
		case SCRIPT_LOAD_FAIL:
			return {...state,
				script: {
					loading: false,
					loaded: false,
					error: action.error
				}
			}
		case SCRIPT_SAVE:
			state.script.saving = true
			return state
		case SCRIPT_SAVE_SUCCESS:
			return {
                ...state,
				script: {
					...state.script,
					saving: false,
					saved: true,
					data: action.payload
				}
			};
		case SCRIPT_SAVE_FAIL:
			return {...state,
				script: {
					...state.script,
					saving: false,
					saved: false,
					error: action.error
				}
			}
		case SCRIPT_DELETE:
			return {
				...state,
				script: {
					...state.script,
					deleting: true
				}
			}
		case SCRIPT_DELETE_FAIL:
			return {
				...state,
				script: {
					...state.script,
					deleting: false,
					deleted: false,
					error: action.error
				}
			}
		case SCRIPT_DELETE_SUCCESS:
			return {
				...state,
				view: {
					...state.script,
					deleting: false,
					deleted: true,
				}
			}
		case SCRIPT_FILE_LOAD:
			state.file.loading = true
			return state
		case SCRIPT_FILE_LOAD_SUCCESS:
			return {
                ...state,
				file: {
					loading: false,
					loaded: true,
					data: action.payload
				}
			};
		case SCRIPT_FILE_LOAD_FAIL:
			return {...state,
				file: {
					loading: false,
					loaded: false,
					error: action.error
				}
			}
		default:
			return state;
	}
}