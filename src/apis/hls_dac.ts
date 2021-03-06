/**
 * HLS - DAC (Data Acquisition and Control)
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: 2017-10-09T20:58:24Z
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */

import * as querystring from "querystring";
import * as url from "url";

var isomorphicFetch = require("isomorphic-fetch");
var assign = require("core-js/library/fn/object/assign");

interface Dictionary<T> { [index: string]: T; }
export interface FetchAPI { (url: string, init?: any): Promise<any>; }

const BASE_PATH = "https://gtxrcsoql2.execute-api.us-east-1.amazonaws.com/pre_alpha".replace(/\/+$/, "");

export interface FetchArgs {
    url: string;
    options: any;
}

export class BaseAPI {
    basePath: string;
    fetch: FetchAPI;

    constructor(fetch: FetchAPI = isomorphicFetch, basePath: string = BASE_PATH) {
        this.basePath = basePath;
        this.fetch = fetch;
    }
};

export interface Data extends Array<Datum> {
}

export interface Datum {
    "organizationid"?: string;
    "device"?: string;
    "channel"?: string;
    "occurred": number;
    "valueFloat"?: number;
    "valueInt"?: number;
    "valueString"?: string;
}

export interface Device {
    "name"?: string;
    "description"?: string;
    "tags"?: any;
    "channels"?: any;
}

export interface Empty {
}

export interface ModelError {
    "message"?: string;
}



/**
 * DefaultApi - fetch parameter creator
 */
