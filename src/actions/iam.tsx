import { LOAD, LOAD_FAIL, LOAD_SUCCESS, ORGANIZATION_LOAD, ORGANIZATION_LOAD_FAIL, ORGANIZATION_LOAD_SUCCESS, SIGN_OUT, USERS_LOAD, USERS_LOAD_FAIL, USERS_LOAD_SUCCESS, ACCESS_TOKENS_LOAD, ACCESS_TOKENS_LOAD_FAIL, ACCESS_TOKENS_LOAD_SUCCESS, ACCESS_TOKENS_DELETE, ACCESS_TOKENS_DELETE_FAIL, ACCESS_TOKENS_DELETE_SUCCESS } from "../reducers/iam"
import 'whatwg-fetch'
import { getAllParams, normalizeTokenKeys } from "../utils/parse-url";
import { loadClient } from "./monitor"

import * as IAM from '../apis/hls_iam'
import { loadDevices } from "./dac";
import { Dispatch } from "../../node_modules/@types/react-redux";

function signInLoading() {
	return {
		type: LOAD
	}
}
function signInSuccess(params) {
	return {
		type: LOAD_SUCCESS,
		payload: params
	}
}
function signInFail(error) {
	return {
		type: LOAD_FAIL,
		error
	}
}

function loadingOrganization() {
	return {
		type: ORGANIZATION_LOAD
	}
}

function loadOrganizationSuccess(payload) {
	return {
		type: ORGANIZATION_LOAD_SUCCESS,
		payload
	}
}

function loadOrganizationFailed(error) {
	return {
		type: ORGANIZATION_LOAD_FAIL,
		error
	}
}

function signedOut() {
	return {
		type: SIGN_OUT
	}
}

export function loadPersistantData() {
	return (dispatch) => {
		console.log('actions:iam:loadingPersistantData...');
		var data = retrieveData();
		if (data) {
			console.log('actions:iam:isSignedIn');
			dispatch(signInLoading());
			dispatch(signInSuccess(data));
			dispatch(loadOrganization(data['accessToken']));
			dispatch(loadClient(data['accessToken']))
		} else {
			console.log('actions:iam:isNotSignedIn');
		}
	}
}

export function signIn() {
	return (dispatch) => {
		console.log('actions:iam:signIn');
		dispatch(signInLoading())
		let name = "_blank";
		let popup = openPopup("hls", `https://hls-oauth.heatworks.tech/login?redirect_uri=${window.location.origin}/signIn_redirect`, "hls_oauth");
		return listenForCredentials("code", popup, "hls").then((params) => {
			console.log('actions:iam:signIn:Received Credentials.');
			dispatch(signInSuccess(params))
			dispatch(loadOrganization(params['accessToken']))
			dispatch(loadClient(params['accessToken']))
			dispatch(loadDevices('', params['accessToken'], ''))
		}).catch((error) => {
			console.log('actions:iam:signIn:Error!');
			console.error(error);
			dispatch(signInFail(error))
		})
	}
}

export function signOut() {
	return (dispatch) => {
		clearData();
		dispatch(signedOut())
	}
}

export function loadOrganization(accessToken) {
	return (dispatch) => {
		console.log('actions:iam:loadOrganization');
		dispatch(loadingOrganization())
		var api = new IAM.DefaultApi()
		api.accessTokenGet({
			accessToken
		}, {
			headers: {
				"Authorization": accessToken
			}
		}).then((tokenData) => {
			dispatch(loadOrganizationSuccess(tokenData))
		}).catch((error) => {
			dispatch(loadOrganizationFailed(error));
		})
	}
}

export function loadUsers(accessToken) {
	var api = new IAM.DefaultApi()
    return {
        types: [
            USERS_LOAD,
            USERS_LOAD_SUCCESS,
            USERS_LOAD_FAIL,
        ],
        payload: {
            promise: api.usersGet({}, {
				headers: {
					"Authorization": accessToken
				}
			}),
        },
    }
}

