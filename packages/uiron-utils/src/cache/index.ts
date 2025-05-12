import type { CreateStorageParams } from './storageCache';
import { DEFAULT_CACHE_TIME, enableStorageEncryption } from '@/setting/encryptionSetting';
import { getStorageShortName } from './env';
import { createStorage as create } from './storageCache';

export type Options = Partial<CreateStorageParams>;

const createOptions = (storage: Storage, options: Options = {}): Options => {
  return {
    // No encryption in debug mode
    hasEncrypt: enableStorageEncryption,
    storage,
    prefixKey: getStorageShortName(),
    ...options,
  };
};

export const WebStorage = create(createOptions(sessionStorage));

export const createStorage = (storage: Storage = sessionStorage, options: Options = {}) => {
  return create(createOptions(storage, options));
};

export const createSessionStorage = (options: Options = {}) => {
  return createStorage(sessionStorage, {
    timeout: DEFAULT_CACHE_TIME,
    ...options,
  });
};

export const createLocalStorage = (options: Options = {}) => {
  return createStorage(localStorage, {
    timeout: DEFAULT_CACHE_TIME,
    ...options,
  });
};

export default WebStorage;