export const DefaultApiFetchParamCreator = {
    /**
     * 
     * @param endTime 
     * @param limit 
     * @param channel 
     * @param startTime 
     */
    dataGet(params: {  "endTime"?: string; "limit"?: number; "channel"?: string; "startTime"?: string; }, options?: any): FetchArgs {
        const baseUrl = `/Data`;
        let urlObj = url.parse(baseUrl, true);
        urlObj.query = assign({}, urlObj.query, {
            "endTime": params["endTime"],
            "limit": params["limit"],
            "channel": params["channel"],
            "startTime": params["startTime"],
        });
        let fetchOptions: RequestInit = assign({}, { method: "GET" }, options);

        let contentTypeHeader: Dictionary<string> = {};
        if (contentTypeHeader) {
            fetchOptions.headers = assign({}, contentTypeHeader, fetchOptions.headers);
        }
        return {
            url: url.format(urlObj),
            options: fetchOptions,
        };
    },
    /**
     * 
     */
    dataOptions(options?: any): FetchArgs {
        const baseUrl = `/Data`;
        let urlObj = url.parse(baseUrl, true);
        let fetchOptions: RequestInit = assign({}, { method: "OPTIONS" }, options);

        let contentTypeHeader: Dictionary<string> = {};
        if (contentTypeHeader) {
            fetchOptions.headers = assign({}, contentTypeHeader, fetchOptions.headers);
        }
        return {
            url: url.format(urlObj),
            options: fetchOptions,
        };
    },
    /**
     * 
     * @param empty 
     * @param contentType 
     * @param organizationId 
     * @param file 
     */
    dataPut(params: {  "empty": Empty; "contentType"?: string; "organizationId"?: string; "file"?: string; }, options?: any): FetchArgs {
        // verify required parameter "empty" is set
        if (params["empty"] == null) {
            throw new Error("Missing required parameter empty when calling dataPut");
        }
        const baseUrl = `/Data`;
        let urlObj = url.parse(baseUrl, true);
        urlObj.query = assign({}, urlObj.query, {
            "organizationId": params["organizationId"],
            "file": params["file"],
        });
        let fetchOptions: RequestInit = assign({}, { method: "PUT" }, options);

        let contentTypeHeader: Dictionary<string> = {};
        contentTypeHeader = { "Content-Type": "application/json" };
        if (params["empty"]) {
            fetchOptions.body = JSON.stringify(params["empty"] || {});
        }
        fetchOptions.headers = assign({
            "Content-Type": params["contentType"],
        }, contentTypeHeader, fetchOptions.headers);
        return {
            url: url.format(urlObj),
            options: fetchOptions,
        };
    },
    /**
     * 
     */
    deviceDelete(options?: any): FetchArgs {
        const baseUrl = `/Device`;
        let urlObj = url.parse(baseUrl, true);
        let fetchOptions: RequestInit = assign({}, { method: "DELETE" }, options);

        let contentTypeHeader: Dictionary<string> = {};
        if (contentTypeHeader) {
            fetchOptions.headers = assign({}, contentTypeHeader, fetchOptions.headers);
        }
        return {
            url: url.format(urlObj),
            options: fetchOptions,
        };
    },
    /**
     * 
     * @param name 
     */
    deviceGet(params: {  "name"?: string; }, options?: any): FetchArgs {
        const baseUrl = `/Device`;
        let urlObj = url.parse(baseUrl, true);
        urlObj.query = assign({}, urlObj.query, {
            "name": params["name"],
        });
        let fetchOptions: RequestInit = assign({}, { method: "GET" }, options);

        let contentTypeHeader: Dictionary<string> = {};
        if (contentTypeHeader) {
            fetchOptions.headers = assign({}, contentTypeHeader, fetchOptions.headers);
        }
        return {
            url: url.format(urlObj),
            options: fetchOptions,
        };
    },
    /**
     * 
     */
    deviceOptions(options?: any): FetchArgs {
        const baseUrl = `/Device`;
        let urlObj = url.parse(baseUrl, true);
        let fetchOptions: RequestInit = assign({}, { method: "OPTIONS" }, options);

        let contentTypeHeader: Dictionary<string> = {};
        if (contentTypeHeader) {
            fetchOptions.headers = assign({}, contentTypeHeader, fetchOptions.headers);
        }
        return {
            url: url.format(urlObj),
            options: fetchOptions,
        };
    },
    /**
     * 
     */
    devicePost(options?: any): FetchArgs {
        const baseUrl = `/Device`;
        let urlObj = url.parse(baseUrl, true);
        let fetchOptions: RequestInit = assign({}, { method: "POST" }, options);

        let contentTypeHeader: Dictionary<string> = {};
        if (contentTypeHeader) {
            fetchOptions.headers = assign({}, contentTypeHeader, fetchOptions.headers);
        }
        return {
            url: url.format(urlObj),
            options: fetchOptions,
        };
    },
    /**
     * 
     * @param device 
     */
    devicePut(params: {  "device": Device; }, options?: any): FetchArgs {
        // verify required parameter "device" is set
        if (params["device"] == null) {
            throw new Error("Missing required parameter device when calling devicePut");
        }
        const baseUrl = `/Device`;
        let urlObj = url.parse(baseUrl, true);
        let fetchOptions: RequestInit = assign({}, { method: "PUT" }, options);

        let contentTypeHeader: Dictionary<string> = {};
        contentTypeHeader = { "Content-Type": "application/json" };
        if (params["device"]) {
            fetchOptions.body = JSON.stringify(params["device"] || {});
        }
        if (contentTypeHeader) {
            fetchOptions.headers = assign({}, contentTypeHeader, fetchOptions.headers);
        }
        return {
            url: url.format(urlObj),
            options: fetchOptions,
        };
    },
    /**
     * 
     * @param exclusiveStartKey 
     * @param limit 
     * @param prefix 
     * @param tags 
     */
    devicesGet(params: {  "exclusiveStartKey"?: string; "limit"?: string; "prefix"?: string; "tags"?: string; }, options?: any): FetchArgs {
        const baseUrl = `/Devices`;
        let urlObj = url.parse(baseUrl, true);
        urlObj.query = assign({}, urlObj.query, {
            "limit": params["limit"],
            "prefix": params["prefix"],
            "tags": params["tags"],
        });
        let fetchOptions: RequestInit = assign({}, { method: "GET" }, options);

        let contentTypeHeader: Dictionary<string> = {};
        fetchOptions.headers = assign({
            "ExclusiveStartKey": params["exclusiveStartKey"],
        }, contentTypeHeader, fetchOptions.headers);
        return {
            url: url.format(urlObj),
            options: fetchOptions,
        };
    },
    /**
     * 
     */
    devicesOptions(options?: any): FetchArgs {
        const baseUrl = `/Devices`;
        let urlObj = url.parse(baseUrl, true);
        let fetchOptions: RequestInit = assign({}, { method: "OPTIONS" }, options);

        let contentTypeHeader: Dictionary<string> = {};
        if (contentTypeHeader) {
            fetchOptions.headers = assign({}, contentTypeHeader, fetchOptions.headers);
        }
        return {
            url: url.format(urlObj),
            options: fetchOptions,
        };
    },
    /**
     * 
     * @param key 
     */
    imageGet(params: {  "key"?: string; }, options?: any): FetchArgs {
        const baseUrl = `/Image`;
        let urlObj = url.parse(baseUrl, true);
        urlObj.query = assign({}, urlObj.query, {
            "key": params["key"],
        });
        let fetchOptions: RequestInit = assign({}, { method: "GET" }, options);

        let contentTypeHeader: Dictionary<string> = {};
        if (contentTypeHeader) {
            fetchOptions.headers = assign({}, contentTypeHeader, fetchOptions.headers);
        }
        return {
            url: url.format(urlObj),
            options: fetchOptions,
        };
    },
    /**
     * 
     */
    imageOptions(options?: any): FetchArgs {
        const baseUrl = `/Image`;
        let urlObj = url.parse(baseUrl, true);
        let fetchOptions: RequestInit = assign({}, { method: "OPTIONS" }, options);

        let contentTypeHeader: Dictionary<string> = {};
        if (contentTypeHeader) {
            fetchOptions.headers = assign({}, contentTypeHeader, fetchOptions.headers);
        }
        return {
            url: url.format(urlObj),
            options: fetchOptions,
        };
    },
};

