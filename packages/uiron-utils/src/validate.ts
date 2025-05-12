/* eslint-disable regexp/no-unused-capturing-group */
export const isExternal = (path: string) => /^(https?:|mailto:|tel:)/.test(path);

export const isPhone = (phone) => {
  if (!phone) {
    return false;
  }
  const reg = /^(?:(?:\+|00)86)?1\d{10}$/;
  return reg.test(trim(phone));
};

// 去掉字符串中所有空格(包括中间空格,需要设置第2个参数为:true)
export function trim(str, isGlobal = true) {
  if (!str) {
    return str;
  }

  const result = str.replace(/(^\s+)|(\s+$)/g, '');
  return isGlobal ? result.replace(/\s/g, '') : result;
}

// 每4位数字空格隔开
export function format4Space(str: string): string {
  return str
    .replace(/\s/g, '')
    .replace(/\D/g, '')
    .replace(/(\d{4})(?=\d)/g, '$1 ');
}

// 每1位数字空格隔开
export function format1Space(str: string): string {
  return str
    .replace(/\s/g, '')
    .replace(/\D/g, '')
    .replace(/(\d)(?=\d)/g, '$1 ');
}

// 443格式
export function format4Space4Phone(phone) {
  const regPhone = phone.replace(/\D/g, '').substring(0, 11);
  const phoneLen = regPhone.length;

  if (phoneLen > 3 && phoneLen < 8) {
    return regPhone.replace(/^(...)/g, '$1 ');
  }

  if (phoneLen >= 8) {
    return regPhone.replace(/^(...)(....)/g, '$1 $2 ');
  }

  return regPhone;
}

// 手机号码格式转化为 344 格式 （188 3886 9199）
export function to344Phone(phone: string): string {
  const tel = trim(phone);
  if (isPhone(tel)) {
    return tel.replace(/^(.{3})(.*)(.{4})$/, '$1 $2 $3');
  }

  return tel;
}
