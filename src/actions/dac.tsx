import { DEVICES_LOAD, DEVICES_LOAD_FAIL, DEVICES_LOAD_SUCCESS, DEVICE_LOAD, DEVICE_LOAD_FAIL, DEVICE_LOAD_SUCCESS, DEVICE_SAVE, DEVICE_SAVE_FAIL, DEVICE_SAVE_SUCCESS } from "../reducers/dac"

import * as DAC from '../apis/hls_dac'

import 'whatwg-fetch'

var api = new DAC.DefaultApi()

export function loadDevices(accessToken) {
    return {
        types: [
            DEVICES_LOAD,
            DEVICES_LOAD_SUCCESS,
            DEVICES_LOAD_FAIL,
        ],
        payload: {
            promise: api.devicesGet({
				headers: {
					"Authorization": accessToken
				}
			}),
        },
    }
}

export function loadDevice(name, accessToken) {
    return {
        types: [
            DEVICE_LOAD,
            DEVICE_LOAD_SUCCESS,
            DEVICE_LOAD_FAIL,
        ],
        payload: {
            promise: api.deviceGet({
                name
            },{
                headers: {
                    "Authorization": accessToken
                }
            }).then((res) => {
                return res
            }),
        },
    }
}

export function saveDevice(device, accessToken) {
    return {
        types: [
            DEVICE_SAVE,
            DEVICE_SAVE_SUCCESS,
            DEVICE_SAVE_FAIL,
        ],
        payload: {
            promise: api.devicePut({
                device
            },{
                headers: {
                    "Authorization": accessToken
                }
            }).then((res) => {
                return device
            }),
        },
    }
}