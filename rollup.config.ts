import type { PackageManifest } from './meta';
import type { OutputOptions, RollupOptions } from 'rollup';
import type { Options as ESBuildOptions } from 'rollup-plugin-esbuild';
import dts from 'rollup-plugin-dts';
import esbuild from 'rollup-plugin-esbuild';
import { globSync } from 'tinyglobby';
import typescript from '@rollup/plugin-typescript';
const configs: RollupOptions[] = [];
const pluginDts = dts();
function esbuildMinifier(options: ESBuildOptions) {
  const { renderChunk } = esbuild(options);

  return {
    name: 'esbuild-minifier',
    renderChunk,
  };
}

const externals = ['vue', /@vueuse\/.*/];

export function createRollupConfig(pkg: PackageManifest, cwd = process.cwd()) {
  const { globals, external, submodules, iife, build, mjs, dts, target = 'es2018' } = pkg;
  if (build === false) return [];

  const iifeGlobals = {
    vue: 'Vue',
    '@vueuse/shared': 'VueUse',
    '@vueuse/core': 'VueUse',
    ...(globals || {}),
  };

  const iifeName = 'VueUse';
  const functionNames = ['index'];

  if (submodules) {
    functionNames.push(...globSync('*/index.ts', { cwd }).map((i) => i.split('/')[0]));
  }

  for (const fn of functionNames) {
    const input = fn === 'index' ? `index.ts` : `dist/${fn}/index.ts`;
    const output: OutputOptions[] = [];

    if (mjs !== false) {
      output.push({
        file: `dist/${fn}.mjs`,
        format: 'es',
      });
    }

    if (iife !== false) {
      output.push(
        {
          file: `dist/${fn}.iife.js`,
          format: 'iife',
          name: iifeName,
          extend: true,
          globals: iifeGlobals,
          plugins: [],
        },
        {
          file: `dist/${fn}.iife.min.js`,
          format: 'iife',
          name: iifeName,
          extend: true,
          globals: iifeGlobals,
          plugins: [
            esbuildMinifier({
              minify: true,
            }),
          ],
        },
      );
    }

    configs.push({
      input,
      output,
      plugins: [typescript()],
      //external: [...externals, ...(external || [])],
    });

    if (dts !== false) {
      configs.push({
        input,
        output: [{ file: `dist/${fn}.d.mts` }],
        plugins: [pluginDts],
        external: [...externals, ...(external || [])],
      });
    }
  }

  return configs;
}
