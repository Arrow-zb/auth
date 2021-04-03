# 1. sso-same-domain
同域下实现单点登录。
域A： sso.arrow-zn.cn, 搭建登录系统
域B： note.arrow-zn.cn,  子系统1
域C： ui.arrow-zn.cn,   子系统2
实现的功能是，不论是在哪一个域下面登录，都只需要一次登录即可。
# 2. 实现思路
1. 首先在 `sso.arrow.cn` 下搭建一个登陆系统，无论是在域 A B C 哪一个，只要未登录的情况下，首先都重定向(携带者到来的url)到这个域下面进行登录，校验完成后，后端需要做两件事情。第一，颁发一个sessionId给 `arrow.cn` 这个域；第二，将这个 sessionId 对应的 value(如用户的姓名和ID) 以键值对的方式保存到 redis 中。
2. 因为在重定向到 `sso.arrow.cn` 的时候是携带了到来的 url 的，因此，验证通过后返回浏览器 304 且重定向到对应的 url。
3. 因为顶域 `arrow.cn` 下已经存在了 sessionId, 因此，每次请求时都会将 sessionId 发送到后端，后端拿到 sessionId 后到 redis 中查找，找到后验证通过并获取对应的 value。至此就可以实现同域下的单点登录。

# 3. 实现过程
## 3.1 sso.arrow.cn  登录系统搭建
### 3.1.1 redis 容器
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

### 3.1.2 搭建 koa 服务
koa 服务中有三个点需要重点注意：
- session config 中需要设置 domain, 这里我遇到了坑，官方文档中没提及到可以设置 domain, 后来我是在 git issue 中发现是可以配置的。
- session 是签名过的，因此 session 的 secret 需要系统共享，可以直接在代码里面写死（每个服务都写一样的），也可以保存在 redis 中进行共享
- 路由的重定向的 url 是来自 query 的，因此获取到后可以通过后端直接 redirect， 也可以前端重定向

### 3.1.3 搭建前端页面
基于 vue, element-ui, axios 搭建前端登录页面。
这里只做登录，登录完成后直接重定向。

## 3.2 ui.arrow.cn  搭建 ui 项目
这里主要实现两个功能
- ui 对应的后台鉴权，如果无 sessionId 或者 sessionId 不匹配，那么带着 url 重定向到 sso.arrow.cn 进行登录
- sessionId 校验通过后展示用户名字即可