export function loadAccessTokens(accessToken) {
	var api = new IAM.DefaultApi()
    return {
        types: [
            ACCESS_TOKENS_LOAD,
            ACCESS_TOKENS_LOAD_SUCCESS,
            ACCESS_TOKENS_LOAD_FAIL,
        ],
        payload: {
            promise: api.accessTokensGet({
				headers: {
					"Authorization": accessToken
				}
			}),
        },
    }
}

export function deleteAccessToken(accessTokenToDelete, accessTokenAuthorization) {
	var api = new IAM.DefaultApi()
    return {
        types: [
            ACCESS_TOKENS_DELETE,
            ACCESS_TOKENS_DELETE_SUCCESS,
            ACCESS_TOKENS_DELETE_FAIL,
        ],
        payload: {
			promise: api.accessTokenDelete({"accessToken": accessTokenToDelete}, {
				headers: {
					"Authorization": accessTokenAuthorization
				}
			}),
        },
    }
}

const DATA_KEY = 'hls.persist'

function clearData() {
	window.localStorage.removeItem(DATA_KEY);
}

function persistData (data) {
	var val = JSON.stringify(data);

	window.localStorage.setItem(DATA_KEY, val);
};

const queryString = require('query-string');
function retrieveData () {
	var val = window.localStorage.getItem(DATA_KEY);
	if (val == null) {
		var params = queryString.parse(window.location.search)
		if ('accessToken' in params) {
			var data = { accessToken: params.accessToken };
			persistData(data);
			return data
		}
	}
	return JSON.parse(val);
}


function listenForCredentials (endpointKey, popup, provider, resolve?, reject?) {
	if (!resolve) {
		return new Promise((resolve, reject) => {
			listenForCredentials(endpointKey, popup, provider, resolve, reject);
		});

	} else {
			console.log('listening for credentials...');
		let creds;

		try {
			creds = getAllParams(popup.location);
		} catch (err) {}

		if (creds) {
			console.log('Got some sort of creds');
			console.log(creds);
		}
		if (creds && endpointKey in creds) {
			popup.close();
			console.log('Found credentials!');
			console.log(creds);
			var iamData = normalizeTokenKeys(creds);
			persistData(iamData);
			resolve(iamData)
			//persistData("Authentication", normalizeTokenKeys(creds));
			/*fetch(getTokenValidationPath(endpointKey))
				.then(parseResponse)
				.then(({data}) => resolve(data))
				.catch(({errors}) => reject({errors}));*/
		} else if (popup.closed) {
			reject({errors: "Authentication was cancelled."})
		} else {
			setTimeout(() => {
				listenForCredentials(endpointKey, popup, provider, resolve, reject);
			}, 100);
		}
	}
}


/* istanbul ignore next */
var settings = "scrollbars=no,toolbar=no,location=no,titlebar=no,directories=no,status=no,menubar=no";

/* istanbul ignore next */
function getPopupOffset({width, height}) {
	var wLeft = window.screenLeft ? window.screenLeft : window.screenX;
	var wTop = window.screenTop ? window.screenTop : window.screenY;

	var left = wLeft + (window.innerWidth / 2) - (width / 2);
	var top = wTop + (window.innerHeight / 2) - (height / 2);

	return {top, left};
}

/* istanbul ignore next */
function getPopupSize(provider) {
	switch (provider) {
		case "facebook":
			return {width: 580, height: 400};

		case "google":
			return {width: 452, height: 633};

		case "github":
			return {width: 1020, height: 618};

		case "linkedin":
			return {width: 527, height: 582};

		case "twitter":
			return {width: 495, height: 645};

		case "live":
			return {width: 500, height: 560};

		case "yahoo":
			return {width: 559, height: 519};

		default:
			return {width: 1020, height: 618};
	}
}

/* istanbul ignore next */
function getPopupDimensions(provider) {
	let {width, height} = getPopupSize(provider);
	let {top, left} = getPopupOffset({width, height});

	return `width=${width},height=${height},top=${top},left=${left}`;
}

/* istanbul ignore next */
function openPopup(provider, url, name) {
	return window.open(url, name, `${settings},${getPopupDimensions(provider)}`)
}