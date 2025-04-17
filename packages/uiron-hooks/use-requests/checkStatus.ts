/* eslint-disable no-new */
import { error as ElError } from '@/hooks/elementPlus/useMessage';
import { clearAuthCache } from '@/utils/auth';
import { sleep } from '@/utils/tools';
/**
 * @description: 校验错误网络请求状态码
 * @param {number} response
 * @return void
 */

export function checkStatus(response: any, message: string): void {
  if (!response) return;
  console.log('错误响应response: ', response);
  console.log('错误信息message: ', message);
  // 超时报错
  // if (!response && message ) {
  //   ElError('服务器响应超时');
  // }

  // 处理调用接口使用Blob 返回了json错误，无法解析
  if (response.data instanceof Blob) {
    if (response.headers['content-type'].includes('json')) {
      const reader = new FileReader();
      reader.readAsText(response.data);
      reader.onload = () => {
        const { result } = reader;
        const errorInfos = JSON.parse(result as string);
        const { msg } = errorInfos;
        new ElError(`${msg}`);
      };
    }
    return;
  }

  // 返回状态码时
  const { code, msg } = response.data;
  if (code) {
    switch (response.data?.code) {
      case 1701:
        new ElError('串口通信超时');
        return;
      case 1702:
        new ElError('串口忙');
        return;
      case 1703:
        new ElError('串口请求数据错误');
        return;
      case 1705:
        new ElError('锁状态错误');
        return;
      case 1706:
        new ElError('mqtt消息过期');
        return;
      case 1707:
        new ElError('串口效验数据错误');
        return;
      default:
        new ElError(`${code}  ${msg}`);
        return;
    }
  }
  console.log('错误响应response: ', response.data);

  // 后端自定义报错
  if (response.data?.msg) {
    new ElError(response.data.msg);
    return;
  }
  // 根据状态码响应报错
  switch (response.status) {
    case 400:
      new ElError('400：请求错误');
      break;
    case 401:
      new ElError('token已失效,请重新登录');
      sleep(2).then(() => {
        clearAuthCache();
        window.location.reload();
      });
      break;
    case 403:
      new ElError('当前账号无权限访问！');
      break;
    case 404:
      new ElError('你所访问的资源不存在！');
      break;
    case 405:
      new ElError('请求方式错误！请您稍后重试');
      break;
    case 408:
      new ElError('请求超时！请您稍后重试');
      break;
    case 500:
      new ElError('服务器异常！');
      break;
    case 502:
      new ElError('网关错误！');
      break;
    case 503:
      new ElError('服务不可用！');
      break;
    case 504:
      new ElError('网关超时！');
      break;
  }
}
