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

interface CreateAxiosOptions extends AxiosRequestConfig {
    authenticationScheme?: string;
    transform?: AxiosTransform;
    requestOptions?: RequestOptions;
}
declare abstract class AxiosTransform {
    /**
     * @description: Process configuration before request
     * @description: Process configuration before request
     */
    beforeRequestHook?: (config: AxiosRequestConfig, options: RequestOptions) => AxiosRequestConfig;
    /**
     * @description: Request successfully processed
     */
    transformRequestHook?: (res: AxiosResponse<Result>, options: RequestOptions) => any;
    /**
     * @description: 请求失败处理
     */
    requestCatchHook?: (e: Error, options: RequestOptions) => Promise<any>;
    /**
     * @description: 请求之前的拦截器
     */
    requestInterceptors?: (config: AxiosRequestConfig, options: CreateAxiosOptions) => AxiosRequestConfig;
    /**
     * @description: 请求之后的拦截器
     */
    responseInterceptors?: (res: AxiosResponse<any>) => AxiosResponse<any>;
    /**
     * @description: 请求之前的拦截器错误处理
     */
    requestInterceptorsCatch?: (error: Error) => void;
    /**
     * @description: 请求之后的拦截器错误处理
     */
    responseInterceptorsCatch?: (error: Error) => void;
}

/**
 * @description:  axios module
 */
declare class VAxios {
    private axiosInstance;
    private readonly options;
    constructor(options: CreateAxiosOptions);
    /**
     * @description:  Create axios instance
     */
    private createAxios;
    private getTransform;
    getAxios(): AxiosInstance;
    /**
     * @description: Reconfigure axios
     */
    configAxios(config: CreateAxiosOptions): void;
    /**
     * @description: Set general header
     */
    setHeader(headers: any): void;
    /**
     * @description: Interceptor configuration
     */
    private setupInterceptors;
    /**
     * @description:  File Upload
     */
    supportFormData(config: AxiosRequestConfig): any;
    get<T = any>(config: AxiosRequestConfig, options?: RequestOptions): Promise<T>;
    post<T = any>(config: AxiosRequestConfig, options?: RequestOptions): Promise<T>;
    put<T = any>(config: AxiosRequestConfig, options?: RequestOptions): Promise<T>;
    delete<T = any>(config: AxiosRequestConfig, options?: RequestOptions): Promise<T>;
    request<T = any>(config: AxiosRequestConfig, options?: RequestOptions): Promise<T>;
}

declare function export_default(opt?: Partial<CreateAxiosOptions>): VAxios;

export { export_default as uironRequest };
