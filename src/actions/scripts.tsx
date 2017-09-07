import { LOAD, LOAD_FAIL, LOAD_SUCCESS, SCRIPT_LOAD, SCRIPT_LOAD_FAIL, SCRIPT_LOAD_SUCCESS, SCRIPT_SAVE, SCRIPT_SAVE_FAIL, SCRIPT_SAVE_SUCCESS, SCRIPT_DELETE, SCRIPT_DELETE_FAIL, SCRIPT_DELETE_SUCCESS, SCRIPT_FILE_LOAD, SCRIPT_FILE_LOAD_FAIL, SCRIPT_FILE_LOAD_SUCCESS } from "../reducers/scripts"
import 'whatwg-fetch'
import * as hls_scripts from '../apis/hls_scripts'

var client_tests = new hls_scripts.DefaultApi()

export function load(prefix,  accessToken) {
    return {
        types: [
            LOAD,
            LOAD_SUCCESS,
            LOAD_FAIL,
        ],
        payload: {
            promise: client_tests.scriptsGet({ prefix },{
                headers: {
                    "Authorization": accessToken
                }
            }).then((res) => {
                return res
            }),
        },
    }
}

export function loadScript(name, accessToken) {
    return {
        types: [
            SCRIPT_LOAD,
            SCRIPT_LOAD_SUCCESS,
            SCRIPT_LOAD_FAIL,
        ],
        payload: {
            promise: client_tests.scriptGet({
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

export function saveScript(script, accessToken) {
    /*return {
        types: [
            SCRIPT_SAVE,
            SCRIPT_SAVE_SUCCESS,
            SCRIPT_SAVE_FAIL,
        ],
        payload: {
            promise: client_tests.scriptPut({
                script
            },{
                headers: {
                    "Authorization": accessToken
                }
            }).then((res) => {
                return script
            }),
        },
    }*/
}
/*
export function deleteScript(name, accessToken) {
    return {
        types: [
            SCRIPTDELETE,
            SCRIPT_DELETE_SUCCESS,
            SCRIPT_DELETE_FAIL,
        ],
        payload: {
            promise: client_tests.scriptDelete({
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
}*/

export function loadFile(script, file,  accessToken) {
    return {
        types: [
            SCRIPT_FILE_LOAD,
            SCRIPT_FILE_LOAD_SUCCESS,
            SCRIPT_FILE_LOAD_FAIL,
        ],
        payload: {
            promise: client_tests.fileGet({ script, file },{
                headers: {
                    "Authorization": accessToken
                }
            }).then((res) => {
                return fetch(res.url)
            }).then((res) => {
                return res.text()
            }).then((contents) => {
                return {
                    contents,
                    script,
                    file
                }
            }),
        },
    }
}
