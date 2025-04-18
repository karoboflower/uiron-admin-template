/* eslint-disable no-new */
import { ElMessage } from 'element-plus';
/**
 * @description: 校验错误网络请求状态码
 * @param {number} response
 * @return void
 */
/**
 * Default error messages for HTTP status codes
 */
const defaultErrorMessages: Record<number, string> = {
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
export function checkStatus(response: any, message: string): void {
  if (!response) return;
  // 后端自定义报错
  if (response.data?.msg) {
    ElMessage.error(response.data.msg);
    return;
  }
  if(defaultErrorMessages[response.status]) {
    ElMessage.error(defaultErrorMessages[response.status]);
  }
}
