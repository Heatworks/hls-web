import { LOAD, LOAD_FAIL, LOAD_SUCCESS } from "../reducers/data"
import 'whatwg-fetch'

export function load() {
    return {
        types: [
            LOAD,
            LOAD_SUCCESS,
            LOAD_FAIL,
        ],
        payload: {
            promise: fetch('/api/data',{
                headers: {
                    "Authorization": '50jz4hm2hfi0fbg1fxgnivjcqfnlxvw32h0yx4if14xnacxdhc'
                }
            }).then((res) => {
                return res.json();
            }),
        },
    }
}