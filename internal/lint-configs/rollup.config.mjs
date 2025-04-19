import { defineConfig } from 'rollup'
import typescript from '@rollup/plugin-typescript';

export default defineConfig([
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/index.mjs',
        format: 'esm'
      },
      {
        file: 'dist/index.cjs',
        format: 'cjs'
      },
      {
        file: 'dist/index.esm.js',
        format: 'esm'
      }
    ],
    sourceMap: false,
    plugins: [
      typescript({
        tsconfig: './tsconfig.json'
      })
    ]
  }
])
