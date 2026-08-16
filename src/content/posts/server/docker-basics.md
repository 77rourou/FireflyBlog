---
title: "Docker 容器入门：镜像、容器与常用命令"
published: 2026-07-26
tags: ["服务器", "Docker", "容器", "教程"]
category: "开发"
description: "从零认识 Docker：镜像、容器、仓库三大核心概念，安装与常用命令速查，端口映射与数据卷的使用，以及 Dockerfile 编写入门和国内镜像加速配置。"
---

Docker 是目前最流行的容器引擎，它把应用连同运行环境一起打包，做到"一次构建，到处运行"。本篇记录我从零上手 Docker 的笔记：核心概念、安装、常用命令、数据持久化、Dockerfile 入门，以及国内用户绕不开的镜像加速配置。

## 一、Docker 是什么

Docker 是一个开源的容器化平台，使用 Linux 内核的 namespace 和 cgroup 技术实现进程隔离与资源限制。与虚拟机不同，容器直接共享宿主机内核，因此**启动快（毫秒级）、占用小（通常几十 MB）、迁移方便**。

三大核心概念：

| 概念 | 说明 | 类比 |
| --- | --- | --- |
| **镜像（Image）** | 只读的模板，包含代码、运行时、依赖和配置 | 光盘/安装包 |
| **容器（Container）** | 镜像运行的实例，可启动、停止、删除 | 运行中的程序 |
| **仓库（Registry）** | 集中存放镜像的地方，如 [Docker Hub](https://hub.docker.com/) | 应用商店 |

> 镜像分层构建、可复用；容器是镜像加一层可写层，删除容器不会影响镜像本身。

## 二、安装 Docker

- **Windows / macOS**：安装 [Docker Desktop](https://www.docker.com/products/docker-desktop/)（个人开发者免费使用；超过 250 名员工且年营收超 1000 万美元的企业需付费订阅，详见 [Docker 订阅说明](https://docs.docker.com/subscription/desktop/)）
- **Linux**：按 [官方安装文档](https://docs.docker.com/engine/install/) 操作，以 Ubuntu 为例：

```bash
# 使用官方脚本安装（生产环境建议按文档逐条执行）
curl -fsSL https://get.docker.com | sudo sh

# 让当前用户免 sudo 执行 docker
sudo usermod -aG docker $USER
```

安装后验证：

```sh
docker version    # 查看客户端与服务端版本
docker info       # 查看引擎信息
```

## 三、常用命令速查

| 命令 | 作用 |
| --- | --- |
| `docker pull 镜像名[:标签]` | 拉取镜像，如 `docker pull nginx:alpine` |
| `docker images` | 查看本地镜像 |
| `docker run 镜像名` | 运行容器 |
| `docker ps` | 查看运行中的容器（加 `-a` 查看全部） |
| `docker exec -it 容器ID bash` | 进入容器交互终端 |
| `docker logs -f 容器ID` | 实时查看容器日志 |
| `docker rm 容器ID` | 删除容器（加 `-f` 强制） |
| `docker rmi 镜像ID` | 删除镜像 |
| `docker stop / start` | 停止 / 启动容器 |

```sh
# 运行一个 nginx 并映射端口，-d 后台运行 --name 起名
docker run -d --name my-nginx -p 8080:80 nginx

# 访问 http://localhost:8080 即可看到欢迎页
```

## 四、端口映射与数据卷

**端口映射**：容器有独立网络命名空间，需把宿主端口映射到容器端口才能对外访问，格式为 `-p 宿主机端口:容器端口`（如上文的 `-p 8080:80`）。

**数据卷**：容器删除后数据会丢失，需要用卷持久化。推荐使用 **named volume** 或**目录挂载**：

```sh
# 命名卷：由 Docker 管理存储位置
docker run -d --name mysql-test \
  -v mysql-data:/var/lib/mysql \
  -e MYSQL_ROOT_PASSWORD=123456 \
  mysql:8

# 目录挂载：把宿主目录直接挂进容器，适合配置文件与日志
docker run -d --name my-nginx -v /opt/nginx/conf:/etc/nginx/conf.d -p 8080:80 nginx
```

> [!WARNING]
> 数据卷只解决持久化，不等于备份。重要数据仍需定期导出或异地备份（如 `docker cp`、`mysqldump`）。

## 五、Dockerfile 编写入门

Dockerfile 是构建镜像的"配方"，一个最小示例：

```dockerfile
# 基于官方 Node 镜像
FROM node:22-alpine

# 设置工作目录
WORKDIR /app

# 先拷贝依赖清单，充分利用缓存
COPY package.json ./
RUN npm install

# 再拷贝源码
COPY . .

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["node", "server.js"]
```

构建并运行：

```sh
docker build -t my-app:1.0 .        # 在 Dockerfile 所在目录构建
docker run -d -p 3000:3000 my-app:1.0
```

编写建议：尽量使用官方镜像并固定版本标签（如 `node:22-alpine` 而非 `node:latest`）；把**变更频率低**的指令（如 `COPY package.json`）放在前面，以利用构建缓存。详见 [Dockerfile 最佳实践](https://docs.docker.com/build/building/best-practices/)。

## 六、国内镜像加速

Docker Hub 在国内访问不稳定，常见做法是给 Docker 配置镜像加速器：

1. 编辑（或新建）`/etc/docker/daemon.json`（Windows 下 Docker Desktop 在设置中配置）：

```json
{
  "registry-mirrors": [
    "https://docker.1ms.run",
    "https://docker.xuanyuan.me"
  ]
}
```

2. 重启 Docker 使配置生效：

```sh
sudo systemctl restart docker
```

> [!WARNING]
> 加速器地址变动频繁、可用性不稳定，配置前请自行测试；也可改用 [阿里云容器镜像服务](https://www.aliyun.com/product/acr) 等国内镜像仓库拉取/托管镜像。注意 `daemon.json` 修改后需重启 Docker 才会生效。

## 小结

掌握 Docker 后，环境问题从"在我机器上是好的"变成"在哪都是好的"。下一步建议学习 **Docker Compose**（多容器编排，见本站《Docker Compose 实战》）、容器网络与安全加固。更多命令细节可查阅 [Docker CLI 官方参考](https://docs.docker.com/reference/cli/docker/)。
