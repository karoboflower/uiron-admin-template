import type { BigSource } from 'big.js';
import Big from 'big.js';

type CalcParam = BigSource | null | undefined;

// 加
export function add(...params: CalcParam[]) {
  if (!params.length) return new Big(0).toNumber();
  for (let i = 0; i < params.length; i++) {
    if (!params[i]) {
      params[i] = 0;
    }
  }
  const list = params as BigSource[];
  const start = new Big(list[0]);
  return list
    .reduce((total: Big, item, index) => {
      return index ? total.plus(item) : total;
    }, start)
    .toNumber();
}

// 减
export function sub(...params: CalcParam[]) {
  if (!params.length) return new Big(0).toNumber();
  for (let i = 0; i < params.length; i++) {
    if (!params[i]) {
      params[i] = 0;
    }
  }
  console.log(params, 'params');
  // debugger;
  const list = params as BigSource[];
  const start = new Big(list[0]);
  return list
    .reduce((total: Big, item, index) => {
      return index ? total.minus(item) : total;
    }, start)
    .toNumber();
}

// 乘
export function mul(...params: CalcParam[]) {
  if (!params.length) return new Big(0).toNumber();
  for (let i = 0; i < params.length; i++) {
    if (!params[i]) {
      params[i] = 0;
    }
  }
  const list = params as BigSource[];
  const start = new Big(list[0]);
  return list.reduce((total: Big, item, index) => {
    return index ? total.times(item) : total;
  }, start);
  // .toNumber();
}

// 除
export function div(...params: CalcParam[]) {
  if (!params.length) return new Big(0).toNumber();
  for (let i = 0; i < params.length; i++) {
    if (!params[i]) {
      params[i] = 0;
    }
  }
  const list = params as BigSource[];
  const start = new Big(list[0]);
  return list
    .reduce((total: Big, item, index) => {
      return index ? total.div(item) : total;
    }, start)
    .toNumber();
}
