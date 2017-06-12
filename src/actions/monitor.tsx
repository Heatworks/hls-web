import { OPEN, START, CLOSE, STOP, CLIENT_LOADED, CLIENT_FAILED, NEW_MONITORED_VALUE } from "../reducers/monitor"
import 'whatwg-fetch'
import { Client, connect } from "mqtt"

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

export function getMQTTBrokerHostname () {
    return window.localStorage.getItem("hls.mqtt_broker") || "hls-local-server.local"
}

export function loadClient(accessToken) {
    return (dispatch) => {
        try {
            var client = connect(`ws://${getMQTTBrokerHostname()}:1884`, {
                username: 'HLS:AccessToken',
                password: accessToken,
                reconnectPeriod: 1000 * 5
            })
            client.on("error", (error) => {
                console.log(error);
                dispatch(loadingClientError(error.message))
            })
            client.on("connect", () => {
                dispatch(loadedClient(client))
            })
        } catch (error) {
            dispatch(loadingClientError(error))
        }
        
    }
}