/**
 * DefaultApi - functional programming interface
 */
export const DefaultApiFp = {
    /**
     * 
     * @param endTime 
     * @param limit 
     * @param channel 
     * @param startTime 
     */
    dataGet(params: { "endTime"?: string; "limit"?: number; "channel"?: string; "startTime"?: string;  }, options?: any): (fetch?: FetchAPI, basePath?: string) => Promise<Data> {
        const fetchArgs = DefaultApiFetchParamCreator.dataGet(params, options);
        return (fetch: FetchAPI = isomorphicFetch, basePath: string = BASE_PATH) => {
            return fetch(basePath + fetchArgs.url, fetchArgs.options).then((response) => {
                if (response.status >= 200 && response.status < 300) {
                    return response.json();
                } else {
                    throw response;
                }
            });
        };
    },
    /**
     * 
     */
    dataOptions(options?: any): (fetch?: FetchAPI, basePath?: string) => Promise<Empty> {
        const fetchArgs = DefaultApiFetchParamCreator.dataOptions(options);
        return (fetch: FetchAPI = isomorphicFetch, basePath: string = BASE_PATH) => {
            return fetch(basePath + fetchArgs.url, fetchArgs.options).then((response) => {
                if (response.status >= 200 && response.status < 300) {
                    return response.json();
                } else {
                    throw response;
                }
            });
        };
    },
    /**
     * 
     * @param empty 
     * @param contentType 
     * @param organizationId 
     * @param file 
     */
    dataPut(params: { "empty": Empty; "contentType"?: string; "organizationId"?: string; "file"?: string;  }, options?: any): (fetch?: FetchAPI, basePath?: string) => Promise<Empty> {
        const fetchArgs = DefaultApiFetchParamCreator.dataPut(params, options);
        return (fetch: FetchAPI = isomorphicFetch, basePath: string = BASE_PATH) => {
            return fetch(basePath + fetchArgs.url, fetchArgs.options).then((response) => {
                if (response.status >= 200 && response.status < 300) {
                    return response.json();
                } else {
                    throw response;
                }
            });
        };
    },
    /**
     * 
     */
    deviceDelete(options?: any): (fetch?: FetchAPI, basePath?: string) => Promise<Empty> {
        const fetchArgs = DefaultApiFetchParamCreator.deviceDelete(options);
        return (fetch: FetchAPI = isomorphicFetch, basePath: string = BASE_PATH) => {
            return fetch(basePath + fetchArgs.url, fetchArgs.options).then((response) => {
                if (response.status >= 200 && response.status < 300) {
                    return response.json();
                } else {
                    throw response;
                }
            });
        };
    },
    /**
     * 
     * @param name 
     */
    deviceGet(params: { "name"?: string;  }, options?: any): (fetch?: FetchAPI, basePath?: string) => Promise<Device> {
        const fetchArgs = DefaultApiFetchParamCreator.deviceGet(params, options);
        return (fetch: FetchAPI = isomorphicFetch, basePath: string = BASE_PATH) => {
            return fetch(basePath + fetchArgs.url, fetchArgs.options).then((response) => {
                if (response.status >= 200 && response.status < 300) {
                    return response.json();
                } else {
                    throw response;
                }
            });
        };
    },
    /**
     * 
     */
    deviceOptions(options?: any): (fetch?: FetchAPI, basePath?: string) => Promise<Empty> {
        const fetchArgs = DefaultApiFetchParamCreator.deviceOptions(options);
        return (fetch: FetchAPI = isomorphicFetch, basePath: string = BASE_PATH) => {
            return fetch(basePath + fetchArgs.url, fetchArgs.options).then((response) => {
                if (response.status >= 200 && response.status < 300) {
                    return response.json();
                } else {
                    throw response;
                }
            });
        };
    },
    /**
     * 
     */
    devicePost(options?: any): (fetch?: FetchAPI, basePath?: string) => Promise<Empty> {
        const fetchArgs = DefaultApiFetchParamCreator.devicePost(options);
        return (fetch: FetchAPI = isomorphicFetch, basePath: string = BASE_PATH) => {
            return fetch(basePath + fetchArgs.url, fetchArgs.options).then((response) => {
                if (response.status >= 200 && response.status < 300) {
                    return response.json();
                } else {
                    throw response;
                }
            });
        };
    },
    /**
     * 
     * @param device 
     */
    devicePut(params: { "device": Device;  }, options?: any): (fetch?: FetchAPI, basePath?: string) => Promise<Empty> {
        const fetchArgs = DefaultApiFetchParamCreator.devicePut(params, options);
        return (fetch: FetchAPI = isomorphicFetch, basePath: string = BASE_PATH) => {
            return fetch(basePath + fetchArgs.url, fetchArgs.options).then((response) => {
                if (response.status >= 200 && response.status < 300) {
                    return response.json();
                } else {
                    throw response;
                }
            });
        };
    },
    /**
     * 
     * @param exclusiveStartKey 
     * @param limit 
     * @param prefix 
     * @param tags 
     */
    devicesGet(params: { "exclusiveStartKey"?: string; "limit"?: string; "prefix"?: string; "tags"?: string;  }, options?: any): (fetch?: FetchAPI, basePath?: string) => Promise<Empty> {
        const fetchArgs = DefaultApiFetchParamCreator.devicesGet(params, options);
        return (fetch: FetchAPI = isomorphicFetch, basePath: string = BASE_PATH) => {
            return fetch(basePath + fetchArgs.url, fetchArgs.options).then((response) => {
                if (response.status >= 200 && response.status < 300) {
                    return response.json();
                } else {
                    throw response;
                }
            });
        };
    },
    /**
     * 
     */
    devicesOptions(options?: any): (fetch?: FetchAPI, basePath?: string) => Promise<Empty> {
        const fetchArgs = DefaultApiFetchParamCreator.devicesOptions(options);
        return (fetch: FetchAPI = isomorphicFetch, basePath: string = BASE_PATH) => {
            return fetch(basePath + fetchArgs.url, fetchArgs.options).then((response) => {
                if (response.status >= 200 && response.status < 300) {
                    return response.json();
                } else {
                    throw response;
                }
            });
        };
    },
    /**
     * 
     * @param key 
     */
    imageGet(params: { "key"?: string;  }, options?: any): (fetch?: FetchAPI, basePath?: string) => Promise<Empty> {
        const fetchArgs = DefaultApiFetchParamCreator.imageGet(params, options);
        return (fetch: FetchAPI = isomorphicFetch, basePath: string = BASE_PATH) => {
            return fetch(basePath + fetchArgs.url, fetchArgs.options).then((response) => {
                if (response.status >= 200 && response.status < 300) {
                    return response.json();
                } else {
                    throw response;
                }
            });
        };
    },
    /**
     * 
     */
    imageOptions(options?: any): (fetch?: FetchAPI, basePath?: string) => Promise<Empty> {
        const fetchArgs = DefaultApiFetchParamCreator.imageOptions(options);
        return (fetch: FetchAPI = isomorphicFetch, basePath: string = BASE_PATH) => {
            return fetch(basePath + fetchArgs.url, fetchArgs.options).then((response) => {
                if (response.status >= 200 && response.status < 300) {
                    return response.json();
                } else {
                    throw response;
                }
            });
        };
    },
};

