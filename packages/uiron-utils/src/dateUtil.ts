import type { TimeArr } from '#/utils';
import dayjs from 'dayjs';

// 常量
export const DATE_YEAR = 'YYYY';
export const DATE_YEAR_MONTH = 'YYYY-MM';
export const DATE_FORMAT = 'YYYY-MM-DD';
export const DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm';
export const DATE_TIME_SECOND = 'YYYY-MM-DD HH:mm:ss';

// 根据日期类型显示日期格式
export const formatDateType = (row) => {
  let type;
  switch (row.date_type) {
    case 2:
      type = DATE_YEAR_MONTH;
      break;
    case 3:
      type = DATE_YEAR;
      break;
    default:
      type = DATE_FORMAT;
      break;
  }
  return formatUnix(row.date, type);
};

export function format(date, fmt = DATE_TIME_SECOND): string {
  if (!date) {
    return date;
  }
  return dayjs(date).format(fmt);
}

// 格式化日期时间
export function formatToDateTime(date, format = DATE_TIME_FORMAT): string {
  if (!date) {
    return '';
  }
  return dayjs(date).format(format);
}
// 格式化日期
export function formatToDate(date, format = DATE_FORMAT): string {
  if (!date) {
    return '';
  }
  return formatToDateTime(date, format);
}

// 格式化时间戳,将2012-2-3 12:00:23 转为时间戳
export function formatUnix(date, format = DATE_TIME_SECOND): string {
  if (!date) {
    return '';
  }
  const time = dayjs.unix(date).format(format);
  return time;
}

// 传入时间是今天
export const isToday = (date) => {
  return dayjs(date).isSame(new Date(), 'day');
};

// 传入时间距当前时间是否超过24小时
export const isOver24Hour = (date) => {
  return dayjs().diff(date, 'second') > 24 * 60 * 60;
};

export const withLatestWeekTimeStamp = (format = DATE_TIME_SECOND) => {
  const now = dayjs().format(format);
  const day7s = dayjs().subtract(7, 'day').startOf('d').format(format);
  return [day7s, now];
};

// 最近七天
export const withLatestWeek = (format = DATE_FORMAT) => {
  const now = dayjs().format(format);
  const day7s = dayjs().subtract(7, 'day').format(format);
  return [day7s, now];
};

// 最近一周到前一天
export const lastWeek = (format = DATE_TIME_SECOND) => {
  const lastDay = dayjs().startOf('day').subtract(1, 's').format(format);
  const day8s = dayjs().subtract(8, 'day').startOf('d').format(format);
  return [day8s, lastDay];
};

// 最近一个月或几个月到前一天
export const withLastMonth = (month = 1, format = DATE_FORMAT) => {
  const lastDay = dayjs().subtract(1, 'day').format(format);
  const day8s = dayjs().subtract(month, 'month').format(format);
  return [day8s, lastDay];
};

// 最近一周
export const getRecentWeekRange = (format = DATE_TIME_SECOND) => {
  const now = dayjs();
  const dayOfWeek = now.day(); // 获取当前是星期几，0 表示周日，1 表示周一，依此类推

  let startOfWeek, endOfWeek;

  if (dayOfWeek === 0) {
    // 如果今天是周日，返回上周一到上周六。
    startOfWeek = now.subtract(1, 'week').startOf('week').add(1, 'day').format(format); // 上周一
    endOfWeek = now.subtract(1, 'day').format(format); // 上周六
  } else if (dayOfWeek === 1) {
    // 如果今天是周一，返回上周一到上周日
    startOfWeek = now.subtract(1, 'week').startOf('week').add(1, 'day').format(format);
    endOfWeek = now.subtract(1, 'week').endOf('week').add(1, 'day').format(format);
  } else {
    // 如果今天是周二到周六，返回本周一到今天的前一天
    startOfWeek = now.startOf('week').add(1, 'day').format(format);
    endOfWeek = now.subtract(1, 'day').format(format);
  }

  return [startOfWeek, endOfWeek];
};

