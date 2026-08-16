---
title: "Nginx 反向代理与 HTTPS 配置实战"
published: 2026-07-25
tags: ["服务器", "Nginx", "HTTPS", "教程"]
category: "开发"
description: "从安装 Nginx 开始，详解反向代理（location/proxy_pass/WebSocket）配置，用 certbot + Let's Encrypt 免费申请 HTTPS 证书，并总结 502、端口冲突、配置不生效等高频问题的排查思路。"
---

本地起了个 Node/Python 服务监听 3000 端口，怎么让它对外以 80/443 端口、自己的域名、带 HTTPS 提供服务？答案就是 Nginx 反向代理。本文从安装到 HTTPS 配置一条龙讲完，最后附高频排错清单。

## 一、安装 Nginx

```bash
# Ubuntu / Debian
sudo apt update && sudo apt install nginx -y

# CentOS 8+ / Fedora
sudo dnf install nginx -y
```

启动并设为开机自启：

```bash
sudo systemctl enable --now nginx
sudo systemctl status nginx
```

> [!WARNING]
> 验证是否安装成功：浏览器访问服务器 IP 看到 Nginx 欢迎页即可；若访问不了，优先检查云厂商安全组是否放行 80/443 端口。

## 二、反向代理配置

反向代理的本质：Nginx 接收公网请求，转发给内网/本机的真实服务，再把响应原路返回，对外只暴露 Nginx 一个入口。

### 1. 基础反向代理

编辑站点配置文件 `/etc/nginx/sites-available/myapp`（CentOS 系在 `/etc/nginx/conf.d/myapp.conf`）：

```nginx
server {
    listen 80;
    server_name example.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

> [!TIP]
> 提示：`proxy_set_header` 这几行务必保留，否则后端拿到的是 Nginx 的地址而非真实客户端 IP，日志和限流都会失真。

启用配置并重载：

```bash
sudo ln -s /etc/nginx/sites-available/myapp /etc/nginx/sites-enabled/
sudo nginx -t          # 先测配置语法，输出 syntax is ok 再继续
sudo nginx -s reload
```

### 2. WebSocket 转发（实时应用）

WebSocket 需要升级协议，必须显式配置 `Upgrade` 头：

```nginx
location /ws/ {
    proxy_pass http://127.0.0.1:8080;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_read_timeout 3600s;   # 长连接超时调大，避免频繁断连
}
```

### 3. HTTP 自动跳转 HTTPS

证书配置完成后，把 80 端口请求统一 301 跳转到 HTTPS（certbot 自动改写时已包含此逻辑，手动配置如下）：

```nginx
server {
    listen 80;
    server_name example.com;
    return 301 https://$host$request_uri;
}
```

> [!TIP]
> 提示：用 `$host` 保留原始域名，多域名共用一台服务器时也能正确跳转；配合 HSTS（`add_header Strict-Transport-Security`）可让浏览器强制走 HTTPS。

### 4. location 匹配规则速查

| 写法 | 匹配方式 | 示例 |
| --- | --- | --- |
| `location /` | 前缀匹配（最宽松） | 兜底转发 |
| `location /api/` | 前缀匹配 | 接口走 3000 端口 |
| `location = /` | 精确匹配（优先级最高） | 首页单独处理 |
| `location ~ \.php$` | 正则匹配 | 按扩展名转发 |

> [!TIP]
> 同一 `server` 块里可以用多个 `location` 把不同路径分流到不同后端（如 `/api/` 到 3000、`/ws/` 到 8080），非常实用。

## 三、HTTPS 证书申请（Let's Encrypt + certbot）

Let's Encrypt 提供免费 90 天证书，配合 certbot 可全自动续期，官方指引见 [certbot.eff.org](https://certbot.eff.org/)。

```bash
# Ubuntu 安装 certbot 与 Nginx 插件
sudo apt install certbot python3-certbot-nginx -y

# 自动完成：申请证书 + 改写 Nginx 配置 + 启用 HTTPS 跳转
sudo certbot --nginx -d example.com -d www.example.com

# 测试自动续期
sudo certbot renew --dry-run
```

完成后 Nginx 配置中会自动加入 `listen 443 ssl` 与证书路径。也可以先手动写好配置、只用 certbot 签发证书：

```bash
sudo certbot certonly --nginx -d example.com
# 证书文件位置：/etc/letsencrypt/live/example.com/fullchain.pem 和 privkey.pem
```

> [!TIP]
> 提示：`certbot renew` 由 systemd 定时任务自动执行，无需手动干预；只要 `--dry-run` 通过就说明续期链路是通的。

## 四、常见问题排查

### 502 Bad Gateway

后端服务挂了或地址写错。依次检查：

```bash
systemctl status 你的服务      # 后端是否在运行
ss -tlnp | grep 3000          # 端口是否真的在监听
curl http://127.0.0.1:3000    # 本机直接访问后端能否通
```

### 端口冲突（bind() to 0.0.0.0:80 failed）

80/443 被别的进程占用（常见于 Apache 或二次安装 Nginx）：

```bash
ss -tlnp | grep ':80 '
sudo systemctl stop apache2 && sudo systemctl disable apache2
```

### 配置不生效

多半是没重载或改错了文件：

```bash
sudo nginx -t        # 先确认语法
sudo nginx -s reload # 重载才生效（restart 亦可）
# 确认启用的文件是同一个：sites-enabled 里必须是软链接
ls -l /etc/nginx/sites-enabled/
```

> [!TIP]
> 修改后报错 `[emerg]` 说明配置文件有问题，Nginx 不会重载，此时用 `nginx -t` 定位具体行号，修复前旧配置仍正常工作。

### 证书相关的坑

- **证书过期**：`curl -v https://example.com` 报证书过期，先执行 `sudo certbot renew`，确认系统时间（`date`）是否被改错
- **证书文件权限**：`privkey.pem` 需保证 Nginx 进程可读，通常 `chmod 600` 并确认属主为 root 即可
- **续期失败**：`certbot renew --dry-run` 报错多为 80 端口被防火墙挡住（ACME 校验需要能访问 80 端口），放行后重试

## 参考链接

- [Nginx 官方文档](https://nginx.org/en/docs/)
- [Let's Encrypt 官网](https://letsencrypt.org/)
- [certbot 安装指引（按系统选择）](https://certbot.eff.org/)
