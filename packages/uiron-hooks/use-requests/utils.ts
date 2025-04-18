export const dealWhiteList = (whiteList: string[], url: string | undefined) => {
  if (!whiteList || !whiteList.length || !url) return false;
  return whiteList.some((item) => item.includes(url));
};
export function deepMerge<T = any>(src: any = {}, target: any = {}): T {
  let key: string;
  for (key in target) {
    src[key] = isObject(src[key]) ? deepMerge(src[key], target[key]) : (src[key] = target[key]);
  }
  return src;
}
export function isObject(val: any): val is Record<any, any> {
  return val !== null && is(val, 'Object');
}

export function is(val: unknown, type: string) {
  return toString.call(val) === `[object ${type}]`;
}
export function isString(val: unknown): val is string {
  return is(val, 'String');
}
export function isFunction(val: unknown): val is Function {
  return typeof val === 'function';
}