// 最近一个月
export const getRecentMonthRange = (format = DATE_FORMAT) => {
  const now = dayjs();
  const dayOfMonth = now.date(); // 获取当前是几号

  let startOfMonth, endOfMonth;

  if (dayOfMonth === 1) {
    // 如果今天是一号，返回上个月整月的区间时间戳
    startOfMonth = now.subtract(1, 'month').startOf('month').format(format);
    endOfMonth = now.subtract(1, 'month').endOf('month').format(format);
  } else {
    // 如果今天是二号及以后，返回本月一号至今天的前一天
    startOfMonth = now.startOf('month').format(format);
    endOfMonth = now.subtract(1, 'day').format(format);
  }

  return [startOfMonth, endOfMonth];
};

// 最近三个月
export const getRecentThreeMonthsRange = (format = DATE_FORMAT) => {
  const now = dayjs();
  const dayOfMonth = now.date(); // 获取当前是几号

  let startOfRange, endOfRange;

  if (dayOfMonth === 1) {
    // 如果今天是一号，返回前三个月整月的区间时间戳
    startOfRange = now.subtract(3, 'month').startOf('month').format(format);
    endOfRange = now.subtract(1, 'month').endOf('month').format(format);
  } else {
    // 如果今天是二号及以后，返回前两个月至本月一号的时间戳
    startOfRange = now.subtract(2, 'month').startOf('month').format(format);
    endOfRange = now.subtract(1, 'day').format(format);
  }

  return [startOfRange, endOfRange];
};

// 昨天
export const lastDay = (format = DATE_FORMAT) => {
  const lastDay = dayjs().startOf('day').subtract(1, 's').format(format);
  return [lastDay, lastDay];
};

// 最近一个月
export const lastMonth = (format = DATE_FORMAT) => {
  const lastDay = dayjs().startOf('month').subtract(1, 's').format(format);
  const day8s = dayjs().subtract(1, 'month').startOf('month').format(format);
  return [day8s, lastDay];
};

// 最近一年，返回根据当前年起始时间戳
export const lastYear = (format = DATE_FORMAT, year = new Date().getFullYear()) => {
  const startOfYear = dayjs(`${year}`).startOf('year').format(format);
  const endOfYear = dayjs(`${year}`).endOf('year').format(format);
  return [startOfYear, endOfYear];
};

// date2在date之后
export const isAfter = (date, date2) => {
  return dayjs(date).isAfter(date2);
};

// 日期禁止选择之前或之后
export const disabledDateFunc = (time) => {
  // true: 禁止选中，false:可以选中
  const dataDisabled = isAfter(new Date(), time);
  return !dataDisabled;
};

// 分钟转 天小时分钟
export const mToDayhm = (value) => {
  if (typeof value !== 'number') {
    return '-';
  }

  if (value === 1440) {
    return `1天`;
  }
  if (value === 60) {
    return `1小时`;
  }
  const time = [] as number[];
  const day = Number.parseInt(value / 60 / 24);
  const hour = Number.parseInt((value / 60) % 24);
  const min = Number.parseInt(value % 60);
  time[0] = day > 0 ? day : 0;
  time[1] = hour > 0 ? hour : 0;
  time[2] = min > 0 ? Number.parseFloat(min) : 0;
  if (value > 1400) {
    return `${time[0]}天${time[1]}小时${time[2]}分钟`;
  } else if (value > 60) {
    return `${time[1]}小时${time[2]}分钟`;
  }
  return `${time[2]}分钟`;
};

/**
 * @description 获取当前时间
 * @return string
 */
export function getTimeState() {
  // 获取当前时间
  const timeNow = new Date();
  // 获取当前小时
  const hours = timeNow.getHours();
  // 判断当前时间段
  if (hours >= 6 && hours < 11) return `早上好 ⛅ `;
  if (hours >= 11 && hours < 13) return `中午好 🌞 `;
  if (hours >= 13 && hours < 18) return `下午好 🌞 `;
  if (hours >= 18 && hours < 24) return `晚上好 🌛 `;
  if (hours >= 0 && hours < 6) return `凌晨好 🌛 `;
}

