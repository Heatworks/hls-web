const UNIT_KEY = "TEMPERATURE_UNIT"

export function useCelcius(){
    window.localStorage.setItem(UNIT_KEY, "C");
}

export function useFarenheit() {
    window.localStorage.setItem(UNIT_KEY, "F");
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

export function valueWithUnit(value, unit) {
    if (unit == "Celcius") {
        return valueForTemperature(value);
    } else {
        return value + " (" + unit + ")";
    }
}

function valueForTemperature(value) {
    if (getTemperatureUnit() == "F") {
        return ((value * 9/5) + 32) + UnitLabels.Fahrenheit
    } else {
        return value + UnitLabels.Celcius
    }
}

export const UnitLabels = {
    Fahrenheit:'℉',
    Celcius:'℃'
}