export default function (): Record<string, any> {
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