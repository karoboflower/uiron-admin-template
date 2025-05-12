/* eslint-disable regexp/no-unused-capturing-group */
import { trim } from './validate';
import xss from 'xss';
/**
 * @description 表单正则校验
 */

export const bankCardRule = [
  {
    required: true,
    message: '仅支持数字',
    validator: (rule, value, callback) => {
      if (!/^\d+$/.test(trim(value))) {
        return callback(new Error('仅支持数字'));
      }
      callback();
    },
    trigger: 'blur',
  },
];

export const idCardRule = [
  {
    required: true,
    message: '只支持数字、大写字母且6-18位数',
    pattern: /^[0-9A-Z]{6,18}$/,
    trigger: 'blur',
  },
];

export const moneyRule = [
  {
    required: true,
    message: '数值区间在0.01-9999999.99',
    pattern: /^(?!0+(?:\.0+)?$)(?:999|999.0|999.00|\d{1,9}(?:\.\d{1,2})?)$/,
    trigger: 'change',
  },
];

export const percentRule = [
  {
    required: true,
    message: '数值区间在0-100,且最多2位小数',
    pattern: /^(0|100|([1-9]\d?)|(0|[1-9]\d?)(\.\d{1,2}))?$/,
    trigger: 'change',
  },
];

// 改用 validateTwoDecimalPositiveNumber
export const moneyOther = [
  {
    required: true,
    message: '格式错误,只支持正数,且最多2位小数',
    pattern: /^[1-9](\d+)?(?:\.\d{1,2})?$|^0$|^\d\.\d{1,2}$/,
    trigger: 'change',
  },
];

export const moneyOtherWithoutRequired = [
  {
    required: false,
    message: '格式错误,只支持正数,且最多2位小数',
    pattern: /^[1-9](\d+)?(?:\.\d{1,2})?$|^0$|^\d\.\d{1,2}$/,
    trigger: 'change',
  },
];
// 文本校验规则
// export const textRule = [
//   {
//     required: true,
//     message: '描述不能为空',
//     trigger: 'change'
//   }
// ];
export const normalRule = [
  { required: true, message: '数值区间在0-999999999', pattern: /^\d{1,9}$/, trigger: 'change' },
];
export const normalRuleWithoutRequired = [
  { required: false, message: '数值区间在0-999999999', pattern: /^\d{1,9}$/, trigger: 'change' },
];

export const numberGtOneRule = [
  { required: true, message: '请输入大于0的数字', pattern: /^[1-9]\d*$/, trigger: 'change' },
];
export const numberGtOneRuleWithoutRequired = [
  { required: false, message: '请输入大于0的数字', pattern: /^[1-9]\d*$/, trigger: 'change' },
];

