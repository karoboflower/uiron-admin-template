# @uiron/hooks - use-requests

> 针对 Uiron Admin 项目的增强版 Axios 请求工具

## 安装

```bash
# npm
npm install @uiron/hooks

# yarn
yarn add @uiron/hooks

# pnpm
pnpm add @uiron/hooks
```

## 简介

`use-requests` 提供了一个可配置的 Axios 封装，具有以下增强功能：

- 请求/响应拦截器
- 响应数据转换
- 请求取消
- 错误处理
- URL 前缀管理
- 基于令牌的身份验证

## 基本使用

```ts
import { uironRequest } from '@uiron/hooks';

// 创建自定义 axios 实例
const http = uironRequest({
  requestOptions: {
    apiUrl: 'https://api.example.com',
    whiteList: ['/login'],
    urlPrefix: '/v1',
    appId: '您的应用ID',
    setToken: (config) => {
      config.headers['Authorization'] = `Bearer 您的令牌`;
      return config;
    }
  }
});

// 使用实例发送请求
const getData = async () => {
  try {
    const result = await http.get({ url: '/users' });
    console.log(result);
  } catch (error) {
    console.error(error);
  }
};
```

## 配置选项

### `CreateAxiosOptions`

扩展了标准 Axios 配置，增加了以下选项：

| 选项 | 类型 | 描述 |
|--------|------|-------------|
| `transform` | `AxiosTransform` | 请求转换钩子 |
| `requestOptions` | `RequestOptions` | 请求选项 |

### `RequestOptions`

| 选项 | 类型 | 描述 |
|--------|------|-------------|
| `appId` | `string` | 在头部发送的应用 ID |
| `whiteList` | `string[]` | 不需要认证的 URL 列表 |
| `joinPrefix` | `boolean` | 是否为 URL 添加前缀 |
| `urlPrefix` | `string` | 添加到 URL 的前缀 |
| `apiUrl` | `string` | 基础 API URL |
| `isReturnNativeResponse` | `boolean` | 是否返回完整响应 |
| `isTransformResponse` | `boolean` | 是否转换响应数据 |
| `joinTime` | `boolean` | 是否为请求添加时间戳 |
| `ignoreCancelToken` | `boolean` | 是否忽略请求取消 |
| `setToken` | `(config) => config` | 设置认证令牌的函数 |

## 响应数据结构

转换器处理多种响应结构：

```json
{
  "result": {}, // 方式 1
  "data": {},   // 方式 2
  // 或直接数据
}
```

## 错误处理

错误通过响应拦截器和 `checkStatus` 函数处理，返回一致的错误消息。

## 高级用法

### 自定义响应转换

```ts
const http = createAxios({
  transform: {
    transformRequestHook: (res, options) => {
      // 自定义转换逻辑
      return res.data.customField;
    }
  }
});
```

### 认证设置

```ts
const http = createAxios({
  requestOptions: {
    setToken: (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    },
    whiteList: ['/login', '/register']
  }
});
```

## API 参考

### 方法

- `http.get(config, options)`: HTTP GET 请求
- `http.post(config, options)`: HTTP POST 请求
- `http.put(config, options)`: HTTP PUT 请求
- `http.delete(config, options)`: HTTP DELETE 请求
- `http.request(config, options)`: 通用请求方法

## 许可证

ISC
