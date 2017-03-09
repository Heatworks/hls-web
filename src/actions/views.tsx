import { LOAD, LOAD_FAIL, LOAD_SUCCESS, VIEW_LOAD, VIEW_LOAD_FAIL, VIEW_LOAD_SUCCESS, VIEW_SAVE, VIEW_SAVE_FAIL, VIEW_SAVE_SUCCESS, VIEW_DELETE, VIEW_DELETE_FAIL, VIEW_DELETE_SUCCESS } from "../reducers/views"
import 'whatwg-fetch'
import * as hls_views from '../apis/hls_views'

var client_tests = new hls_views.DefaultApi()

export function load(prefix,  accessToken) {
    return {
        types: [
            LOAD,
            LOAD_SUCCESS,
            LOAD_FAIL,
        ],
        payload: {
            promise: client_tests.viewsGet({ prefix },{
                headers: {
                    "Authorization": accessToken
                }
            }).then((res) => {
                return res
            }),
        },
    }
}

export function loadView(name, accessToken) {
    return {
        types: [
            VIEW_LOAD,
            VIEW_LOAD_SUCCESS,
            VIEW_LOAD_FAIL,
        ],
        payload: {
            promise: client_tests.viewGet({
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

export function saveView(view, accessToken) {
    return {
        types: [
            VIEW_SAVE,
            VIEW_SAVE_SUCCESS,
            VIEW_SAVE_FAIL,
        ],
        payload: {
            promise: client_tests.viewPut({
                view
            },{
                headers: {
                    "Authorization": accessToken
                }
            }).then((res) => {
                return view
            }),
        },
    }
}

export function deleteView(name, accessToken) {
    return {
        types: [
            VIEW_DELETE,
            VIEW_DELETE_SUCCESS,
            VIEW_DELETE_FAIL,
        ],
        payload: {
            promise: client_tests.viewDelete({
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