/**
 * Data processing class, can be configured according to the project
 */
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import type { RequestOptions, Result } from '../types/axios';

/**
 * Extended Axios configuration options
 */
export interface CreateAxiosOptions extends AxiosRequestConfig {
  /**
   * Authentication scheme (e.g., 'Bearer')
   */
  authenticationScheme?: string;
  
  /**
   * Request transformation hooks
   */
  transform?: AxiosTransform;
  
  /**
   * Request options
   */
  requestOptions?: RequestOptions;
}

/**
 * Abstract class for Axios transformations
 * Provides hooks for request/response processing
 */
export abstract class AxiosTransform {
  /**
   * Process configuration before request
   * @param config Axios request configuration
   * @param options Request options
   */
  beforeRequestHook?: (config: AxiosRequestConfig, options: RequestOptions) => AxiosRequestConfig;

  /**
   * Process request response data
   * @param res Axios response
   * @param options Request options
   */
  transformRequestHook?: <T = any>(res: AxiosResponse<Result>, options: RequestOptions) => T;

  /**
   * Handle request errors
   * @param e Error object
   * @param options Request options
   */
  requestCatchHook?: (e: Error, options: RequestOptions) => Promise<any>;

  /**
   * Request interceptor
   * @param config Axios request configuration
   * @param options Axios creation options
   */
  requestInterceptors?: (config: AxiosRequestConfig, options: CreateAxiosOptions) => AxiosRequestConfig;

  /**
   * Response interceptor
   * @param res Axios response
   */
  responseInterceptors?: <T = any>(res: AxiosResponse<T>) => AxiosResponse<T>;

  /**
   * Request interceptor error handler
   * @param error Error object
   */
  requestInterceptorsCatch?: (error: Error) => void;

  /**
   * Response interceptor error handler
   * @param error Error object
   */
  responseInterceptorsCatch?: (error: Error) => void;
}
