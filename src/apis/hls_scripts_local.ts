import { getMQTTBrokerHostname } from '../actions/monitor'

export class DefaultApi {
    scriptStart(script, environment, extraVariables) {
        let header = new Headers({
            'Access-Control-Allow-Origin':'*',
            'Content-Type': 'application/json'
        });
        // TODO: Use a library.
        var url = `http://${getMQTTBrokerHostname()}/scripts/Start?name=${script}&environment=${environment}&${Object.keys(extraVariables).map((key) => {return `${key}=${extraVariables[key]}`}).join("&")}`;

        return fetch(url, {
            method: 'GET',
            mode: "cors",
            headers: header
        }).then((response) => {
            console.log("Got response!");
            return response.json();
        }).then((data) => {
            return data['message'];
        })
    }

    scriptStatus(script, environment) {
        let header = new Headers({
            'Access-Control-Allow-Origin':'*'
        });
        return fetch(`http://${getMQTTBrokerHostname()}/scripts/Status?name=${script}&environment=${environment}`, {
            method: 'GET',
            headers: header
        }).then((response) => {
            return response.json();
        }).then((data) => {
            return data['status']
        })
    }

    scriptStop(script, environment) {
        let header = new Headers({
            'Access-Control-Allow-Origin':'*'
        });
        return fetch(`http://${getMQTTBrokerHostname()}/scripts/Stop?name=${script}&environment=${environment}`, {
            method: 'GET',
            mode: "cors",
            headers: header
        }).then((response) => {
            return response.json();
        }).then((data) => {
            return data['message']
        })
    }
}

