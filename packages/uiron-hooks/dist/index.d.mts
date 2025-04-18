import { AxiosRequestConfig, AxiosResponse, AxiosInstance } from 'axios';

type ErrorMessageMode = 'none' | 'modal' | 'message' | 'notify' | undefined;

interface RequestOptions {
  appId: string;
  // Splicing request parameters to url
  joinParamsToUrl?: boolean;
  // Format request parameter time
  formatDate?: boolean;
  // Whether to process the request result
  isTransformResponse?: boolean;
  // Whether to return native response headers
  // For example: use this attribute when you need to get the response headers
  isReturnNativeResponse?: boolean;
  // Whether to join url
  joinPrefix?: boolean;
  // Interface address, use the default apiUrl if you leave it blank
  apiUrl?: string;
  // Error message prompt type
  errorMessageMode?: ErrorMessageMode;
  // Whether to add a timestamp
  joinTime?: boolean;
  ignoreCancelToken?: boolean;
  whiteList?: string[];
  setToken?: (config: any) =>any;
  urlPrefix?: string;
}

interface Result<T = any> {
  code: number;
  type: 'success' | 'error' | 'warning';
  message: string;
  result?: T;
  data?:T
}

/**
 * Data processing class, can be configured according to the project
 */

/**
 * Extended Axios configuration options
 */
interface CreateAxiosOptions extends AxiosRequestConfig {
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
declare abstract class AxiosTransform {
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

/**
 * Enhanced Axios client with additional functionality
 */
declare class VAxios {
    /**
     * Axios instance
     */
    private axiosInstance;
    /**
     * Configuration options
     */
    private readonly options;
    /**
     * Request cancellation manager
     */
    private readonly axiosCanceler;
    constructor(options: CreateAxiosOptions);
    /**
     * Create a new axios instance with updated config
     */
    private createAxios;
    /**
     * Get transformation hooks from options
     */
    private getTransform;
    /**
     * Get the underlying axios instance
     */
    getAxios(): AxiosInstance;
    /**
     * Reconfigure the axios instance
     */
    configAxios(config: CreateAxiosOptions): void;
    /**
     * Set default headers for all requests
     */
    setHeader(headers: Record<string, string>): void;
    /**
     * Set up request/response interceptors
     */
    private setupInterceptors;
    supportFormData(config: AxiosRequestConfig): any;
    /**
     * GET request
     */
    get<T = any>(config: AxiosRequestConfig, options?: RequestOptions): Promise<T>;
    /**
     * POST request
     */
    post<T = any>(config: AxiosRequestConfig, options?: RequestOptions): Promise<T>;
    /**
     * PUT request
     */
    put<T = any>(config: AxiosRequestConfig, options?: RequestOptions): Promise<T>;
    /**
     * DELETE request
     */
    delete<T = any>(config: AxiosRequestConfig, options?: RequestOptions): Promise<T>;
    /**
     * Generic request method
     */
    request<T = any>(config: AxiosRequestConfig, options?: RequestOptions): Promise<T>;
}

/**
 * Create an axios instance with custom configuration
 * @param opt Additional axios options to override defaults
 * @returns VAxios instance
 */
declare function createAxios(opt?: Partial<CreateAxiosOptions>): VAxios;

export { createAxios as uironRequest };
