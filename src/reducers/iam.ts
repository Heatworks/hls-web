const LOAD = 'hls/iam/LOAD';
const LOAD_SUCCESS = 'hls/iam/LOAD_SUCCESS';
const LOAD_FAIL = 'hls/iam/LOAD_FAIL';
const ORGANIZATION_LOAD = 'hls/iam/organization/LOAD';
const ORGANIZATION_LOAD_SUCCESS = 'hls/iam/organization/LOAD_SUCCESS';
const ORGANIZATION_LOAD_FAIL = 'hls/iam/organization/LOAD_FAIL';
const USERS_LOAD = 'hls/iam/users/LOAD';
const USERS_LOAD_SUCCESS = 'hls/iam/users/LOAD_SUCCESS';
const USERS_LOAD_FAIL = 'hls/iam/users/LOAD_FAIL';
const ACCESS_TOKENS_LOAD = 'hls/iam/accessTokens/LOAD';
const ACCESS_TOKENS_LOAD_SUCCESS = 'hls/iam/accessTokens/LOAD_SUCCESS';
const ACCESS_TOKENS_LOAD_FAIL = 'hls/iam/accessTokens/LOAD_FAIL';
const ACCESS_TOKENS_DELETE = 'hls/iam/accessTokens/DELETE';
const ACCESS_TOKENS_DELETE_SUCCESS = 'hls/iam/accessTokens/DELETE_SUCCESS';
const ACCESS_TOKENS_DELETE_FAIL = 'hls/iam/accessTokens/DELETE_FAIL';
const SIGN_OUT = 'hls/iam/SIGN_OUT'

export { LOAD, LOAD_SUCCESS, LOAD_FAIL, ORGANIZATION_LOAD, ORGANIZATION_LOAD_FAIL, ORGANIZATION_LOAD_SUCCESS, SIGN_OUT, USERS_LOAD, USERS_LOAD_FAIL, USERS_LOAD_SUCCESS, ACCESS_TOKENS_LOAD, ACCESS_TOKENS_LOAD_FAIL, ACCESS_TOKENS_LOAD_SUCCESS, ACCESS_TOKENS_DELETE, ACCESS_TOKENS_DELETE_FAIL, ACCESS_TOKENS_DELETE_SUCCESS }

const initialState = {
	loaded: false,
	loading: false,
	data: null,
	organization: null,
	users: {
		loaded: false,
		loading: false,
		data: []
	},
	accessTokens: {
		loaded: false,
		loading: false,
		data: []
	},
	accessToken: {
		deleting: false,
		deleted: false,
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
		case ORGANIZATION_LOAD:
			state.loading = true
			return state
		case ORGANIZATION_LOAD_SUCCESS:
			return {
                ...state,
				loading: false,
				loaded: true,
				organization: action.payload,
			};
		case ORGANIZATION_LOAD_FAIL:
			return {...state,
				loading: false,
				loaded: false,
				error: action.error
			}
		case USERS_LOAD:
			state.users.loading = true
			return state
		case USERS_LOAD_SUCCESS:
			return {
                ...state,
				users: { 
					loading: false,
					loaded: true,
					data: action.payload
				},
			};
		case USERS_LOAD_FAIL:
			return {...state,
				users: {
					loading: false,
					loaded: false,
					error: action.error
				}
			}
		case ACCESS_TOKENS_LOAD:
			state.accessTokens.loading = true
			return state
		case ACCESS_TOKENS_LOAD_SUCCESS:
			return {
                ...state,
				accessTokens: { 
					loading: false,
					loaded: true,
					data: action.payload
				},
			};
		case ACCESS_TOKENS_LOAD_FAIL:
			return {
				...state,
				accessTokens: {
					loading: false,
					loaded: false,
					error: action.error
				}
			}
		case ACCESS_TOKENS_DELETE:
			state.accessToken.deleting = true
			return state
		case ACCESS_TOKENS_LOAD_SUCCESS:
			return {
                ...state,
				accessToken: { 
					deleting: false,
					deleted: true
				},
			};
		case ACCESS_TOKENS_LOAD_FAIL:
			return {
				...state,
				accessTokens: {
					deleting: false,
					deleted: false,
					error: action.error
				}
			}
		case SIGN_OUT:
			return {
				...state,
				loaded: false,
				loading: false,
				data: null
			}
		default:
			return state;
	}
}