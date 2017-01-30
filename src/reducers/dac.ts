const DEVICES_LOAD = 'hls/dac/devices/LOAD';
const DEVICES_LOAD_SUCCESS = 'hls/dac/devices/LOAD_SUCCESS';
const DEVICES_LOAD_FAIL = 'hls/dac/devices/LOAD_FAIL';

const DEVICE_LOAD = 'hls/dac/device/LOAD'
const DEVICE_LOAD_SUCCESS = 'hls/dac/device/LOAD_SUCCESS'
const DEVICE_LOAD_FAIL = 'hls/dac/device/LOAD_FAIL'
const DEVICE_SAVE = 'hls/dac/device/SAVE'
const DEVICE_SAVE_SUCCESS = 'hls/dac/device/SAVE_SUCCESS'
const DEVICE_SAVE_FAIL = 'hls/dac/device/SAVE_FAIL'

export { DEVICES_LOAD, DEVICES_LOAD_SUCCESS, DEVICES_LOAD_FAIL, DEVICE_LOAD, DEVICE_LOAD_SUCCESS, DEVICE_LOAD_FAIL, DEVICE_SAVE, DEVICE_SAVE_FAIL, DEVICE_SAVE_SUCCESS}

const initialState = {
    devices: {
        loaded: false,
        loading: false,
        data: []
    },
    device: {
		loaded: false,
		loading: false,
		saving: false,
		saved: false,
		data: null
	}
};

export default function reducer(state:any = initialState, action:{type?:string, error?:string, payload?: any} = {}) {
	switch (action.type) {
		case DEVICES_LOAD:
			state.devices.loading = true
			return state
		case DEVICES_LOAD_SUCCESS:
			return {
                ...state,
                devices: {
                    loading: false,
                    loaded: true,
                    data: action.payload,
                }
			};
		case DEVICES_LOAD_FAIL:
			return {...state,
                devices: {
                    loading: false,
                    loaded: false,
                    error: action.error
                }
			}
        case DEVICE_LOAD:
			state.device.loading = true
			return state
		case DEVICE_LOAD_SUCCESS:
			return {
                ...state,
				device: {
					loading: false,
					loaded: true,
					data: action.payload
				}
			};
		case DEVICE_LOAD_FAIL:
			return {...state,
				device: {
					loading: false,
					loaded: false,
					error: action.error
				}
			}
		case DEVICE_SAVE:
			state.device.saving = true
			return state
		case DEVICE_SAVE_SUCCESS:
			return {
                ...state,
				device: {
					...state.device,
					saving: false,
					saved: true,
					data: action.payload
				}
			};
		case DEVICE_SAVE_FAIL:
			return {...state,
				device: {
					...state.device,
					saving: false,
					saved: false,
					error: action.error
				}
			}
		default:
			return state;
	}
}