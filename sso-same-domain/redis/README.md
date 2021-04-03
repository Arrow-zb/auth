# docker 安装 redis
## 镜像 容器启动
```sh
# 拉取镜像
docker pull redis:latest
# 运行容器
docker run -itd --name redis-arrow -p 6379:6379 redis

# 进入容器
docker exec -it redis-arrow /bin/bash
```
[教程](https://www.runoob.com/docker/docker-install-redis.html)
## dockerfile