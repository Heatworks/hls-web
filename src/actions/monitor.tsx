import { OPEN, START, CLOSE, STOP, CLIENT_LOADING, CLIENT_LOADED, CLIENT_FAILED, NEW_MONITORED_VALUE } from "../reducers/monitor"
import 'whatwg-fetch'
import { Client, connect } from "mqtt"
import { disconnect } from "cluster";

export function open() {
    return {
        type: OPEN
    }
}

export function start(organization:string, device: string, channel:string) {
    return {
        type: START,
        organization,
        device,
        channel
    }
}

export function close() {
    return {
        type: CLOSE
    }
}

export function stop(organization:string, device:string, channel: string) {
    return {
        type: STOP,
        organization,
        device,
        channel
    }
}

export function newMonitoredValue(topic: string, value: any) {
    var parts = topic.split("/devices/")
    var organization = parts[0].substr('/organizations/'.length)
    var deviceParts = parts[1].split("/")
    var channel = deviceParts.pop()
    var device = deviceParts.join("/")
    console.log(`${organization}/${device}/${channel}`)
    return {
        type: NEW_MONITORED_VALUE,
        organization,
        device,
        channel,
        value
    }
}

export function loadedClient(client) {
    return {
        type: CLIENT_LOADED,
        client
    }
}
export function loadingClientError(error) {
    return {
        type: CLIENT_FAILED,
        error
    }
}

export function reloadClient(accessToken) {
    return (dispatch) => {
        dispatch(loadClient(accessToken));
    }
}

export function getMQTTBrokerHostname () {
    return window.localStorage.getItem("hls.mqtt_broker") || "hls-local-server.local"
}

export function loadClient(accessToken) {
    return (dispatch) => {
        dispatch({
            type: CLIENT_LOADING
        })
        console.log('actions:monitor:loadClient');
        try {
            var client = connect(`ws://${getMQTTBrokerHostname()}:1884`, {
                username: 'HLS:AccessToken',
                password: accessToken,
                reconnectPeriod: 1000 * 5
            })
            client.on("error", (error) => {
                console.log('actions:monitor:loadClient:onError');
                console.error(error);
                dispatch(loadingClientError(error))
            })
            client.on("connect", () => {
                dispatch(loadedClient(client))
            })
            client.on("offline", () => {
                console.log('actions:monitor:loadClient:offline');
                dispatch(loadingClientError("MQTT Broker is offline."))
            })
        } catch (error) {
            console.log('actions:monitor:loadClient:Error!');
            console.error(error);
            dispatch(loadingClientError(error))
        }
        
    }
}