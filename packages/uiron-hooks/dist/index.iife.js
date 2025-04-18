(function (exports, elementPlus, axios, qs) {
    'use strict';

    /**
     * @description: request method
     */
    var RequestEnum;
    (function (RequestEnum) {
        RequestEnum["GET"] = "GET";
        RequestEnum["POST"] = "POST";
        RequestEnum["PUT"] = "PUT";
        RequestEnum["DELETE"] = "DELETE";
    })(RequestEnum || (RequestEnum = {}));
    /**
     * @description:  contentTyp
     */
    var ContentTypeEnum;
    (function (ContentTypeEnum) {
        // json
        ContentTypeEnum["JSON"] = "application/json;charset=UTF-8";
        // form-data qs
        ContentTypeEnum["FORM_URLENCODED"] = "application/x-www-form-urlencoded;charset=UTF-8";
        // form-data  upload
        ContentTypeEnum["FORM_DATA"] = "multipart/form-data;charset=UTF-8";
    })(ContentTypeEnum || (ContentTypeEnum = {}));

    /******************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise, SuppressedError, Symbol, Iterator */


    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
        var e = new Error(message);
        return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
    };

    var dealWhiteList = function (whiteList, url) {
        if (!whiteList || !whiteList.length || !url)
            return false;
        return whiteList.some(function (item) { return item.includes(url); });
    };
    function deepMerge(src, target) {
        if (src === void 0) { src = {}; }
        if (target === void 0) { target = {}; }
        var key;
        for (key in target) {
            src[key] = isObject(src[key]) ? deepMerge(src[key], target[key]) : (src[key] = target[key]);
        }
        return src;
    }
    function isObject(val) {
        return val !== null && is(val, 'Object');
    }
    function is(val, type) {
        return toString.call(val) === "[object ".concat(type, "]");
    }
    function isString(val) {
        return is(val, 'String');
    }
    function isFunction(val) {
        return typeof val === 'function';
    }

    // Used to store the identification and cancellation function of each request
    var pendingMap = new Map();
    var getPendingUrl = function (config) { return [config.method, config.url].join('&'); };
    var AxiosCanceler = /** @class */ (function () {
        function AxiosCanceler() {
        }
        /**
         * Add request
         * @param {object} config
         */
        AxiosCanceler.prototype.addPending = function (config) {
            this.removePending(config);
            var url = getPendingUrl(config);
            config.cancelToken =
                config.cancelToken ||
                    new axios.CancelToken(function (cancel) {
                        if (!pendingMap.has(url)) {
                            // If there is no current request in pending, add it
                            pendingMap.set(url, cancel);
                        }
                    });
        };
        /**
         * @description: Clear all pending
         */
        AxiosCanceler.prototype.removeAllPending = function () {
            pendingMap.forEach(function (cancel) {
                cancel && isFunction(cancel) && cancel();
            });
            pendingMap.clear();
        };
        /**
         * Removal request
         * @param {object} config
         */
        AxiosCanceler.prototype.removePending = function (config) {
            var url = getPendingUrl(config);
            if (pendingMap.has(url)) {
                // If there is a current request identifier in pending,
                // the current request needs to be cancelled and removed
                var cancel = pendingMap.get(url);
                cancel && cancel(url);
                pendingMap.delete(url);
            }
        };
        /**
         * @description: reset
         */
        AxiosCanceler.prototype.reset = function () {
            pendingMap = new Map();
        };
        return AxiosCanceler;
    }());

    /**
     * Enhanced Axios client with additional functionality
     */
    var VAxios = /** @class */ (function () {
        function VAxios(options) {
            this.options = options;
            this.axiosInstance = axios.create(options);
            this.setupInterceptors();
        }
        /**
         * Create a new axios instance with updated config
         */
        VAxios.prototype.createAxios = function (config) {
            this.axiosInstance = axios.create(config);
        };
        /**
         * Get transformation hooks from options
         */
        VAxios.prototype.getTransform = function () {
            var transform = this.options.transform;
            return transform;
        };
        /**
         * Get the underlying axios instance
         */
        VAxios.prototype.getAxios = function () {
            return this.axiosInstance;
        };
        /**
         * Reconfigure the axios instance
         */
        VAxios.prototype.configAxios = function (config) {
            if (!this.axiosInstance) {
                return;
            }
            this.createAxios(config);
        };
        /**
         * Set default headers for all requests
         */
        VAxios.prototype.setHeader = function (headers) {
            if (!this.axiosInstance) {
                return;
            }
            Object.assign(this.axiosInstance.defaults.headers, headers);
        };
        /**
         * Set up request/response interceptors
         */
        VAxios.prototype.setupInterceptors = function () {
            var _this = this;
            var transform = this.getTransform();
            if (!transform) {
                return;
            }
            var requestInterceptors = transform.requestInterceptors, requestInterceptorsCatch = transform.requestInterceptorsCatch, responseInterceptors = transform.responseInterceptors, responseInterceptorsCatch = transform.responseInterceptorsCatch;
            var axiosCanceler = new AxiosCanceler();
            // Request interceptor configuration processing
            this.axiosInstance.interceptors.request.use(function (config) {
                // If cancel repeat request is turned on, then cancel repeat request is prohibited
                if (requestInterceptors && isFunction(requestInterceptors)) {
                    config = requestInterceptors(config, _this.options);
                }
                return config;
            }, undefined);
            // Request interceptor error capture
            requestInterceptorsCatch &&
                isFunction(requestInterceptorsCatch) &&
                this.axiosInstance.interceptors.request.use(undefined, requestInterceptorsCatch);
            // Response result interceptor processing
            this.axiosInstance.interceptors.response.use(function (res) {
                res && axiosCanceler.removePending(res.config);
                if (responseInterceptors && isFunction(responseInterceptors)) {
                    res = responseInterceptors(res);
                }
                return res;
            }, undefined);
            // Response result interceptor error capture
            responseInterceptorsCatch &&
                isFunction(responseInterceptorsCatch) &&
                this.axiosInstance.interceptors.response.use(undefined, responseInterceptorsCatch);
        };
        // support form-data
        VAxios.prototype.supportFormData = function (config) {
            var _a;
            var headers = config.headers || this.options.headers;
            var contentType = (headers === null || headers === void 0 ? void 0 : headers['Content-Type']) || (headers === null || headers === void 0 ? void 0 : headers['content-type']);
            if (contentType !== ContentTypeEnum.FORM_URLENCODED ||
                !Reflect.has(config, 'data') ||
                ((_a = config.method) === null || _a === void 0 ? void 0 : _a.toUpperCase()) === RequestEnum.GET) {
                return config;
            }
            // Could add form data serialization here if needed
            return __assign(__assign({}, config), { data: qs.qs.stringify(config.data, { arrayFormat: 'brackets' }) });
        };
        /**
         * GET request
         */
        VAxios.prototype.get = function (config, options) {
            return this.request(__assign(__assign({}, config), { method: 'GET' }), options);
        };
        /**
         * POST request
         */
        VAxios.prototype.post = function (config, options) {
            return this.request(__assign(__assign({}, config), { method: 'POST' }), options);
        };
        /**
         * PUT request
         */
        VAxios.prototype.put = function (config, options) {
            return this.request(__assign(__assign({}, config), { method: 'PUT' }), options);
        };
        /**
         * DELETE request
         */
        VAxios.prototype.delete = function (config, options) {
            return this.request(__assign(__assign({}, config), { method: 'DELETE' }), options);
        };
        /**
         * Generic request method
         */
        VAxios.prototype.request = function (config, options) {
            var _this = this;
            // Merge configuration with options
            var conf = deepMerge(config);
            var transform = this.getTransform();
            var requestOptions = this.options.requestOptions;
            var opt = Object.assign({}, requestOptions, options);
            // Apply pre-request hook
            var _a = transform || {}, beforeRequestHook = _a.beforeRequestHook, requestCatchHook = _a.requestCatchHook, transformRequestHook = _a.transformRequestHook;
            if (beforeRequestHook && isFunction(beforeRequestHook)) {
                conf = beforeRequestHook(conf, opt);
            }
            // Store options for interceptors to access
            conf.requestOptions = opt;
            // Handle form data if needed
            conf = this.supportFormData(conf);
            // Execute the request
            return new Promise(function (resolve, reject) {
                _this.axiosInstance
                    .request(conf)
                    .then(function (res) {
                    // Transform response data
                    if (transformRequestHook && isFunction(transformRequestHook)) {
                        try {
                            var ret = transformRequestHook(res, opt);
                            resolve(ret);
                        }
                        catch (err) {
                            reject(err || new Error('Request data processing error'));
                        }
                        return;
                    }
                    resolve(res);
                })
                    .catch(function (e) {
                    // Custom error handling
                    if (requestCatchHook && isFunction(requestCatchHook)) {
                        reject(requestCatchHook(e, opt));
                        return;
                    }
                    reject(e);
                });
            });
        };
        return VAxios;
    }());

    /* eslint-disable no-new */
    /**
     * @description: 校验错误网络请求状态码
     * @param {number} response
     * @return void
     */
    /**
     * Default error messages for HTTP status codes
     */
    var defaultErrorMessages = {
        400: '请求参数错误',
        401: '用户未授权或授权已过期',
        403: '访问被禁止',
        404: '请求的资源不存在',
        405: '请求方法不允许',
        408: '请求超时',
        500: '服务器内部错误',
        501: '服务未实现',
        502: '网关错误',
        503: '服务不可用',
        504: '网关超时',
        505: 'HTTP版本不支持'
    };
    function checkStatus(response, message) {
        var _a;
        if (!response)
            return;
        // 后端自定义报错
        if ((_a = response.data) === null || _a === void 0 ? void 0 : _a.msg) {
            elementPlus.ElMessage.error(response.data.msg);
            return;
        }
        if (defaultErrorMessages[response.status]) {
            elementPlus.ElMessage.error(defaultErrorMessages[response.status]);
        }
    }

    function joinTimestamp(join, restful) {
        if (!join) {
            return restful ? '' : {};
        }
        var now = new Date().getTime();
        return { _t: now };
    }

    /* eslint-disable no-new */
    // axios配置  可自行根据项目进行更改，只需更改该文件即可，其他文件可以不动
    // The axios configuration can be changed according to the project, just change the file, other files can be left unchanged
    /**
     * @description: Data processing utilities for various request handling scenarios
     */
    var transform = {
        /**
         * @description: Process response data. If the data format is not as expected, it will throw an error
         */
        transformRequestHook: function (res, options) {
            var isReturnNativeResponse = options.isReturnNativeResponse, _a = options.isTransformResponse, isTransformResponse = _a === void 0 ? true : _a;
            // Return native response if specified (e.g., when headers are needed)
            if (isReturnNativeResponse) {
                return res;
            }
            // Skip transformation if specified
            if (!isTransformResponse) {
                return res.data;
            }
            var data = res.data;
            // Handle null/undefined data
            if (!data) {
                return null;
            }
            // Support multiple response data structures
            return data.result || data.data || data;
        },
        /**
         * @description: Process request configuration before making the request
         */
        beforeRequestHook: function (config, options) {
            var _a;
            var apiUrl = options.apiUrl, joinPrefix = options.joinPrefix, urlPrefix = options.urlPrefix, _b = options.joinTime, joinTime = _b === void 0 ? true : _b;
            // Handle URL prefixes
            if (joinPrefix && urlPrefix) {
                config.url = "".concat(urlPrefix).concat(config.url);
            }
            if (apiUrl && isString(apiUrl)) {
                config.url = "".concat(apiUrl).concat(config.url);
            }
            // Process parameters based on request method
            var params = config.params || config.data || {};
            // formatDate && data && !isString(data) && formatRequestDate(data);
            if (((_a = config.method) === null || _a === void 0 ? void 0 : _a.toUpperCase()) === RequestEnum.GET) {
                params = Object.assign(params || {}, joinTimestamp(joinTime, false));
                config.data = params;
                config.params = undefined;
            }
            return config;
        },
        /**
         * @description: Request interceptor - handles authentication, tokens, app IDs
         */
        requestInterceptors: function (config, options) {
            var _a = (options === null || options === void 0 ? void 0 : options.requestOptions) || {}, _b = _a.whiteList, whiteList = _b === void 0 ? [] : _b, setToken = _a.setToken, appId = _a.appId;
            // 处理白名单
            if (!dealWhiteList(whiteList, config.url) && setToken && isFunction(isFunction)) {
                var config1 = setToken && setToken(config);
                return config1;
            }
            if (appId) {
                config.headers['Xi-App-Id'] = appId;
            }
            return config;
        },
        /**
         * @description: Response interceptor processing - handle successful responses
         */
        responseInterceptors: function (res) {
            return res;
        },
        /**
         * @description: Response error handling - process error responses
         */
        responseInterceptorsCatch: function (error) {
            var _a = error || {}, response = _a.response; _a.message;
            checkStatus(response);
            if (axios.isCancel(error)) {
                elementPlus.ElMessage.error('请求已取消');
            }
            else if (!response) {
                return Promise.reject(new Error('Network error, please check your connection'));
            }
            return Promise.reject(error);
        },
    };
    /**
     * Create an axios instance with custom configuration
     * @param opt Additional axios options to override defaults
     * @returns VAxios instance
     */
    function createAxios(opt) {
        return new VAxios(deepMerge({
            // 接口超时时间，服务器超过下面时间没响应会报错
            timeout: 30 * 1000,
            headers: { 'Content-Type': ContentTypeEnum.JSON },
            // 数据处理方式
            transform: transform,
            // 配置项，下面的选项都可以在独立的接口请求中覆盖
            requestOptions: {
                appId: '',
                whiteList: [],
                joinPrefix: true,
                // 是否返回原生响应头 比如：需要获取响应头时使用该属性
                isReturnNativeResponse: false,
                // 需要对返回数据进行处理
                isTransformResponse: true,
                // post请求的时候添加参数到url
                joinParamsToUrl: false,
                // 格式化提交参数时间
                formatDate: true,
                //  是否加入时间戳
                joinTime: false,
                // 接口前缀
                urlPrefix: '',
                // 接口地址
                apiUrl: '',
                // 忽略重复请求
                ignoreCancelToken: true,
            }
        }, opt || {}));
    }

    exports.uironRequest = createAxios;

})(this.VueUse = this.VueUse || {}, elementPlus, axios, qs);
