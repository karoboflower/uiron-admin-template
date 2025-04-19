import dayjs from 'dayjs';

/**
 * 订单显示相关的颜色常量
 */
export const ORDER_COLORS = {
  preOrder: '#FFA500', // 预订单橙色
  normalOrder: '#1890FF', // 普通订单蓝色
};

/**
 * 判断是否为预订单
 * @param expectDeliveryTime 预计送达时间
 * @returns 如果预计送达时间晚于当天24点，则为预订单，返回true；否则返回false
 */
export const isPreOrder = (expectDeliveryTime?: string): boolean => {
  if (!expectDeliveryTime) return false;
  const todayEnd = dayjs().endOf('day');
  return dayjs(expectDeliveryTime).isAfter(todayEnd);
};

/**
 * 获取订单号的显示颜色
 * @param expectDeliveryTime 预计送达时间
 * @returns 预订单返回橙色，普通订单返回蓝色
 */
export const getOrderNumberColor = (expectDeliveryTime?: string): string => {
  return isPreOrder(expectDeliveryTime) ? ORDER_COLORS.preOrder : ORDER_COLORS.normalOrder;
};

/**
 * 获取订单号的显示文本
 * @param number 序号
 * @param expectDeliveryTime 预计送达时间
 * @returns 预订单返回"预#序号"，普通订单返回"#序号"，无序号时返回"-"
 */
export const getOrderNumberText = (number?: string, expectDeliveryTime?: string): string => {
  if (!number) return '-';
  return isPreOrder(expectDeliveryTime) ? `预#${number}` : `#${number}`;
};

/**
 * 格式化订单流水号
 * @param serialNumber 订单流水号
 * @returns 格式化后的订单流水号
 */
export const formatSerialNumber = (serialNumber: string) => {
  if (!serialNumber) return '-';
  // 202504011111120001 -> 20250401-111-112-0001
  const date = serialNumber.slice(0, 8); // 20250401
  const hourMinute = serialNumber.slice(8, 11); // 111
  const second = serialNumber.slice(11, 14); // 112
  const sequence = serialNumber.slice(14); // 0001

  return `${date}-${hourMinute}-${second}-${sequence}`;
};
