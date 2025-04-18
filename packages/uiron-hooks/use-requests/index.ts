/* eslint-disable no-new */
// axios配置  可自行根据项目进行更改，只需更改该文件即可，其他文件可以不动
// The axios configuration can be changed according to the project, just change the file, other files can be left unchanged

import type { AxiosResponse } from 'axios';
import type { RequestOptions, Result } from '../types/axios';
import type { AxiosTransform, CreateAxiosOptions } from './axiosTransform';
import { ContentTypeEnum, RequestEnum } from '../constants';
import { ElMessage } from 'element-plus';
import axios from 'axios';
import { VAxios } from './Axios';
import { checkStatus } from './checkStatus';
import { joinTimestamp } from './helper';
import { dealWhiteList, deepMerge, isString, isFunction } from './utils';

/**
 * @description: Data processing utilities for various request handling scenarios
 */
const transform: AxiosTransform = {
  /**
   * @description: Process response data. If the data format is not as expected, it will throw an error
   */
  transformRequestHook: (res: AxiosResponse<Result>, options: RequestOptions) => {
    const { isReturnNativeResponse, isTransformResponse = true } = options;

    // Return native response if specified (e.g., when headers are needed)
    if (isReturnNativeResponse) {
      return res;
    }
    
    // Skip transformation if specified
    if (!isTransformResponse) {
      return res.data;
    }
    
    const { data } = res;
    
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
  beforeRequestHook: (config, options) => {
    const { apiUrl, joinPrefix, urlPrefix, joinTime = true } = options;
    
    // Handle URL prefixes
    if (joinPrefix && urlPrefix) {
      config.url = `${urlPrefix}${config.url}`;
    }

    if (apiUrl && isString(apiUrl)) {
      config.url = `${apiUrl}${config.url}`;
    }
    
    // Process parameters based on request method
    let params = config.params || config.data || {};
    // formatDate && data && !isString(data) && formatRequestDate(data);
    if (config.method?.toUpperCase() === RequestEnum.GET) {
      params = Object.assign(params || {}, joinTimestamp(joinTime, false));
      config.data = params;
      config.params = undefined;
    }
    
    return config;
  },

  /**
   * @description: Request interceptor - handles authentication, tokens, app IDs
   */
  requestInterceptors: (config, options) => {
    const {whiteList = [], setToken , appId } = options?.requestOptions || {};
    // 处理白名单
    if(!dealWhiteList(whiteList, config.url) && setToken && isFunction(isFunction)) { 
      const config1 = setToken && setToken(config);
      return config1;
    }
    if(appId) {
      config.headers['Xi-App-Id'] = appId;
    }
    
    return config;
  },

  /**
   * @description: Response interceptor processing - handle successful responses
   */
  responseInterceptors: (res: AxiosResponse<any>) => {
    return res;
  },

  /**
   * @description: Response error handling - process error responses
   */
  responseInterceptorsCatch: (error: any) => {
    const { response, message } = error || {};
    checkStatus(response, message);
    if (axios.isCancel(error)) {
      ElMessage.error('请求已取消');
    } else if (!response) {
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
export default function createAxios(opt?: Partial<CreateAxiosOptions>) {
  return new VAxios(
    deepMerge(
      {
       
        // 接口超时时间，服务器超过下面时间没响应会报错
        timeout: 30 * 1000,
        headers: { 'Content-Type': ContentTypeEnum.JSON },
        // 数据处理方式
        transform,
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
          urlPrefix:'',
          // 接口地址
          apiUrl: '',
          // 忽略重复请求
          ignoreCancelToken: true,
        }
      },
      opt || {},
    ),
  );
}

