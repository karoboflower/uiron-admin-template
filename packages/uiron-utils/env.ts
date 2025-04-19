import type { GlobEnvConfig } from '#/config';

import { warn } from './log';
import { getConfigFileName } from '../../build/getConfigFileName';
import pkg from '../../package.json';

export function getCommonStoragePrefix() {
  const { VITE_GLOB_APP_SHORT_NAME } = getAppEnvConfig();
  return `${VITE_GLOB_APP_SHORT_NAME}__${getEnv()}`.toUpperCase();
}

// Generate cache key according to version
export function getStorageShortName() {
  return `${getCommonStoragePrefix()}${`__${pkg.version}`}__`.toUpperCase();
}

export function getAppEnvConfig() {
  const ENV_NAME = getConfigFileName(import.meta.env);

  const ENV = (import.meta.env.DEV
    ? // Get the global configuration (the configuration will be extracted independently when packaging)
      (import.meta.env as unknown as GlobEnvConfig)
    : window[ENV_NAME as any]) as unknown as GlobEnvConfig;

  const {
    VITE_GLOB_APP_TITLE,
    VITE_GLOB_API_URL,
    VITE_GLOB_APP_SHORT_NAME,
    VITE_GLOB_API_URL_PREFIX,
    VITE_GLOB_UPLOAD_URL,
    VITE_GLOB_APP_ID,
    VITE_GLOB_OUTPUT_DIR,
    VITE_GLOB_ORGANIZATION_ID_LIST,
  } = ENV || {};

  if (!/^[a-z_]*$/i.test(VITE_GLOB_APP_SHORT_NAME)) {
    warn(
      `VITE_GLOB_APP_SHORT_NAME Variables can only be characters/underscores, please modify in the environment variables and re-running.`,
    );
  }

  return {
    VITE_GLOB_APP_TITLE,
    VITE_GLOB_API_URL: isProdMode() ? window?.IPConfig?.baseURL : VITE_GLOB_API_URL,
    VITE_GLOB_APP_SHORT_NAME,
    VITE_GLOB_API_URL_PREFIX,
    VITE_GLOB_UPLOAD_URL: isProdMode() ? window?.IPConfig?.uploadUrl : VITE_GLOB_UPLOAD_URL,
    VITE_GLOB_APP_ID,
    VITE_GLOB_OUTPUT_DIR: VITE_GLOB_OUTPUT_DIR || 'dist',
    VITE_GLOB_ORGANIZATION_ID_LIST,
  };
}

/**
 * @description: Development model
 */
export const devMode = 'development';

/**
 * @description: Production mode
 */
export const prodMode = 'production';

export const alProdMode = 'anlv';

/**
 * @description: Get environment variables
 * @returns:
 * @example:
 */
export function getEnv(): string {
  return import.meta.env.MODE;
}
export function getMode(): string {
  return import.meta.env.VITE_ENV;
}

/**
 * @description: Is it a development mode
 * @returns:
 * @example:
 */
export function isDevMode(): boolean {
  return import.meta.env.DEV;
}

/**
 * @description: Is it a production mode
 * @returns:
 * @example:
 */
export function isProdMode(): boolean {
  return getEnv() === prodMode;
}

export function isAnlvMode(): boolean {
  return getMode() === alProdMode;
}
