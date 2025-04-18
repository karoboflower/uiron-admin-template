import { ElMessage } from 'element-plus';
import axios from 'axios';

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
 * @description:  axios module
 */
var VAxios = /** @class */ (function () {
    function VAxios(options) {
        this.options = options;
        this.axiosInstance = axios.create(options);
        this.setupInterceptors();
    }
    /**
     * @description:  Create axios instance
     */
    VAxios.prototype.createAxios = function (config) {
        this.axiosInstance = axios.create(config);
    };
    VAxios.prototype.getTransform = function () {
        var transform = this.options.transform;
        return transform;
    };
    VAxios.prototype.getAxios = function () {
        return this.axiosInstance;
    };
    /**
     * @description: Reconfigure axios
     */
    VAxios.prototype.configAxios = function (config) {
        if (!this.axiosInstance) {
            return;
        }
        this.createAxios(config);
    };
    /**
     * @description: Set general header
     */
    VAxios.prototype.setHeader = function (headers) {
        if (!this.axiosInstance) {
            return;
        }
        Object.assign(this.axiosInstance.defaults.headers, headers);
    };
    /**
     * @description: Interceptor configuration
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
    /**
     * @description:  File Upload
     */
    // uploadFile<T = any>(config: AxiosRequestConfig, params: UploadFileParams) {
    //   const formData = new window.FormData();
    //   if (params.data) {
    //     Object.keys(params.data).forEach((key) => {
    //       if (!params.data) return;
    //       const value = params.data[key];
    //       if (Array.isArray(value)) {
    //         value.forEach((item) => {
    //           formData.append(`${key}[]`, item);
    //         });
    //         return;
    //       }
    //       formData.append(key, params.data[key]);
    //     });
    //   }
    //   formData.append(params.name || 'file', params.file, params.filename);
    //   const customParams = omit(params, 'file', 'filename', 'file');
    //   Object.keys(customParams).forEach((key) => {
    //     formData.append(key, customParams[key]);
    //   });
    //   return this.axiosInstance.request<T>({
    //     ...config,
    //     method: 'POST',
    //     data: formData,
    //     headers: {
    //       'Content-type': ContentTypeEnum.FORM_DATA,
    //       /* ignoreCancelToken: false, */
    //     },
    //   });
    // }
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
        return __assign(__assign({}, config), { data: __assign({}, config.data) });
    };
    VAxios.prototype.get = function (config, options) {
        return this.request(__assign(__assign({}, config), { method: 'GET' }), options);
    };
    VAxios.prototype.post = function (config, options) {
        return this.request(__assign(__assign({}, config), { method: 'POST' }), options);
    };
    VAxios.prototype.put = function (config, options) {
        return this.request(__assign(__assign({}, config), { method: 'PUT' }), options);
    };
    VAxios.prototype.delete = function (config, options) {
        return this.request(__assign(__assign({}, config), { method: 'DELETE' }), options);
    };
    VAxios.prototype.request = function (config, options) {
        var _this = this;
        var conf = deepMerge(config);
        var transform = this.getTransform();
        var requestOptions = this.options.requestOptions;
        var opt = Object.assign({}, requestOptions, options);
        var _a = transform || {}, beforeRequestHook = _a.beforeRequestHook, requestCatchHook = _a.requestCatchHook, transformRequestHook = _a.transformRequestHook;
        if (beforeRequestHook && isFunction(beforeRequestHook)) {
            conf = beforeRequestHook(conf, opt);
        }
        conf.requestOptions = opt;
        conf = this.supportFormData(conf);
        return new Promise(function (resolve, reject) {
            _this.axiosInstance
                .request(conf)
                .then(function (res) {
                if (transformRequestHook && isFunction(transformRequestHook)) {
                    try {
                        var ret = transformRequestHook(res, opt);
                        resolve(ret);
                    }
                    catch (err) {
                        reject(err || new Error('request error!'));
                    }
                    return;
                }
                resolve(res);
            })
                .catch(function (e) {
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
function checkStatus(response, message) {
    var _a, _b;
    if (!response)
        return;
    console.log('错误响应response: ', response);
    console.log('错误信息message: ', message);
    // 超时报错
    // if (!response && message ) {
    //   ElMessage.error('服务器响应超时');
    // }
    // 处理调用接口使用Blob 返回了json错误，无法解析
    if (response.data instanceof Blob) {
        if (response.headers['content-type'].includes('json')) {
            var reader_1 = new FileReader();
            reader_1.readAsText(response.data);
            reader_1.onload = function () {
                var result = reader_1.result;
                var errorInfos = JSON.parse(result);
                var msg = errorInfos.msg;
                ElMessage.error("".concat(msg));
            };
        }
        return;
    }
    // 返回状态码时
    var _c = response.data, code = _c.code, msg = _c.msg;
    if (code) {
        switch ((_a = response.data) === null || _a === void 0 ? void 0 : _a.code) {
            case 1701:
                ElMessage.error('串口通信超时');
                return;
            case 1702:
                ElMessage.error('串口忙');
                return;
            case 1703:
                ElMessage.error('串口请求数据错误');
                return;
            case 1705:
                ElMessage.error('锁状态错误');
                return;
            case 1706:
                ElMessage.error('mqtt消息过期');
                return;
            case 1707:
                ElMessage.error('串口效验数据错误');
                return;
            default:
                ElMessage.error("".concat(code, "  ").concat(msg));
                return;
        }
    }
    console.log('错误响应response: ', response.data);
    // 后端自定义报错
    if ((_b = response.data) === null || _b === void 0 ? void 0 : _b.msg) {
        ElMessage.error(response.data.msg);
        return;
    }
    // 根据状态码响应报错
    switch (response.status) {
        case 400:
            ElMessage.error('400：请求错误');
            break;
        case 401:
            ElMessage.error('token已失效,请重新登录');
            window.location.reload();
            break;
        case 403:
            ElMessage.error('当前账号无权限访问！');
            break;
        case 404:
            ElMessage.error('你所访问的资源不存在！');
            break;
        case 405:
            ElMessage.error('请求方式错误！请您稍后重试');
            break;
        case 408:
            ElMessage.error('请求超时！请您稍后重试');
            break;
        case 500:
            ElMessage.error('服务器异常！');
            break;
        case 502:
            ElMessage.error('网关错误！');
            break;
        case 503:
            ElMessage.error('服务不可用！');
            break;
        case 504:
            ElMessage.error('网关超时！');
            break;
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
 * @description: 数据处理，方便区分多种处理方式
 */
var transform = {
    /**
     * @description: 处理请求数据。如果数据不是预期格式，可直接抛出错误
     */
    transformRequestHook: function (res, options) {
        var isReturnNativeResponse = options.isReturnNativeResponse;
        // 是否返回原生响应头 比如：需要获取响应头时使用该属性
        if (isReturnNativeResponse) {
            return res;
        }
        var data = res.data;
        return data.result || data.data || data;
    },
    // 请求之前处理config
    beforeRequestHook: function (config, options) {
        var _a;
        var apiUrl = options.apiUrl, joinPrefix = options.joinPrefix, urlPrefix = options.urlPrefix, _b = options.joinTime, joinTime = _b === void 0 ? true : _b;
        if (joinPrefix) {
            config.url = "".concat(urlPrefix).concat(config.url);
        }
        if (apiUrl && isString(apiUrl)) {
            config.url = "".concat(apiUrl).concat(config.url);
        }
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
     * @description: 请求拦截器处理,添加请求token,appId等
     */
    requestInterceptors: function (config, options) {
        var _a = (options === null || options === void 0 ? void 0 : options.requestOptions) || {}, _b = _a.whiteList, whiteList = _b === void 0 ? [] : _b, _c = _a.setToken, setToken = _c === void 0 ? '' : _c, appId = _a.appId;
        // 处理白名单
        if (!dealWhiteList(whiteList, config.url)) {
            var config1 = setToken && setToken(config);
            return config1;
        }
        if (appId) {
            config.headers['Xi-App-Id'] = appId;
        }
        return config;
    },
    /**
     * @description: 响应拦截器处理,响应成功的拦截处理
     */
    responseInterceptors: function (res) {
        return res;
    },
    /**
     * @description: 响应错误处理
     */
    responseInterceptorsCatch: function (error) {
        var _a = error || {}, response = _a.response, message = _a.message;
        checkStatus(response, message);
        if (!response && error.message === 'timeout of 30000ms exceeded') {
            ElMessage.error('服务器响应超时');
        }
        if (axios.isCancel(error)) {
            ElMessage.error('请求已取消');
        }
        else if (!response) {
            ElMessage.error(error.message);
        }
        return Promise.reject(error);
    },
};
function index (opt) {
    return new VAxios(deepMerge({
        // 接口超时时间，服务器超过下面时间没响应会报错
        timeout: 30 * 1000,
        // 基础接口地址
        // apiUrl: globSetting.apiUrl,
        // 接口可能会有通用的地址部分，可以统一抽取出来
        headers: { 'Content-Type': ContentTypeEnum.JSON },
        // 如果是form-data格式
        // headers: { 'Content-Type': ContentTypeEnum.FORM_URLENCODED },
        // 数据处理方式
        transform: transform,
        // 配置项，下面的选项都可以在独立的接口请求中覆盖
        requestOptions: {
            appId: '',
            whiteList: [],
            // 默认将prefix 添加到url
            joinPrefix: true,
            // 是否返回原生响应头 比如：需要获取响应头时使用该属性
            isReturnNativeResponse: false,
            // 需要对返回数据进行处理
            isTransformResponse: true,
            // post请求的时候添加参数到url
            joinParamsToUrl: false,
            // 格式化提交参数时间
            formatDate: true,
            // 接口地址
            //  是否加入时间戳
            joinTime: false,
            // 接口前缀
            urlPrefix: '',
            // 接口地址
            apiUrl: '',
            // 忽略重复请求
            ignoreCancelToken: true,
            // 是否开启mock
            mock: false
        },
    }, opt || {}));
}
// export const defHttp = createAxios();
// export const CancelToken = axios.CancelToken;

export { index as uironRequest };
