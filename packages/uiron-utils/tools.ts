import { ElMessage } from 'element-plus';
import { omitBy } from 'lodash-es';
import { div, mul } from './decimal';
import { isPositiveInteger } from './pattern';

interface EnumItem {
  value: string;
  label: unknown;
}

/**
 * @description 对象转数组
 * @param _enum const {};
 * @returns any[]
 */
export function mapEnumToOptions(_enum) {
  const options: EnumItem[] = [];
  for (const member in _enum) {
    let value: any = member;
    if (isPositiveInteger(member)) {
      value = Number(member);
    } else if (['true', 'false'].includes(member)) {
      value = member === 'true';
    }
    options.push({
      value,
      label: _enum[member],
    });
  }
  return options;
}

// 根据字段分组
export function groupData(data, filed) {
  const map = {};
  const dest: any[] = [];

  data.forEach((item: any) => {
    if (!map[item[filed]]) {
      dest.push({
        [filed]: item[filed],
        list: [item],
      });
      map[item[filed]] = item;
    } else {
      dest.forEach((dItem: any) => {
        if (dItem[filed] === item[filed]) {
          dItem.list.push(item);
        }
      });
    }
  });
  return dest;
}

// 重新排序数组
export function transpose(array: any[]) {
  if (!array || !array.length) return [];
  const copyArray = [...array];
  const list: any[] = [];
  const half = Math.ceil(copyArray.length / 2);
  const leftHalf = copyArray.splice(0, half);
  const rightHalf = copyArray.splice(-half);

  for (let i = 0; i < leftHalf.length; i++) {
    const left = leftHalf[i];
    const right = rightHalf[i];
    if (left && right) {
      // 偶数
      list.push(left, right);
    } else {
      // 奇数
      list.push(left);
    }
  }
  return list;
}

/**
 * hex颜色转rgb颜色
 * @param str 颜色值字符串
 * @returns 返回处理后的颜色值
 */
export function hexToRgb(str: any) {
  let hexs: any = '';
  const reg = /^#?[0-9A-F]{6}$/i;
  if (!reg.test(str)) return ElMessage.warning('输入错误的hex');
  str = str.replace('#', '');
  hexs = str.match(/../g);
  for (let i = 0; i < 3; i++) hexs[i] = Number.parseInt(hexs[i], 16);
  return hexs;
}

/**
 * rgb颜色转Hex颜色
 * @param r 代表红色
 * @param g 代表绿色
 * @param b 代表蓝色
 * @returns 返回处理后的颜色值
 */
export function rgbToHex(r: any, g: any, b: any) {
  const reg = /^\d{1,3}$/;
  if (!reg.test(r) || !reg.test(g) || !reg.test(b)) return ElMessage.warning('输入错误的rgb颜色值');
  const hexs = [r.toString(16), g.toString(16), b.toString(16)];
  for (let i = 0; i < 3; i++) {
    if (hexs[i].length === 1) hexs[i] = `0${hexs[i]}`;
  }
  return `#${hexs.join('')}`;
}

/**
 * 变浅颜色值
 * @param color 颜色值字符串
 * @param level 加深的程度，限0-1之间
 * @returns 返回处理后的颜色值
 */
export function getLightColor(color: string, level: number) {
  const reg = /^#?[0-9A-F]{6}$/i;
  if (!reg.test(color)) return ElMessage.warning('输入错误的hex颜色值');
  const rgb = hexToRgb(color);
  for (let i = 0; i < 3; i++) rgb[i] = Math.floor((255 - rgb[i]) * level + rgb[i]);
  return rgbToHex(rgb[0], rgb[1], rgb[2]);
}

/**
 * @description 延迟函数，传入一个时间，表示暂停几秒后执行。默认一秒
 * @param time
 * @returns any
 */
export async function sleep(time = 1) {
  return await new Promise((resolve) => setTimeout(resolve, time * 1000));
}

/**
 * @description 比较对象，将obj2中不同于obj1中的属性和值组成新对象返回
 * @param obj1
 * @param obj2
 * @returns any
 */