/**
 * DefaultApi - object-oriented interface
 */
export class DefaultApi extends BaseAPI {
    /**
     * 
     * @param endTime 
     * @param limit 
     * @param channel 
     * @param startTime 
     */
    dataGet(params: {  "endTime"?: string; "limit"?: number; "channel"?: string; "startTime"?: string; }, options?: any) {
        return DefaultApiFp.dataGet(params, options)(this.fetch, this.basePath);
    }
    /**
     * 
     */
    dataOptions(options?: any) {
        return DefaultApiFp.dataOptions(options)(this.fetch, this.basePath);
    }
    /**
     * 
     * @param empty 
     * @param contentType 
     * @param organizationId 
     * @param file 
     */
    dataPut(params: {  "empty": Empty; "contentType"?: string; "organizationId"?: string; "file"?: string; }, options?: any) {
        return DefaultApiFp.dataPut(params, options)(this.fetch, this.basePath);
    }
    /**
     * 
     */
    deviceDelete(options?: any) {
        return DefaultApiFp.deviceDelete(options)(this.fetch, this.basePath);
    }
    /**
     * 
     * @param name 
     */
    deviceGet(params: {  "name"?: string; }, options?: any) {
        return DefaultApiFp.deviceGet(params, options)(this.fetch, this.basePath);
    }
    /**
     * 
     */
    deviceOptions(options?: any) {
        return DefaultApiFp.deviceOptions(options)(this.fetch, this.basePath);
    }
    /**
     * 
     */
    devicePost(options?: any) {
        return DefaultApiFp.devicePost(options)(this.fetch, this.basePath);
    }
    /**
     * 
     * @param device 
     */
    devicePut(params: {  "device": Device; }, options?: any) {
        return DefaultApiFp.devicePut(params, options)(this.fetch, this.basePath);
    }
    /**
     * 
     * @param exclusiveStartKey 
     * @param limit 
     * @param prefix 
     * @param tags 
     */
    devicesGet(params: {  "exclusiveStartKey"?: string; "limit"?: string; "prefix"?: string; "tags"?: string; }, options?: any) {
        return DefaultApiFp.devicesGet(params, options)(this.fetch, this.basePath);
    }
    /**
     * 
     */
    devicesOptions(options?: any) {
        return DefaultApiFp.devicesOptions(options)(this.fetch, this.basePath);
    }
    /**
     * 
     * @param key 
     */
    imageGet(params: {  "key"?: string; }, options?: any) {
        return DefaultApiFp.imageGet(params, options)(this.fetch, this.basePath);
    }
    /**
     * 
     */
    imageOptions(options?: any) {
        return DefaultApiFp.imageOptions(options)(this.fetch, this.basePath);
    }
};

