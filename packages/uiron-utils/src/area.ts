// 转化省市数据
export const convertPMData = (data: any) => {
  const p = Object.entries(data).map(([c, e]) => {
    // console.log(e, '检查e是否有数据');
    return {
      label: c,
      value: c,
      children: e.map((n) => ({
        label: n,
        value: n,
      })),
    };
  });
  return p;
};

// 转化省市区数据
export const convertPMCData = (data: any) => {
  const b = Object.entries(data).map(([c, e]) => ({
    label: c,
    value: c,
    children: Object.entries(e).map(([n, l]) => ({
      label: n,
      value: n,
      children: l.map((o) => ({
        label: o,
        value: o,
      })),
    })),
  }));
  return b;
};
