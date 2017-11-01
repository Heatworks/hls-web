/**
 * HLS - Views
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: 2017-03-09T18:31:10Z
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

const BASE_PATH = "https://tzaov3esql.execute-api.us-east-1.amazonaws.com/pre_alpha".replace(/\/+$/, "");

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

export interface Empty {
}

export interface View {
    "name": string;
    "description": string;
    "tags"?: any;
    "grid"?: ViewGrid;
}

export interface ViewColumn {
    "width"?: number;
    "widths"?: ViewColumnWidths;
    "component"?: string;
    "props"?: any;
    /**
     * Labeled data channels that relate to the test.
     */
    "channels"?: any;
    "rows"?: Array<ViewRow>;
}

export interface ViewColumnWidths {
    "tablet"?: number;
    "desktop"?: number;
    "mobile"?: number;
    "widescreen"?: number;
}

export interface ViewGrid {
    "rows"?: Array<ViewRow>;
}

export interface ViewRow {
    /**
     * If fluid, widths are not set by individual component widths.
     */
    "fluid": boolean;
    "columns": Array<ViewColumn>;
}

export interface Views extends Array<View> {
}



/**
 * DefaultApi - fetch parameter creator
 */
export const DefaultApiFetchParamCreator = {
    /** 
     * @param name 
     */
    viewDelete(params: {  "name"?: string; }, options?: any): FetchArgs {
        const baseUrl = `/View`;
        let urlObj = url.parse(baseUrl, true);
        urlObj.query = assign({}, urlObj.query, {
            "name": params["name"],
        });
        let fetchOptions: RequestInit = assign({}, { method: "DELETE" }, options);

        let contentTypeHeader: Headers;
        if (contentTypeHeader) {
            fetchOptions.headers = contentTypeHeader;
        }
        return {
            url: url.format(urlObj),
            options: fetchOptions,
        };
    },
    /** 
     * @param name 
     */
    viewGet(params: {  "name"?: string; }, options?: any): FetchArgs {
        const baseUrl = `/View`;
        let urlObj = url.parse(baseUrl, true);
        urlObj.query = assign({}, urlObj.query, {
            "name": params["name"],
        });
        let fetchOptions: RequestInit = assign({}, { method: "GET" }, options);

        let contentTypeHeader: Headers;
        if (contentTypeHeader) {
            fetchOptions.headers = contentTypeHeader;
        }
        return {
            url: url.format(urlObj),
            options: fetchOptions,
        };
    },
    /** 
     */
    viewOptions(options?: any): FetchArgs {
        const baseUrl = `/View`;
        let urlObj = url.parse(baseUrl, true);
        let fetchOptions: RequestInit = assign({}, { method: "OPTIONS" }, options);

        let contentTypeHeader: Headers;
        if (contentTypeHeader) {
            fetchOptions.headers = contentTypeHeader;
        }
        return {
            url: url.format(urlObj),
            options: fetchOptions,
        };
    },
    /** 
     * @param view 
     */
    viewPut(params: {  "view": View; }, options?: any): FetchArgs {
        // verify required parameter "view" is set
        if (params["view"] == null) {
            throw new Error("Missing required parameter view when calling viewPut");
        }
        const baseUrl = `/View`;
        let urlObj = url.parse(baseUrl, true);
        let fetchOptions: RequestInit = assign({}, { method: "PUT" }, options);

        let contentTypeHeader: Headers;
        contentTypeHeader = new Headers();
        contentTypeHeader.append("Content-Type", "application/json");
        if (params["view"]) {
            fetchOptions.body = JSON.stringify(params["view"] || {});
        }
        if (contentTypeHeader) {
            fetchOptions.headers = contentTypeHeader;
        }
        return {
            url: url.format(urlObj),
            options: fetchOptions,
        };
    },
    /** 
     * @param prefix 
     * @param tags 
     */
    viewsGet(params: {  "prefix"?: string; "tags"?: string; }, options?: any): FetchArgs {
        const baseUrl = `/Views`;
        let urlObj = url.parse(baseUrl, true);
        urlObj.query = assign({}, urlObj.query, {
            "prefix": params["prefix"],
            "tags": params["tags"],
        });
        let fetchOptions: RequestInit = assign({}, { method: "GET" }, options);

        let contentTypeHeader: Headers;
        if (contentTypeHeader) {
            fetchOptions.headers = contentTypeHeader;
        }
        return {
            url: url.format(urlObj),
            options: fetchOptions,
        };
    },
    /** 
     */
    viewsOptions(options?: any): FetchArgs {
        const baseUrl = `/Views`;
        let urlObj = url.parse(baseUrl, true);
        let fetchOptions: RequestInit = assign({}, { method: "OPTIONS" }, options);

        let contentTypeHeader: Headers;
        if (contentTypeHeader) {
            fetchOptions.headers = contentTypeHeader;
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
     * @param name 
     */
    viewDelete(params: { "name"?: string;  }, options?: any): (fetch?: FetchAPI, basePath?: string) => Promise<Empty> {
        const fetchArgs = DefaultApiFetchParamCreator.viewDelete(params, options);
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
     * @param name 
     */
    viewGet(params: { "name"?: string;  }, options?: any): (fetch?: FetchAPI, basePath?: string) => Promise<View> {
        const fetchArgs = DefaultApiFetchParamCreator.viewGet(params, options);
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
     */
    viewOptions(options?: any): (fetch?: FetchAPI, basePath?: string) => Promise<Empty> {
        const fetchArgs = DefaultApiFetchParamCreator.viewOptions(options);
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
     * @param view 
     */
    viewPut(params: { "view": View;  }, options?: any): (fetch?: FetchAPI, basePath?: string) => Promise<Empty> {
        const fetchArgs = DefaultApiFetchParamCreator.viewPut(params, options);
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
     * @param prefix 
     * @param tags 
     */
    viewsGet(params: { "prefix"?: string; "tags"?: string;  }, options?: any): (fetch?: FetchAPI, basePath?: string) => Promise<Views> {
        const fetchArgs = DefaultApiFetchParamCreator.viewsGet(params, options);
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
     */
    viewsOptions(options?: any): (fetch?: FetchAPI, basePath?: string) => Promise<Empty> {
        const fetchArgs = DefaultApiFetchParamCreator.viewsOptions(options);
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
     * @param name 
     */
    viewDelete(params: {  "name"?: string; }, options?: any) {
        return DefaultApiFp.viewDelete(params, options)(this.fetch, this.basePath);
    }
    /** 
     * @param name 
     */
    viewGet(params: {  "name"?: string; }, options?: any) {
        return DefaultApiFp.viewGet(params, options)(this.fetch, this.basePath);
    }
    /** 
     */
    viewOptions(options?: any) {
        return DefaultApiFp.viewOptions(options)(this.fetch, this.basePath);
    }
    /** 
     * @param view 
     */
    viewPut(params: {  "view": View; }, options?: any) {
        return DefaultApiFp.viewPut(params, options)(this.fetch, this.basePath);
    }
    /** 
     * @param prefix 
     * @param tags 
     */
    viewsGet(params: {  "prefix"?: string; "tags"?: string; }, options?: any) {
        return DefaultApiFp.viewsGet(params, options)(this.fetch, this.basePath);
    }
    /** 
     */
    viewsOptions(options?: any) {
        return DefaultApiFp.viewsOptions(options)(this.fetch, this.basePath);
    }
};

/**
 * DefaultApi - factory interface
 */
export const DefaultApiFactory = function (fetch?: FetchAPI, basePath?: string) {
    return {
        /** 
         * @param name 
         */
        viewDelete(params: {  "name"?: string; }, options?: any) {
            return DefaultApiFp.viewDelete(params, options)(fetch, basePath);
        },
        /** 
         * @param name 
         */
        viewGet(params: {  "name"?: string; }, options?: any) {
            return DefaultApiFp.viewGet(params, options)(fetch, basePath);
        },
        /** 
         */
        viewOptions(options?: any) {
            return DefaultApiFp.viewOptions(options)(fetch, basePath);
        },
        /** 
         * @param view 
         */
        viewPut(params: {  "view": View; }, options?: any) {
            return DefaultApiFp.viewPut(params, options)(fetch, basePath);
        },
        /** 
         * @param prefix 
         * @param tags 
         */
        viewsGet(params: {  "prefix"?: string; "tags"?: string; }, options?: any) {
            return DefaultApiFp.viewsGet(params, options)(fetch, basePath);
        },
        /** 
         */
        viewsOptions(options?: any) {
            return DefaultApiFp.viewsOptions(options)(fetch, basePath);
        },
    };
};

