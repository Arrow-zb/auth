# 1. token-auth
基于 token 实现身份验证
# 2. 简单使用
前端登录验证通过后后端给前端颁发一个 token， 前端获取到 token 后保存到本地，然后每次请求时都带上这个token，后端通过校验这个 token 实现身份的验证
这里有两点需要特别注意：
- 前端请求时携带的 token 需要放到 Authorization 这个首部字段，同时还要加上 'Bearer '，这样后端才能获取到并且识别。使用 axios 拦截器可如下实现。
```js
axios.interceptors.request.use(
    config => {
      const token = localStorage.getItem("token");
      if(token) {
        // token 存在的话，每个 http header 都加上 token
        config.headers.common["Authorization"] = "Bearer " + token;
      };
      return config;
    },
    err => {
      return Promise.reject(err);
    }
  );
```
- token 是如何做到后端不用存储就实现的身份验证的呢？这个下面来具体的分析。
# 3. jwt 的原理
# 4. jwt 的优劣