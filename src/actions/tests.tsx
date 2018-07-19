import { LOAD, LOAD_FAIL, LOAD_SUCCESS, TEST_LOAD, TEST_LOAD_FAIL, TEST_LOAD_SUCCESS, TEST_SAVE, TEST_SAVE_FAIL, TEST_SAVE_SUCCESS, TEST_DELETE, TEST_DELETE_FAIL, TEST_DELETE_SUCCESS, LOAD_PREFIXES, LOAD_PREFIXES_FAIL, LOAD_PREFIXES_SUCCESS,  } from "../reducers/tests"
import 'whatwg-fetch'
import * as hls_tests from '../apis/hls_tests'

var client_tests = new hls_tests.DefaultApi()

export function load(prefix, accessToken) {
    return {
        types: [
            LOAD,
            LOAD_SUCCESS,
            LOAD_FAIL,
        ],
        payload: {
            promise: client_tests.testsGet({ prefix, exclusiveStartKey:'', limit: "200" },{
                headers: {
                    "Authorization": accessToken
                }
            }).then((res) => {
                return res
            }),
        },
    }
}

export function loadTest(name, accessToken) {
    return {
        types: [
            TEST_LOAD,
            TEST_LOAD_SUCCESS,
            TEST_LOAD_FAIL,
        ],
        payload: {
            promise: client_tests.testGet({
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

export function saveTest(test, accessToken) {
    return {
        types: [
            TEST_SAVE,
            TEST_SAVE_SUCCESS,
            TEST_SAVE_FAIL,
        ],
        payload: {
            promise: client_tests.testPut({
                test
            },{
                headers: {
                    "Authorization": accessToken
                }
            }).then((res) => {
                return test
            }),
        },
    }
}

export function deleteTest(name, accessToken) {
    return {
        types: [
            TEST_DELETE,
            TEST_DELETE_SUCCESS,
            TEST_DELETE_FAIL,
        ],
        payload: {
            promise: client_tests.testDelete({
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

export function loadPrefixes(prefix, accessToken) {
    console.log('loadPrefixes: '+prefix);
    return {
        types: [
            LOAD_PREFIXES,
            LOAD_PREFIXES_SUCCESS,
            LOAD_PREFIXES_FAIL,
        ],
        payload: {
            promise: client_tests.prefixesGet({ prefix },{
                headers: {
                    "Authorization": accessToken
                }
            }).then((res) => {
                return res
            }),
        },
    }
}