export function compareObjects(obj1, obj2) {
  const temp = {};
  for (const key in obj1) {
    // eslint-disable-next-line no-prototype-builtins
    if (obj1.hasOwnProperty(key)) {
      if (typeof obj1[key] === 'object') {
        const nestedDiff = compareObjects(obj1[key], obj2[key]);
        if (Object.keys(nestedDiff).length > 0) {
          temp[key] = nestedDiff;
        }
      } else if (obj2[key] !== obj1[key]) {
        temp[key] = obj2[key];
      }
    }
  }
  return temp;
}

// 处理收费规则,单位分,转换为元
export function handleMoney(money: number, init = 0): number {
  if (typeof money === 'undefined') {
    return init;
  }
  if (money <= 0) {
    return 0;
  }
  return div(money, 100);
}

// 金额展示 第一个参数接受值 第二个参数接受除数 第三个参数接受单位
export function getAmount(amount, divisor = 1, unit = '元') {
  if (typeof amount === 'number') {
    if (amount <= 0) {
      return 0 + unit;
    } else {
      return div(amount, divisor) + unit;
    }
  } else {
    return '-';
  }
}

export const roundToTwoDecimalPlaces = (value: number) => {
  // 四舍五入保留两位小数
  const roundedValue = Math.round(value);

  // 如果小于 0.01，则设置为 0.01
  // if (roundedValue < 1) {
  //   roundedValue = 1;
  // }

  return roundedValue;
};

// 处理创建时的收费规则,单位元,转换为分
export function handlePostMoney(money: number, init = 0): number {
  if (typeof money === 'undefined') {
    return init;
  }
  return Number(mul(money, 100));
}

// 根据手续费率和提现金额算出手续费
export function handleFeeRateToFee(money: number, rate: number): number {
  if (+rate === 0) return 0;
  if (typeof money === 'undefined') {
    return 0;
  }
  const temp = Number(mul(money, div(rate, 100, 100)));
  // 最小一分钱
  // return temp < 1 ? 1 : temp;
  return temp;
}

export const isFalsy = (value) => (value === 0 ? false : !value);
export const isVoid = (value) => value === undefined || value === null || value === '';

export const cleanObject = (object) => {
  if (!object) {
    return {};
  }
  const result = { ...object };
  Object.keys(result).forEach((key) => {
    const value = result[key];
    if (isVoid(value)) {
      delete result[key];
    }
  });
  return result;
};

/**
 * 检查是否是保留指定小数位的数字
 * @param val
 * @param digit 精度
 */
export function isDecimal(val: number | string, digit = 2) {
  const reg = new RegExp(`^[0-9]+[.]?[0-9]{0,${digit}}$`, 'g');
  return reg.test(String(val));
}

export function hasDecimalPoint(numStr: number | string) {
  return /\./.test(String(numStr));
}

// 解析参数
export function getUrlParam(url: string) {
  const theRequest = {};
  if (url.indexOf('#') !== -1) {
    const str = url.split('#')[1];
    const strs = str.split('&');
    for (let i = 0; i < strs.length; i++) {
      theRequest[strs[i].split('=')[0]] = decodeURI(strs[i].split('=')[1]);
    }
  } else if (url.indexOf('?') !== -1) {
    const str = url.split('?')[1];
    const strs = str.split('&');
    for (let i = 0; i < strs.length; i++) {
      theRequest[strs[i].split('=')[0]] = decodeURI(strs[i].split('=')[1]);
    }
  }
  return theRequest;
}
/*
 * 用来获取url中的所有参数
 */
export const getQueryParams = <T = any>(url: string) => {
  url = decodeURIComponent(url);
  const arr1 = url.split('?');
  const obj = {};
  if (arr1.length > 1) {
    const index = arr1[1].indexOf('#');
    arr1[1] = index === -1 ? arr1[1] : arr1[1].slice(0, index);
    const arr2 = arr1[1].split('&');
    for (let i = 0; i < arr2.length; i++) {
      const curArr: string[] = arr2[i].split('=');
      obj[curArr[0]] = decodeURIComponent(curArr[1]);
    }
  }
  return obj as T;
};

// 过滤对象中键值为undefined null 或者空字符串的键
export function omitByValues(obj, values = ['', undefined]) {
  return omitBy(obj, (item) => {
    return values.includes(item);
  });
}
