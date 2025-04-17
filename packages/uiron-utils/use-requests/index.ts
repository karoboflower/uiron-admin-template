/* eslint-disable no-new */
// axios配置  可自行根据项目进行更改，只需更改该文件即可，其他文件可以不动
// The axios configuration can be changed according to the project, just change the file, other files can be left unchanged

import type { AxiosResponse } from 'axios';
import type { RequestOptions, Result } from '../../../../types/axios';
import type { AxiosTransform, CreateAxiosOptions } from './axiosTransform';
import { ContentTypeEnum, RequestEnum } from '@/enums';
import { useLoading } from '@/hooks/elementPlus/useLoading';
import { error as ElError } from '@/hooks/elementPlus/useMessage';
import { useGlobSetting } from '@/hooks/setting';
import { useErrorLogStoreWithOut } from '@/store/modules/errorLog';
import { deepMerge, deepTrim, setObjToUrlParams } from '@/utils';
import { getToken } from '@/utils/auth';
import { isString } from '@/utils/is';
import axios from 'axios';
import NProgress from 'nprogress';
import { VAxios } from './Axios';
import { checkStatus } from './checkStatus';
import { joinTimestamp } from './helper';

const [openLoading, closeLoading] = useLoading();

const globSetting = useGlobSetting();
const urlPrefix = globSetting.urlPrefix;

/**
 * @description: 数据处理，方便区分多种处理方式
 */
const transform: AxiosTransform = {
  /**
   * @description: 处理请求数据。如果数据不是预期格式，可直接抛出错误
   */
  transformRequestHook: (res: AxiosResponse<Result>, options: RequestOptions) => {
    const { isTransformResponse, isReturnNativeResponse } = options;

    // 是否返回原生响应头 比如：需要获取响应头时使用该属性
    if (isReturnNativeResponse) {
      closeLoading();
      return res;
    }
    // 不进行任何处理，直接返回
    // 用于页面代码可能需要直接获取code，data，message这些信息时开启
    if (!isTransformResponse) {
      closeLoading();
      return res.data;
    }

    // 错误的时候返回
    const { data } = res;
    // if (!data && data !== 0) {
    //   ElError('[HTTP] Request has no return value');
    //   throw new Error('request error');
    // }

    closeLoading();
    return data;
  },

  // 请求之前处理config
  beforeRequestHook: (config, options) => {
    const { apiUrl, joinPrefix, joinParamsToUrl, formatDate, joinTime = true } = options;

    if (joinPrefix) {
      config.url = `${urlPrefix}${config.url}`;
    }

    if (apiUrl && isString(apiUrl)) {
      config.url = `${apiUrl}${config.url}`;
    }

    // 对请求参数进行进行 trim 处理
    // GET
    config.params && (config.params = deepTrim(config.params, formatDate));
    // POST、PUT
    config.data && (config.data = deepTrim(config.data, formatDate));

    const params = config.params || {};
    const data = config.data || false;
    // formatDate && data && !isString(data) && formatRequestDate(data);
    if (config.method?.toUpperCase() === RequestEnum.GET) {
      if (!isString(params)) {
        // 给 get 请求加上时间戳参数，避免从缓存中拿数据。
        config.params = Object.assign(params || {}, joinTimestamp(joinTime, false));
      } else {
        // 兼容restful风格
        config.url = config.url + params + `${joinTimestamp(joinTime, true)}`;
        config.params = undefined;
      }
    } else {
      if (!isString(params)) {
        // formatDate && formatRequestDate(params);
        if (Reflect.has(config, 'data') && config.data && Object.keys(config.data).length > 0) {
          config.data = data;
          config.params = params;
        } else {
          // 非GET请求如果没有提供data，则将params视为data
          config.data = params;
          config.params = undefined;
        }
        if (joinParamsToUrl) {
          config.url = setObjToUrlParams(config.url as string, Object.assign({}, config.params, config.data));
        }
      } else {
        // 兼容restful风格
        config.url = config.url + params;
        config.params = undefined;
      }
    }
    return config;
  },

  /**
   * @description: 请求拦截器处理,添加请求token,appId等
   */
  requestInterceptors: (config, options) => {
    if ((config as Recordable)?.withLoading !== false) {
      openLoading();
    }
    const token = getToken();
    if (token && (config as Recordable)?.requestOptions?.withToken !== false) {
      config.headers.Authorization = token;
    }
    config.headers['Xi-App-Id'] = options.appId;
    return config;
  },

  /**
   * @description: 响应拦截器处理,响应成功的拦截处理
   */
  responseInterceptors: (res: AxiosResponse<any>) => {
    if (res?.data instanceof Blob) {
      console.log(res, 'res');
    }
    NProgress.done();
    return res;
  },

  /**
   * @description: 响应错误处理
   */
  responseInterceptorsCatch: (error: any) => {
    const errorLogStore = useErrorLogStoreWithOut();
    errorLogStore.addAjaxErrorInfo(error);
    console.log('error: ', error.msg);
    const { response, message } = error || {};
    checkStatus(response, message);
    if (!response && error.message === 'timeout of 30000ms exceeded') {
      new ElError('服务器响应超时');
    }
    if (axios.isCancel(error)) {
      new ElError('请求已取消');
    } else if (!response) {
      new ElError(error.message);
    }
    closeLoading();
    return Promise.reject(error);
  },
};

function createAxios(opt?: Partial<CreateAxiosOptions>) {
  return new VAxios(
    deepMerge(
      {
        // See https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication#authentication_schemes
        // authentication schemes，e.g: Bearer
        // authenticationScheme: 'Bearer',
        authenticationScheme: '',
        appId: globSetting.appId,
        // 接口超时时间，服务器超过下面时间没响应会报错
        timeout: 30 * 1000,
        // 基础接口地址
        // baseURL: globSetting.apiUrl,
        // 接口可能会有通用的地址部分，可以统一抽取出来
        urlPrefix,
        headers: { 'Content-Type': ContentTypeEnum.JSON },
        // 如果是form-data格式
        // headers: { 'Content-Type': ContentTypeEnum.FORM_URLENCODED },
        // 数据处理方式
        transform,
        // 配置项，下面的选项都可以在独立的接口请求中覆盖
        requestOptions: {
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
          // 消息提示类型
          errorMessageMode: 'message',
          // 接口地址
          apiUrl: globSetting.apiUrl,
          //  是否加入时间戳
          joinTime: false,
          // 忽略重复请求
          ignoreCancelToken: true,
          // 是否携带token
          withToken: true,
        },
      },
      opt || {},
    ),
  );
}
export const defHttp = createAxios();
export const CancelToken = axios.CancelToken;