/**
 * DefaultApi - factory interface
 */
export const DefaultApiFactory = function (fetch?: FetchAPI, basePath?: string) {
    return {
        /**
         * 
         * @param endTime 
         * @param limit 
         * @param channel 
         * @param startTime 
         */
        dataGet(params: {  "endTime"?: string; "limit"?: number; "channel"?: string; "startTime"?: string; }, options?: any) {
            return DefaultApiFp.dataGet(params, options)(fetch, basePath);
        },
        /**
         * 
         */
        dataOptions(options?: any) {
            return DefaultApiFp.dataOptions(options)(fetch, basePath);
        },
        /**
         * 
         * @param empty 
         * @param contentType 
         * @param organizationId 
         * @param file 
         */
        dataPut(params: {  "empty": Empty; "contentType"?: string; "organizationId"?: string; "file"?: string; }, options?: any) {
            return DefaultApiFp.dataPut(params, options)(fetch, basePath);
        },
        /**
         * 
         */
        deviceDelete(options?: any) {
            return DefaultApiFp.deviceDelete(options)(fetch, basePath);
        },
        /**
         * 
         * @param name 
         */
        deviceGet(params: {  "name"?: string; }, options?: any) {
            return DefaultApiFp.deviceGet(params, options)(fetch, basePath);
        },
        /**
         * 
         */
        deviceOptions(options?: any) {
            return DefaultApiFp.deviceOptions(options)(fetch, basePath);
        },
        /**
         * 
         */
        devicePost(options?: any) {
            return DefaultApiFp.devicePost(options)(fetch, basePath);
        },
        /**
         * 
         * @param device 
         */
        devicePut(params: {  "device": Device; }, options?: any) {
            return DefaultApiFp.devicePut(params, options)(fetch, basePath);
        },
        /**
         * 
         * @param exclusiveStartKey 
         * @param limit 
         * @param prefix 
         * @param tags 
         */
        devicesGet(params: {  "exclusiveStartKey"?: string; "limit"?: string; "prefix"?: string; "tags"?: string; }, options?: any) {
            return DefaultApiFp.devicesGet(params, options)(fetch, basePath);
        },
        /**
         * 
         */
        devicesOptions(options?: any) {
            return DefaultApiFp.devicesOptions(options)(fetch, basePath);
        },
        /**
         * 
         * @param key 
         */
        imageGet(params: {  "key"?: string; }, options?: any) {
            return DefaultApiFp.imageGet(params, options)(fetch, basePath);
        },
        /**
         * 
         */
        imageOptions(options?: any) {
            return DefaultApiFp.imageOptions(options)(fetch, basePath);
        },
    };
};

