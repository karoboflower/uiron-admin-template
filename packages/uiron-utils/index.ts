import type { RouteLocationNormalized, RouteRecordNormalized } from 'vue-router';

import { isObject } from './is';

export const noop = () => {};

/**
 * @description:  Set ui mount node
 */
export function getPopupContainer(node?: HTMLElement): HTMLElement {
  return (node?.parentNode as HTMLElement) ?? document.body;
}

/**
 * Add the object as a parameter to the URL
 * @param baseUrl url
 * @param obj
 * @returns {string}
 * eg:
 *  let obj = {a: '3', b: '4'}
 *  setObjToUrlParams('www.baidu.com', obj)
 *  ==>www.baidu.com?a=3&b=4
 */
export function setObjToUrlParams(baseUrl: string, obj: any): string {
  let parameters = '';
  for (const key in obj) {
    parameters += key + '=' + encodeURIComponent(obj[key]) + '&';
  }
  parameters = parameters.replace(/&$/, '');
  return /\?$/.test(baseUrl) ? baseUrl + parameters : baseUrl.replace(/\/?$/, '?') + parameters;
}

export function deepMerge<T = any>(src: any = {}, target: any = {}): T {
  let key: string;
  for (key in target) {
    src[key] = isObject(src[key]) ? deepMerge(src[key], target[key]) : (src[key] = target[key]);
  }
  return src;
}

export function openWindow(
  url: string,
  opt?: {
    target?: TargetContext | string;
    noopener?: boolean;
    noreferrer?: boolean;
  },
) {
  const { target = '__blank', noopener = true, noreferrer = true } = opt || {};
  const feature: string[] = [];

  noopener && feature.push('noopener=yes');
  noreferrer && feature.push('noreferrer=yes');

  window.open(url, target, feature.join(','));
}

// dynamic use hook props
export function getDynamicProps<T, U>(props: T): Partial<U> {
  const ret: Recordable = {};

  // eslint-disable-next-line array-callback-return
  Object.keys(props).map((key) => {
    ret[key] = unref((props as Recordable)[key]);
  });

  return ret as Partial<U>;
}

export function getRawRoute(route: RouteLocationNormalized): RouteLocationNormalized {
  if (!route) return route;
  const { matched, ...opt } = route;
  return {
    ...opt,
    matched: (matched
      ? matched.map((item) => ({
          meta: item.meta,
          name: item.name,
          path: item.path,
        }))
      : undefined) as RouteRecordNormalized[],
  };
}

export const withInstall = <T>(component: T, alias?: string) => {
  const comp = component as any;
  comp.install = (app: App) => {
    app.component(comp.name || comp.displayName, component);
    if (alias) {
      app.config.globalProperties[alias] = component;
    }
  };
  return component as T & Plugin;
};

export const exportExcel = (data: Blob, title: string) => {
  const fileName = title;
  const dom = document.createElement('a');
  const url = window.URL.createObjectURL(data);
  dom.href = url;
  dom.download = decodeURI(fileName);
  dom.style.display = 'none';
  document.body.appendChild(dom);
  dom.click();
  dom?.parentNode?.removeChild(dom);
  window.URL.revokeObjectURL(url);
};

export const shallowEqual = (objA: any, objB: any) => {
  // 如果两个对象是同一个引用，则相等
  if (Object.is(objA, objB)) {
    return true;
  }

  // 如果任一参数不是对象或是 null，则不相等
  if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) {
    return false;
  }

  // 获取两个对象的属性键
  const keys1 = Object.keys(objA);
  const keys2 = Object.keys(objB);

  // 如果两个对象的键数量不同，则不相等
  if (keys1.length !== keys2.length) {
    return false;
  }

  // 比较两个对象的每个键和值
  for (const key of keys1) {
    if (!Object.is(objA[key], objB[key])) {
      return false;
    }
  }

  // 如果所有键和值都相等，则两个对象相等
  return true;
};

/**
 * @description: 用于递归 trim 字符串，递归处理对象和数组
 */

const DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm';

export const deepTrim = (obj: Record<string, any>, formatDateFlag = false) => {
  // 判断是否是对象（包括数组），且非 null
  if (obj !== null && typeof obj === 'object') {
    // 如果是数组，遍历数组元素
    if (Array.isArray(obj)) {
      return obj.map((item) => deepTrim(item, formatDateFlag)); // 递归处理每个数组元素
    }

    // 如果是对象，遍历其属性
    const result = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = obj[key];

        if (value && value._isAMomentObject && formatDateFlag) {
          result[key] = value.format(DATE_TIME_FORMAT);
        }

        if (typeof value === 'string') {
          // 对字符串类型进行 trim 操作
          result[key] = value.trim();
        } else if (value !== null && typeof value === 'object') {
          // 对嵌套的对象递归调用 deepTrim
          result[key] = deepTrim(value);
        } else {
          // 其他类型直接赋值
          result[key] = value;
        }
      }
    }
    return result;
  }

  // 如果不是对象或数组，直接返回原始值
  return obj;
};

/**
 * 循环请求方法
 * @param {Function} requestFn - 发起请求的函数，需返回一个 Promise。
 * @param {Function} conditionFn - 判断是否中断循环的函数，接受请求结果作为参数，返回 true 则中断，返回 false 继续循环。
 * @param {number} paramFn
 * @param {number} interval - 每次请求间隔时间（毫秒）。
 * @returns {Promise<{ allResults: any[], finalResult: any }>} - 返回所有请求结果和最终符合条件的结果。
 */
export async function loopRequest(requestFn, conditionFn, paramFn, interval = 1000) {
  if (typeof requestFn !== 'function' || typeof conditionFn !== 'function') {
    throw new TypeError('requestFn 和 conditionFn 都必须是函数');
  }

  let totalData: any[] = []; // 用于存储每次请求的结果
  let index = 0; // 当前循环的索引

  async function executeLoop() {
    try {
      const params = paramFn(index); // 生成当前请求的参数
      const result = await requestFn(params);
      result.data && (totalData = [...totalData, ...result.data]);

      if (conditionFn(result, totalData)) {
        return totalData;
      }

      index += 1;
      await new Promise((resolve) => setTimeout(resolve, interval)); // 等待间隔时间
      return executeLoop(); // 递归调用
    } catch (error: any) {
      throw new Error(`请求失败: ${error.message}`);
    }
  }

  return executeLoop();
}
