import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import type { RequestOptions, Result } from '../types/axios';
import type { CreateAxiosOptions } from './axiosTransform';
import { ContentTypeEnum, RequestEnum } from '../constants';
import { isFunction, deepMerge } from './utils';
import axios from 'axios';
import { AxiosCanceler } from './axiosCancel';
import { qs } from 'qs';
export * from './axiosTransform';

/**
 * Enhanced Axios client with additional functionality
 */
export class VAxios {
  /**
   * Axios instance
   */
  private axiosInstance: AxiosInstance;
  
  /**
   * Configuration options
   */
  private readonly options: CreateAxiosOptions;
  
  /**
   * Request cancellation manager
   */
  private readonly axiosCanceler: AxiosCanceler;

  constructor(options: CreateAxiosOptions) {
    this.options = options;
    this.axiosInstance = axios.create(options);
    this.setupInterceptors();
  }

  /**
   * Create a new axios instance with updated config
   */
  private createAxios(config: CreateAxiosOptions): void {
    this.axiosInstance = axios.create(config);
  }

  /**
   * Get transformation hooks from options
   */
  private getTransform() {
    const { transform } = this.options;
    return transform;
  }

  /**
   * Get the underlying axios instance
   */
  getAxios(): AxiosInstance {
    return this.axiosInstance;
  }

  /**
   * Reconfigure the axios instance
   */
  configAxios(config: CreateAxiosOptions) {
    if (!this.axiosInstance) {
      return;
    }
    this.createAxios(config);
  }

  /**
   * Set default headers for all requests
   */
  setHeader(headers: Record<string, string>): void {
    if (!this.axiosInstance) {
      return;
    }
    Object.assign(this.axiosInstance.defaults.headers, headers);
  }

  /**
   * Set up request/response interceptors
   */
  private setupInterceptors() {
    const transform = this.getTransform();
    if (!transform) {
      return;
    }

    const {
      requestInterceptors,
      requestInterceptorsCatch,
      responseInterceptors,
      responseInterceptorsCatch
    } = transform;
    const axiosCanceler = new AxiosCanceler();
    // Request interceptor configuration processing
    this.axiosInstance.interceptors.request.use((config: CreateAxiosOptions) => {
      const {
        headers: { ignoreCancelToken },
      } = config;
      // If cancel repeat request is turned on, then cancel repeat request is prohibited
      const ignoreCancel =
      ignoreCancelToken !== undefined
        ? ignoreCancelToken
        : config?.requestOptions?.ignoreCancelToken !== undefined
        ? config?.requestOptions?.ignoreCancelToken
        : this.options.requestOptions?.ignoreCancelToken;

    !ignoreCancel && axiosCanceler.addPending(config);
        if (requestInterceptors && isFunction(requestInterceptors)) {
          config = requestInterceptors(config, this.options);
        }
        return config;
    }, undefined);

    // Request interceptor error capture
    requestInterceptorsCatch &&
      isFunction(requestInterceptorsCatch) &&
      this.axiosInstance.interceptors.request.use(undefined, requestInterceptorsCatch);

    // Response result interceptor processing
    this.axiosInstance.interceptors.response.use((res: AxiosResponse<any>) => {
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
  }

  // support form-data
  supportFormData(config: AxiosRequestConfig) {
    const headers = config.headers || this.options.headers;
    const contentType = headers?.['Content-Type'] || headers?.['content-type'];

    if (
      contentType !== ContentTypeEnum.FORM_URLENCODED ||
      !Reflect.has(config, 'data') ||
      config.method?.toUpperCase() === RequestEnum.GET
    ) {
      return config;
    }

    // Could add form data serialization here if needed
    return {
      ...config,
      data: qs.stringify(config.data, { arrayFormat: 'brackets' }),
    };
  }

  /**
   * GET request
   */
  get<T = any>(config: AxiosRequestConfig, options?: RequestOptions): Promise<T> {
    return this.request({ ...config, method: 'GET' }, options);
  }

  /**
   * POST request
   */
  post<T = any>(config: AxiosRequestConfig, options?: RequestOptions): Promise<T> {
    return this.request({ ...config, method: 'POST' }, options);
  }

  /**
   * PUT request
   */
  put<T = any>(config: AxiosRequestConfig, options?: RequestOptions): Promise<T> {
    return this.request({ ...config, method: 'PUT' }, options);
  }

  /**
   * DELETE request
   */
  delete<T = any>(config: AxiosRequestConfig, options?: RequestOptions): Promise<T> {
    return this.request({ ...config, method: 'DELETE' }, options);
  }

  /**
   * Generic request method
   */
  request<T = any>(config: AxiosRequestConfig, options?: RequestOptions): Promise<T> {
    // Merge configuration with options
    let conf: CreateAxiosOptions = deepMerge(config);
    const transform = this.getTransform();

    const { requestOptions } = this.options;
    const opt: RequestOptions = Object.assign({}, requestOptions, options);

    // Apply pre-request hook
    const { beforeRequestHook, requestCatchHook, transformRequestHook } = transform || {};
    
    if (beforeRequestHook && isFunction(beforeRequestHook)) {
      conf = beforeRequestHook(conf, opt);
    }
    
    // Store options for interceptors to access
    conf.requestOptions = opt;

    // Handle form data if needed
    conf = this.supportFormData(conf);

    // Execute the request
    return new Promise<T>((resolve, reject) => {
      this.axiosInstance
        .request<any, AxiosResponse<Result>>(conf)
        .then((res: AxiosResponse<Result>) => {
          // Transform response data
          if (transformRequestHook && isFunction(transformRequestHook)) {
            try {
              const ret = transformRequestHook<T>(res, opt);
              resolve(ret);
            } catch (err) {
              reject(err || new Error('Request data processing error'));
            }
            return;
          }
          resolve(res as unknown as T);
        })
        .catch((e: Error) => {
          // Custom error handling
          if (requestCatchHook && isFunction(requestCatchHook)) {
            reject(requestCatchHook(e, opt));
            return;
          }
          reject(e);
        });
    });
  }
}
