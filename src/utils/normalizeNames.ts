
export function normalizeName(name:string, output:"local"|"hls"|"urn", organizationName?:string, serviceName?:string) {
    if (name.indexOf("urn:") == 0) {
        /** urn:x-hls:/organizations/heatworks/tests/model-1x/flowcycling/1 */
        if (output == "urn") {
            return name;
        }
        var hls = name.substr('urn:x-hls:'.length)
        if (output == "hls") {
            return hls
        }
        if (output == "local") {
            return localFromHLS(hls)
        }
    }

    if (name.indexOf("/organizations/") == 0) {
        /** /organizations/heatworks/tests/model-1x/flowcycling/1 */
        if (output == "urn") {
            return `urn:x-hls:${name}`
        }
        if (output == "hls") {
            return name
        }
        if (output == "local") {
            return localFromHLS(name)
        }
    }

    if (name.substr(0,1) !== "/") {
        /** model-1x/flowcycling/1 */
        if (output == "urn") {
            return `urn:x-hls:/organizations/${organizationName}/${serviceName}/${name}`
        }
        if (output == "hls") {
            return `/organizations/${organizationName}/${serviceName}/${name}`
        }
        if (output == "local") {
            return name
        }
    }
}

function localFromHLS(hls:string) {
    var local_parts = hls.split("/")
    local_parts.splice(0, 4)
    return local_parts.join("/")
}