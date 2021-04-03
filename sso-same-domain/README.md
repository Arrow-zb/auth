# 1. sso-same-domain
同域下实现单点登录。
域A： sso.arrow-zn.cn, 搭建登录系统
域B： note.arrow-zn.cn,  子系统1
域C： ui.arrow-zn.cn,   子系统2
实现的功能是，不论是在哪一个域下面登录，都只需要一次登录即可。
# 2. 实现思路
1. 首先在 `sso.arrow-zb.cn` 下搭建一个登陆系统，无论是在域 A B C 哪一个，只要未登录的情况下，首先都重定向(携带者到来的url)到这个域下面进行登录，校验完成后，后端需要做两件事情。第一，颁发一个sessionId给 `arrow-zb.cn` 这个域；第二，将这个 sessionId 对应的 value(如用户的姓名和ID) 以键值对的方式保存到 redis 中。
2. 因为在重定向到 `sso.arrow-zb.cn` 的时候是携带了到来的 url 的，因此，验证通过后返回浏览器 304 且重定向到对应的 url。
3. 因为顶域 `arrow-zb.cn` 下已经存在了 sessionId, 因此，每次请求时都会将 sessionId 发送到后端，后端拿到 sessionId 后到 redis 中查找，找到后验证通过并获取对应的 value。至此就可以实现同域下的单点登录。

# 3. 实现过程
## 3.1 redis
1. 搭建一个 redis 的 docker 容器
```sh
# 拉取镜像
docker pull redis:latest
# 运行容器
docker run -itd --name redis-arrow -p 6379:6379 redis

# 进入容器
docker exec -it redis-arrow /bin/bash
```
[教程](https://www.runoob.com/docker/docker-install-redis.html)
2. 安装依赖
```sh
yarn add redis koa-redis
```
3. 简单使用
```js
const redis = require('redis');
const redisStore = require('koa-redis');
const redisClient = redis.createClient(6379, '10.12.6.144');
```
## 3.2 搭建 koa 服务
```sh
yarn add koa koa-router koa-static koa-bodyparser koa-session
```


## 3.3 搭建前端页面
基于 vue, element-ui, axios 搭建前端登录页面