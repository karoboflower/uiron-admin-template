function index$2 () {
    return {
      rules: {
        'commit-rule': [2, 'always'],
      },
      plugins: [
        {
          rules: {
            'commit-rule': ({ header }) => {
              return [
                /(?:build|ci|docs|feat|fix|bug)\(\d{6,9}\).+/.test(header),
                `messages should be like fix(bugid): wch fix xxx bug`,
              ];
            },
          },
        },
      ],
    }
  }

const defaultConfig = {
  stylistic: {
    indent: 2, // 4, or 'tab'
    quotes: 'single', // or 'double'
    semi: true,
  },
  // formatters 配置要和根目录的.prettierrc.js 保持一致
  formatters: {
    prettierOptions: {
      printWidth: 120, // 一行的字符数，如果超过会进行换行，默认为120
      tabWidth: 2, // 一个 tab 代表几个空格数，默认为 2 个
      useTabs: false, // 是否使用 tab 进行缩进，默认为false，表示用空格进行缩减
      singleQuote: true, // 字符串是否使用单引号，默认为 false，使用双引号
      semi: true, // 行尾是否使用分号，默认为true
      trailingComma: 'all', // 是否使用尾逗号
      bracketSpacing: true, // 对象大括号直接是否有空格，默认为 true，效果：{ a: 1 }
      endOfLine: 'auto', // 设置换行符  \n
      arrowParens: 'always', // 箭头函数参数只有一个时是否要有小括号
    },
    markdown: true,
  },
  rules: {
    // https://eslint.vuejs.org/rules/brace-style
    'vue/brace-style': 'off',
    // https://eslint.style/rules/js/brace-style
    'style/brace-style': 'off',
    // https://eslint.style/rules/js/indent
    'style/indent': 'off',
    // https://github.com/antfu/eslint-plugin-antfu/blob/main/src/rules/if-newline.md
    'antfu/if-newline': 'off',
    // 顶级函数是否必须是命名函数
    // https://github.com/antfu/eslint-plugin-antfu/blob/main/src/rules/top-level-function.ts
    'antfu/top-level-function': 'off',
    // https://eslint.vuejs.org/rules/block-order.html#vue-block-order
    'vue/block-order': ['error', { order: ['template', 'script', 'style'] }],
    // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v57.0.0/docs/rules/prefer-includes.md
    'unicorn/prefer-includes': 'off',
    // https://eslint.style/rules/js/arrow-parens
    'style/arrow-parens': ['error', 'always'], // 保持和prettier一致
    // https://eslint.vuejs.org/rules/singleline-html-element-content-newline.html
    'vue/singleline-html-element-content-newline': 'off', // prettier max-len冲突
    // https://eslint.vuejs.org/rules/html-self-closing.html
    'vue/html-self-closing': 'off', // prettier vueIndentScriptAndStyle冲突
    // https://eslint.style/rules/js/operator-linebreak
    'style/operator-linebreak': 'off', // eslint冲突
    // https://eslint.vuejs.org/rules/operator-linebreak.html
    'vue/operator-linebreak': 'off', // eslint冲突
    // https://eslint.style/rules/js/quotes
    'style/quotes': 'off', // stylistic.quote保持一致 prettier去解决
    // https://eslint.org/docs/latest/rules/prefer-template
    'prefer-template': 'off', // singleQuote prettier冲突 //通过写法去解决
    // https://eslint.style/rules/js/quote-props
    'style/quote-props': 'off', // 暂时不开启 和prettier单引号冲突
    // https://eslint.style/rules/plus/indent-binary-ops
    'style/indent-binary-ops': 'off', // 和prettier冲突
    // https://eslint.vuejs.org/rules/html-indent.html
    'vue/html-indent': 'off', // 和prettier冲突
    // https://typescript-eslint.io/rules/no-use-before-define/
    'no-use-before-define': 'off', // 校验减少
    'ts/no-use-before-define': 'off', // 校验减少
    'no-console': dev === 'production' ? 'warn' : 'off',
    'no-debugger': dev === 'production' ? 'warn' : 'off',
    'perfectionist/sort-imports': 'off', // 代码写法控制
    // trailingComma  style/comma-dangle 要保持一直
    // 'style/comma-dangle': 'off',
  },
};

function index$1 (config = {}) {
  // 只给配置rules 
  return {
    ...defaultConfig,
    ...config,
    ...defaultConfig.rules,
    ...config.rules,
  }
}

function index () {
    return {
      printWidth: 120, // 一行的字符数，如果超过会进行换行，默认为120
      tabWidth: 2, // 一个 tab 代表几个空格数，默认为 2 个
      useTabs: false, // 是否使用 tab 进行缩进，默认为false，表示用空格进行缩减
      singleQuote: true, // 字符串是否使用单引号，默认为 false，使用双引号
      semi: true, // 行尾是否使用分号，默认为true
      trailingComma: 'all', // 是否使用尾逗号
      bracketSpacing: true, // 对象大括号直接是否有空格，默认为 true，效果：{ a: 1 }
      endOfLine: 'auto', // 设置换行符  \n
      arrowParens: 'always', // 箭头函数参数只有一个时是否要有小括号
    }
  }

export { index$2 as commitlintConfig, index$1 as eslintConfig, index as prettierConfig };
//# sourceMappingURL=index.js.map
