import * as React from 'react'
const UNIT_KEY = "TEMPERATURE_UNIT"

export function useCelcius(){
    window.localStorage.setItem(UNIT_KEY, "C");
}

export function useFarenheit() {
    window.localStorage.setItem(UNIT_KEY, "F");
}

export function toggleTemperatureUnit() {
    if (getTemperatureUnit() == "C") {
        useFarenheit()
    } else {
        useCelcius()
    }
}

export function getTemperatureUnit(){
    return window.localStorage.getItem(UNIT_KEY);
}

const UNITS_NAMESPACE = "hls.units."

function itemForDeviceAndChannel(device, channel) {
    return UNITS_NAMESPACE+device+"/"+channel
}

function itemForTopic(topic){
    return UNITS_NAMESPACE+topic
}

export function setUnitForDeviceAndChannel(device, channel, unit) {
    window.localStorage.setItem(itemForDeviceAndChannel(device, channel), unit);
}

export function getUnitForDeviceAndChannel(device, channel) {
    return window.localStorage.getItem(itemForDeviceAndChannel(device, channel));
}

export function getUnitForTopic(topic) {
    return window.localStorage.getItem(itemForTopic(topic))
}

const unitStyle:React.CSSProperties = {
    fontWeight:'bold',
    fontSize: 12,
    verticalAlign: 'text-top'
}

export function valueWithUnit(value, unit) {
    if (unit == "Celcius") {
        return valueForTemperature(value);
    } if (unit == "String") {
        return value;
    } if (unit == "Boolean") {
        return (parseInt(value) == 1)
    } if (unit == "GPM") {
        return (<span>{value}<span style={unitStyle}>gpm</span></span>)
    } if (unit == "Amps") {
        if (Math.abs(value) < 1.0) {
            value = (Math.round(value * 10000) / 10);
            return (<span>{value}<span style={unitStyle}>mA</span></span>);
        }
        return (<span>{value}<span style={unitStyle}>A</span></span>);
    } else {
        if (value == null) {
            value = '-'
        }
        if (unit == null) {
            return value;
        }
        return value + " (" + unit + ")";
    }
}

function valueForTemperature(value) {    
    if (getTemperatureUnit() == "F") {
        if (value == null) {
            value = '-'
        } else {
            value = (Math.round(((value * 9/5) + 32) * 100)/100);
        }
        return (<span>{value}<span style={unitStyle}>{UnitLabels.Fahrenheit}</span></span>)
    } else {
        value = (Math.round(value * 100)/100);
        return (<span>{value}<span style={unitStyle}>{UnitLabels.Celcius}</span></span>)
    }
}

export const UnitLabels = {
    Fahrenheit:'℉',
    Celcius:'℃'
}