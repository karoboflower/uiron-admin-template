<h1 align="center">✨@uiron/lint-config✨</h1>

<p align="center">
    <a href="https://www.npmjs.com/package/@uiron/lint-config">
        <img src="https://img.shields.io/npm/v/@uiron/lint-config?style=for-the-badge&colorA=363a4f&colorB=a6da95" alt="NPM version">
    </a>
    <a href="https://github.com/karoboflower/uiron-admin-template/blob/main/LICENSE">
        <img src="https://img.shields.io/github/license/karoboflower/uiron-admin-template?style=for-the-badge&colorA=363a4f&colorB=a6da95" alt="License">
    </a>
</p>

<h2 align="center">
<sub> >_ Unified lint configuration for Uiron projects</sub>
</h2>

## 📦 Installation

```bash
# npm
npm install @uiron/lint-config -D

# pnpm
pnpm add @uiron/lint-config -D
```

## 🛠️ Setup

### Commitlint Setup
1. Install dependencies:
```bash
pnpm add commitlint @commitlint/cli -D
```

2. Create `commitlint.config.cjs`:
```js
const { commitlintConfig } = require('@uiron/lint-config');

module.exports = commitlintConfig();
```

### ESLint Setup
1. Install dependencies:
```bash
pnpm add eslint @antfu/eslint-config eslint-plugin-format -D
```

2. Create `eslint.config.mjs`:
```js
import process from 'node:process';
import antfu from '@antfu/eslint-config';
import { eslintConfig } from '@uiron/lint-config';
const dev = process.env?.NODE_ENV;
export default antfu({
  ...eslintConfig(),
  ...{
    rule: {
      'no-console': dev === 'production' ? 'warn' : 'off',
      'no-debugger': dev === 'production' ? 'warn' : 'off',
    },
  },
});
```

### Prettier Setup
1. Install dependencies:
```bash
pnpm add prettier -D
```

2. Create `prettier.config.cjs`:
```js
const { prettierConfig } = require('@uiron/lint-config');

module.exports = prettierConfig();

```

## 📝 VS Code Settings

Add the following to your `settings.json`:

```json
{
  "prettier.enable": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "editor.formatOnSave": true,
  "eslint.runtime": "node",
  "npm.packageManager": "pnpm",
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact",
    "vue",
    "html",
    "markdown",
    "json",
    "jsonc",
    "yaml",
    "toml",
    "xml",
    "gql",
    "graphql",
    "astro",
    "svelte",
    "css",
    "less",
    "scss",
    "pcss",
    "postcss"
  ]
}
```
## 📝 Recommend
dependencies 
```bash
pnpm add  husky lint-staged -D
```
package.json  
```json
{
    "scripts": {
    "lint:fix": "eslint --fix --ext .js,.ts,.vue,.jsx,.tsx,.json,.md src/",
    "lint": "eslint --ext .js,.ts,.vue src/",
    "prettier": "prettier --write src",
    "beautify": "pnpm run lint:fix && \\ pnpm run prettier"
    },
     "lint-staged": {
      "*.{js,ts,vue,jsx,tsx,json,css,scss,less,mjs,md}": [
      "eslint --fix --ext .js,.ts,.vue,.jsx,.tsx,.json,.md",
      "prettier --write"
    ]
  }
}
```
commit-msg

```js
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

pnpm  commitlint --config commitlint.config.cjs --edit "${1}"
```
pre-commit

```js
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx  lint-staged 
```

## 📄 License

[MIT LICENSE](../../LICENSE)
