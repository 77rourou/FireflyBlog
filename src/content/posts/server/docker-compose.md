---
title: "Docker Compose 实战：一键部署多服务"
published: 2026-07-27
tags: ["服务器", "Docker", "Compose", "教程"]
category: "开发"
description: "用 Docker Compose 编排多容器应用：compose 文件核心字段、常用命令速查、Web + MySQL 多服务示例，以及项目化部署的工程化建议。"
---

单个容器用 `docker run` 还能应付，一旦涉及 Web 前端、后端、数据库、Redis 等多个服务，手工敲命令既易错又难维护。Docker Compose 用一份 YAML 文件描述"整套应用"，一条命令即可全部启动或关闭。本篇记录 Compose 的核心用法与实战示例。

## 一、Compose 是什么

Compose 是 Docker 官方的多容器编排工具，用 `docker-compose.yml` 声明服务的镜像、端口、环境变量、数据卷和依赖关系。自 Compose V2 起，它已内置为 Docker CLI 插件，直接使用 `docker compose` 子命令（旧版独立命令 `docker-compose` 已停止维护，[迁移指南](https://docs.docker.com/compose/releases/migrate/) 见官方文档）。

```sh
docker compose version    # 检查版本（V2 输出包含 v2.x）
```

> Compose 面向**单机多容器**场景；跨多台服务器的集群编排应使用 Docker Swarm 或 Kubernetes。

## 二、docker-compose.yml 核心字段

一份最小的 compose 文件：

```yaml
services:
  web:
    image: nginx:alpine
    ports:
      - "8080:80"
    volumes:
      - ./html:/usr/share/nginx/html
```

| 字段 | 作用 | 常用写法 |
| --- | --- | --- |
| `services` | 定义各个服务，顶层必填 | 每个服务一个名字 |
| `image` | 使用的镜像 | `nginx:alpine` |
| `build` | 用本地 Dockerfile 构建 | `build: ./web`（与 `image` 二选一或搭配） |
| `ports` | 端口映射 | `"8080:80"`（宿主机:容器） |
| `volumes` | 数据卷/目录挂载 | `mysql-data:/var/lib/mysql` 或 `./conf:/etc/nginx/conf.d` |
| `environment` | 环境变量 | `MYSQL_ROOT_PASSWORD: "123456"` |
| `depends_on` | 启动顺序依赖 | `depends_on: [db]` |
| `restart` | 重启策略 | `always` / `unless-stopped` |

命名卷需要在文件底部声明：

```yaml
volumes:
  mysql-data:
```

## 三、常用命令

所有命令都在 `docker-compose.yml` 所在目录执行：

| 命令 | 作用 |
| --- | --- |
| `docker compose up -d` | 构建并后台启动所有服务（`-d` 后台运行） |
| `docker compose ps` | 查看服务状态 |
| `docker compose logs -f` | 实时跟踪所有服务日志（可指定服务名） |
| `docker compose down` | 停止并删除容器与默认网络（**加 `-v` 会连数据卷一起删**） |
| `docker compose restart` | 重启服务 |
| `docker compose exec web sh` | 进入某个服务容器 |

```sh
# 常用组合：后台启动 + 查看状态
docker compose up -d
docker compose ps

# 结束并清理（保留数据卷）
docker compose down
```

> `docker compose down -v` 会删除声明在 compose 文件中的数据卷，数据将丢失，操作前务必确认。

## 四、实战：Web + MySQL 多服务部署

以静态博客（Nginx）+ MySQL 为例：

```yaml
services:
  web:
    image: nginx:alpine
    ports:
      - "8080:80"
    volumes:
      - ./blog:/usr/share/nginx/html:ro   # 网站文件只读挂载
    restart: unless-stopped
    depends_on:
      - db

  db:
    image: mysql:8
    environment:
      MYSQL_ROOT_PASSWORD: "ChangeMe123"
      MYSQL_DATABASE: blog
      MYSQL_USER: blog
      MYSQL_PASSWORD: "ChangeMe456"
    volumes:
      - mysql-data:/var/lib/mysql
      - ./init:/docker-entrypoint-initdb.d:ro  # 首次启动自动执行初始化脚本
    ports:
      - "3306:3306"
    restart: unless-stopped

volumes:
  mysql-data:
```

启动后验证：

```sh
docker compose up -d
docker compose ps                      # 两个服务都应为 Up
docker compose exec db mysql -uroot -p # 进入 MySQL 控制台
docker compose logs -f web             # 查看 Nginx 日志
```

## 五、项目化部署建议

1. **用 `.env` 管理环境差异**：把密码、端口等参数抽到 `.env` 文件，compose 中引用 `${MYSQL_PASSWORD}`，并将 `.env` 加入 `.gitignore`，避免敏感信息入库
2. **固定镜像版本**：避免使用 `latest` 标签，便于复现与回滚
3. **健康检查**：为服务配置 `healthcheck`，让依赖服务等待就绪而非盲目启动
4. **日志与监控**：设置日志轮转（`logging` 字段限制大小），配合监控面板观察资源占用
5. **备份数据库**：`mysqldump` 定时导出到数据卷之外，或使用 `docker compose exec` 配合 cron 脚本

> [!WARNING]
> 完整字段说明以 [Compose 官方文档](https://docs.docker.com/compose/) 和 [Compose Specification](https://compose-spec.io/) 为准，版本升级前注意查看 [Compose 发布说明](https://docs.docker.com/compose/releases/) 中的变更。

## 小结

Compose 把"部署一套应用"从十几条命令压缩成 `docker compose up -d` 一条，配合数据卷和环境变量，开发与生产环境可以做到同一份配置。下一篇将介绍网站从域名、备案到 HTTPS 上线的完整流程。