export const numberRule = [
  { required: true, message: '请输入1-99之间的数字', pattern: /^[1-9]\d?$/, trigger: 'change' },
];
export const requiredRule = [{ required: true, message: '该项不能为空', trigger: 'change' }];
export const phoneRule = (required = true) => ({
  required,
  message: '手机号格式错误',
  // pattern: /^(?:(?:\+|00)86)?1[3-9]\d{9}$/,
  pattern: /\d+/,
  trigger: 'blur',
});
export const textRule = (required = true) => [
  ...(required ? requiredRule : []),
  ...[
    {
      message: '不能输入特殊字符\\/^$*{}()\'"`且最长50个字符',
      pattern: /^[^\\/^$*{}()'"`]{0,50}$/,
      trigger: 'change',
    },
  ],
];
export const remarkRule = (required = true) => [
  ...(required ? requiredRule : []),
  ...[
    { message: '不能输入特殊字符\\/^$*{}()\'"`且最长50个字符', pattern: /^[^\\/^$*{}()'"`]{0,256}$/, trigger: 'blur' },
  ],
];
export const nameRule = (required = true) => [
  ...(required ? requiredRule : []),
  ...[{ message: '只能输入英文和数字，且最长50个字符', pattern: /^[a-z0-9]{0,50}$/i, trigger: 'change' }],
];
export const IDRule = (required = true) => [
  ...(required ? requiredRule : []),
  ...[{ message: '只支持数字、大小写中英文', pattern: /^[0-9A-Z]*$/i, trigger: 'change' }],
];
// 校验url链接
export const urlRule = (required = true) => [
  ...(required ? requiredRule : []),
  ...[{ message: 'url格式不正确，请重新输入', pattern: /^(https?|ftp):\/\/[^\s/$.?#].\S*$/i, trigger: 'change' }],
];
// 校验视频格式,通过后缀
export const isVideo = (file) => /\.(mp4|avi|wmv|flv|ogm|mpg|webm|ogv|mov|asx|mpeg)$/.test(file.name?.toLowerCase());

// 校验图片格式
export const isImage = (file) =>
  /\.(gif|png|jpg|jpeg|webp|svg|psd|bmp|tif|pjpeg|apng|pjp)$/.test(file.name?.toLowerCase());

// 校验excel格式，通过文件类型
export const isSheet = (file) => /\.(xls|xlsx)$/.test(file.name?.toLowerCase());

// 判断是否为数值
export function isPositiveInteger(str: string) {
  return /^\d+$/.test(str);
}

export interface ValidationResult {
  isValid: boolean;
  message: string;
}

export interface ValidateInput {
  type:
    | 'textarea'
    | 'password'
    | 'phone'
    | 'remark'
    | 'twoDecimalPositiveNumber'
    | 'positiveNumber'
    | 'textareaRemoveChinese'
    | 'positiveNumber0To99'
    | 'positiveNumber0To100';
  len?: number;
  emptyTips?: string;
  required?: boolean;
}

// 大小写英文、数字、空格、特殊字符
const allowedTextCharacters = /^[\w\s\-【】（）()「」[\]\\|*,.]*$/;
// 中文,大小写英文、数字、空格、特殊字符
const allChineseTextCharacters = /^[\w\s\-【】（）()「」[\]\\|*,.\u4E00-\u9FA5]*$/;

/**
 * @description 输入校验器，根据不同的输入类型进行校验，建议以后所有的校验都统一走这个入口
 * @export
 * @class InputValidator
 */
export class InputValidator {
  // 普通文本框和textarea 校验：仅允许部分特定字符
  static validateTextarea(input: string): ValidationResult {
    if (!allChineseTextCharacters.test(input)) {
      return { isValid: false, message: '输入包含非法字符，仅允许字母、数字、中文和指定的特殊字符' };
    }

    return { isValid: true, message: '' };
  }

  // 普通文本框，不需要中文
  static validateTextareaRemoveChinese(input: string): ValidationResult {
    if (!allowedTextCharacters.test(input)) {
      return { isValid: false, message: '输入包含非法字符，仅允许字母、数字、空格和指定的特殊字符' };
    }

    return { isValid: true, message: '' };
  }

  // password 校验：要求字母和数字
  static validatePassword(input: string): ValidationResult {
    const hasSmallLetter = /[a-z]/.test(input);
    const hasBigLetter = /[A-Z]/.test(input);
    const hasNumber = /\d/.test(input);
    if (!hasBigLetter || !hasNumber || !hasSmallLetter) {
      return { isValid: false, message: '密码必须包含至少一个大写字母、小写字母和一个数字' };
    }
    if (input.length < 10) {
      return { isValid: false, message: '密码长度不能低于 10 位' };
    }
    return { isValid: true, message: '' };
  }

  // phone 校验: 仅允许数字 和 -
  static validatePhone(input: string): ValidationResult {
    const allowedCharacters = /^[\d-]*$/;
    if (!allowedCharacters.test(input)) {
      return { isValid: false, message: '格式错误,只支持数字和-' };
    }
    return { isValid: true, message: '' };
  }

  // 备注校验：允许所有字符，但是过滤 html 标签，通过 DOMPurify 过滤
  static validateRemark(input: string): ValidationResult {
    const cleanInput = xss(input) || input;
    // debugger;
    if (cleanInput !== input) {
      return { isValid: false, message: '输入不能包含 html 标签' };
    }
    return { isValid: true, message: '' };
  }

  // 数字 校验： 只支持正数和最多两位小数
  static validateTwoDecimalPositiveNumber(input: string): ValidationResult {
    const allowedCharacters = /^[1-9](\d+)?(?:\.\d{1,2})?$|^0$|^\d\.\d{1,2}$/;
    if (!allowedCharacters.test(input)) {
      return { isValid: false, message: '格式错误,只支持正数,且最多2位小数' };
    }
    return { isValid: true, message: '' };
  }

  // 数字 校验： 只支持正整数
  static validatePositiveNumber(input: string): ValidationResult {
    const allowedCharacters = /^[1-9]\d*$/;
    if (!allowedCharacters.test(input)) {
      return { isValid: false, message: '请输入大于0的正整数' };
    }
    return { isValid: true, message: '' };
  }

  // 数字校验： 只支持正整数，限定范围 0-99
  static validatePositiveNumber0To99(input: string): ValidationResult {
    const allowedCharacters = /^\d{0,2}$/;
    if (!allowedCharacters.test(input)) {
      return { isValid: false, message: '请输入1-99之间的数字' };
    }
    return { isValid: true, message: '' };
  }

  // 数字校验： 只支持正整数，限定范围 0-100,并支持两位小数
  static validatePositiveNumber0To100(input: string): ValidationResult {
    const allowedCharacters = /^(0|100|([1-9]\d?)|(0|[1-9]\d?)(\.\d{1,2}))?$/;
    if (!allowedCharacters.test(input)) {
      return { isValid: false, message: '请输入数值区间在0-100,且最多2位小数' };
    }
    return { isValid: true, message: '' };
  }

  // ---------------------------------------------------------------------------
  // 总体校验入口，根据不同的类型调用相应的校验
  /**
   * @description 根据不同的输入类型进行校验
   * @static
   * @param {string} type 输入类型
   * @param {string} len 限制长度
   * @return {*}
   * @memberof InputValidator
   */

  static validateInput({ type, len, emptyTips, required = true }: ValidateInput) {
    return (rule: any, value: string, callback: (error?: Error | null) => void) => {
      if (value !== '' && value !== null && value !== undefined) {
        if (len && value.length > len) {
          return callback(new Error(`输入长度不能超过${len}个字符`));
        }
      } else {
        if (emptyTips && required) {
          return callback(new Error(`${emptyTips}`));
        }
        if (!required) {
          return callback();
        }
      }

      let result: ValidationResult;

      switch (type) {
        case 'textarea':
          result = this.validateTextarea(value);
          break;
        case 'password':
          result = this.validatePassword(value);
          break;
        case 'phone':
          result = this.validatePhone(value);
          break;
        case 'remark':
          result = this.validateRemark(value);
          break;
        case 'twoDecimalPositiveNumber':
          result = this.validateTwoDecimalPositiveNumber(value);
          break;
        case 'textareaRemoveChinese':
          result = this.validateTextareaRemoveChinese(value);
          break;
        case 'positiveNumber':
          result = this.validatePositiveNumber(value);
          break;
        case 'positiveNumber0To99':
          result = this.validatePositiveNumber0To99(value);
          break;
        case 'positiveNumber0To100':
          result = this.validatePositiveNumber0To100(value);
          break;
        default:
          result = { isValid: true, message: '' };
      }

      if (!result.isValid) {
        callback(new Error(result.message));
      } else {
        callback();
      }
    };
  }
}

// 快速使用
interface ValidateBaseParams {
  required: boolean;
  emptyTips?: string;
}

// 当 required 为 true 是，emptyTips 必传
type ValidateParams<T extends boolean> = T extends true ? Required<ValidateBaseParams> : ValidateBaseParams;

/*
 * 以下是快速使用的校验方法
 * 用法示例：
 * export const rules = {
 *  phone: [validatePhone<true>({ required: true, emptyTips: '手机号不能为空' })],
 *  password: [validatePassword<false>({ required: false})],
 */

export const validatePhone = <T extends boolean>({ required, emptyTips }: ValidateParams<T>) => ({
  required,
  validator: InputValidator.validateInput({
    type: 'phone',
    emptyTips: emptyTips || '手机号不能为空',
    required,
  }),
  trigger: 'change',
});

export const validatePassword = <T extends boolean>({ required, emptyTips }: ValidateParams<T>) => ({
  required,
  validator: InputValidator.validateInput({
    type: 'password',
    emptyTips: emptyTips || '密码不能为空',
    required,
  }),
  trigger: 'change',
});

export const validateTwoDecimalPositiveNumber = <T extends boolean>({ required, emptyTips }: ValidateParams<T>) => ({
  required,
  validator: InputValidator.validateInput({
    type: 'twoDecimalPositiveNumber',
    emptyTips: emptyTips || '此项不能为空',
    required,
  }),
  trigger: 'change',
});

export const validateRemark = <T extends boolean>({ required, emptyTips }: ValidateParams<T>) => ({
  required,
  validator: InputValidator.validateInput({
    type: 'remark',
    emptyTips: emptyTips || '备注不能为空',
    required,
  }),
  trigger: 'change',
});

export const validateTextarea = <T extends boolean>({ required, emptyTips }: ValidateParams<T>) => ({
  required,
  validator: InputValidator.validateInput({
    type: 'textarea',
    emptyTips: emptyTips || '此项不能为空',
    required,
  }),
  trigger: 'change',
});

export const validateTextareaRemoveChinese = <T extends boolean>({ required, emptyTips }: ValidateParams<T>) => ({
  required,
  validator: InputValidator.validateInput({
    type: 'textareaRemoveChinese',
    emptyTips: emptyTips || '此项不能为空',
    required,
  }),
  trigger: 'change',
});

export const validatePositiveNumber = <T extends boolean>({ required, emptyTips }: ValidateParams<T>) => ({
  required,
  validator: InputValidator.validateInput({
    type: 'positiveNumber',
    emptyTips: emptyTips || '此项不能为空',
    required,
  }),
  trigger: 'change',
});

export const validatePositiveNumber0To99 = <T extends boolean>({ required, emptyTips }: ValidateParams<T>) => ({
  required,
  validator: InputValidator.validateInput({
    type: 'positiveNumber0To99',
    emptyTips: emptyTips || '此项不能为空',
    required,
  }),
  trigger: 'change',
});

export const validatePositiveNumber0To100 = <T extends boolean>({ required, emptyTips }: ValidateParams<T>) => ({
  required,
  validator: InputValidator.validateInput({
    type: 'positiveNumber0To100',
    emptyTips: emptyTips || '此项不能为空',
    required,
  }),
  trigger: 'change',
});
