const OPEN = 'hls/monitor/OPEN';
const START = 'hls/monitor/START';
const CLOSE = 'hls/monitor/CLOSE';
const STOP = 'hls/monitor/STOP';
const CLIENT_LOADING = 'hls/monitor/CLIENT_LOADING'
const CLIENT_LOADED = 'hls/monitor/CLIENT_LOADED'
const CLIENT_FAILED = 'hls/monitor/CLIENT_FAILED'
const NEW_MONITORED_VALUE = 'hls/monitor/NEW_MONITORED_VALUE';

import { SIGN_OUT } from './iam'
export { OPEN, START, CLOSE, STOP, CLIENT_LOADING, CLIENT_LOADED, CLIENT_FAILED, NEW_MONITORED_VALUE }

const initialState = {
	open: false,
	channels: [],
    client: null,
	clientError: null,
	loading: false
};

export default function reducer(state:{
	open: boolean,
	channels: Array<any>
	} = initialState, action:{type?:string, error?:string, organization?:string, device?:string, channel?: string, value?: any, client?: any} = {}) {
	switch (action.type) {
		case OPEN:
			return {
                ...state,
                open: true
            }
        case START:
            if (action.organization && action.device && action.channel) {
				if (state.channels.filter((channel) => {
					return (action.organization == channel.organization && action.device == channel.device && action.channel == channel.channel);
				}).length == 0) {
					var channels = state.channels.slice()
					channels.push({
						organization: action.organization,
						device: action.device,
						channel: action.channel,
                        value: '-'
					})
					state.channels = channels
				}
			}
            return {
                ...state
            }
		case CLOSE:
			return {
                ...state,
                open: false
            }
		case STOP:
			state.channels = state.channels.filter((channel) => {
				return !(action.organization == channel.organization && action.device == channel.device && action.channel == channel.channel);
			})
			return {
				...state
			}
        case NEW_MONITORED_VALUE:
            if (action.organization && action.device && action.channel) {
                var channels = state.channels.slice()
                var matchingChannels = channels.filter((channel) => {
					return (action.organization == channel.organization && action.device == channel.device && action.channel == channel.channel);
				});
				if (matchingChannels.length > 0) {
                    matchingChannels[0].value = action.value
                    state.channels = channels
				}
			}
            return {
                ...state
			}
		case CLIENT_LOADING: 
			return {
				...state,
				client: null,
				clientError: null,
				loading: true
			}
        case CLIENT_LOADED:
            return {
                ...state,
                client: action.client,
				clientError: null,
				loading: false
            }
        case CLIENT_FAILED: {
			return {
                ...state,
				clientError: action.error,
				loading: false
            }
		}
		case SIGN_OUT: {
			return {
				...state,
				client: null,
				clientError: null
			}
		}
		default:
			return state;
	}
}