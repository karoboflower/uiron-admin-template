import type { BasicKeys } from './cache/persistent';
import { CacheTypeEnum, TOKEN_KEY, USER_INFO_KEY } from '@/enums';
import projectSetting from '@/setting/projectSetting';
import { Persistent } from './cache/persistent';

const { permissionCacheType } = projectSetting;
const isLocal = permissionCacheType === CacheTypeEnum.LOCAL;

// 获取缓存token信息
export function getToken(): string {
  return getAuthCache(TOKEN_KEY);
}

// 获取缓存用户信息
export function getUser() {
  return getAuthCache(USER_INFO_KEY);
}

export function getAuthCache<T>(key: BasicKeys) {
  const fn = isLocal ? Persistent.getLocal : Persistent.getSession;
  return fn(key) as T;
}

export function setAuthCache(key: BasicKeys, value, expire: number | null = null) {
  const fn = isLocal ? Persistent.setLocal : Persistent.setSession;
  return fn(key, value, true, expire);
}

export function clearAuthCache(immediate = true) {
  const fn = isLocal ? Persistent.clearLocal : Persistent.clearSession;
  return fn(immediate);
}