/**
 * @description 距当前时间
 * @param start
 * @returns string
 */
export function getDaysBetween(start) {
  const now = new Date().getTime();
  const startDay = new Date(start).getTime();
  let time: number = (startDay - now) / (1 * 24 * 60 * 60 * 1000); // 天

  if (time > 0 && time < 1) {
    time = time * 1000 * 60; // 分钟
    return '1天';
  } else if (time === 0 || time < 0) {
    return '0天';
  } else {
    return Math.ceil((startDay - now) / (1 * 24 * 60 * 60 * 1000)) + '天';
  }
}

// 分钟转小时分钟
export function minuteToHours(minutes: number) {
  if (minutes === undefined) return '';
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours === 0) {
    return `00:${remainingMinutes < 10 ? '0' + remainingMinutes : remainingMinutes}`;
  } else if (hours > 0 && hours < 10) {
    return `0${hours}:${remainingMinutes < 10 ? '0' + remainingMinutes : remainingMinutes}`;
  }
  return `${hours}:${remainingMinutes < 10 ? '0' + remainingMinutes : remainingMinutes}`;
}
// 分钟转小时分钟-不自动补全0
export function minuteToHoursNoZero(minutes: number) {
  if (!minutes) {
    return [];
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return [hours, remainingMinutes];
}
// 小时转分钟
export function hoursToMinute(time: string) {
  if (!time) return;
  return Number(time.split(':')[0]) * 60 + Number(time.split(':')[1]);
}
// 天转分钟
export function daytoMinute(time: number) {
  if (!time) return;
  return time * 60 * 24;
}
// 分钟转天
export function minutetoDay(time: number) {
  if (!time) return;
  return Number.parseInt(time / 60 / 24);
}
/**
 * @description 每月1到28日( 值 1- 28 )
 * @returns [{label: 每年月..日,value:1}]
 */
export const monthArr = () => {
  const res = [] as TimeArr[];
  for (let i = 0; i < 28; i++) {
    res.push({ label: `每月${i + 1}号`, value: i + 1 });
  }
  return res;
};

/**
 * @description 每年365天( 值 1- 365 )
 * @returns [{label: 每年第..天,value:1}]
 */
export const yearArr = () => {
  const res = [] as TimeArr[];
  for (let i = 0; i < 365; i++) {
    res.push({ label: `每年第${i + 1}天`, value: i + 1 });
  }
  return res;
};

/**
 * @description 0点到24点数组值，用于转分钟使用
 * @returns TimeArr[]
 */
export const timeArr = (): TimeArr[] => {
  const arr = [] as TimeArr[];
  for (let j = 0; j < 24; j++) {
    for (let i = 0; i < 60; i++) {
      if (j < 10) {
        if (i < 10) {
          arr.push({
            label: '0' + j + ':0' + i,
            value: '0' + j + ':0' + i,
          });
        } else {
          arr.push({
            label: '0' + j + ':' + i,
            value: '0' + j + ':' + i,
          });
        }
      } else {
        if (i < 10) {
          arr.push({
            label: j + ':0' + i,
            value: j + ':0' + i,
          });
        } else {
          arr.push({
            label: j + ':' + i,
            value: j + ':' + i,
          });
        }
      }
    }
  }
  arr.push({
    label: '24:00',
    value: '24:00',
  });
  return arr;
};

// 今天
export const today = () => {
  const isStart = dayjs().startOf('day').format(DATE_TIME_SECOND);
  const now = dayjs().format(DATE_TIME_SECOND);
  return [isStart, now];
};

export const lastDayTime = (format = DATE_FORMAT) => {
  const lastDay = dayjs().startOf('day').subtract(1, 's').format(format);
  return [lastDay, `${lastDay} 23:59:59`];
};

export const dateUtil = dayjs;
