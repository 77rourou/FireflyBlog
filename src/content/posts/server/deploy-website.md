---
title: "网站部署上线全流程：从域名到 HTTPS"
published: 2026-07-28
tags: ["服务器", "部署", "域名", "HTTPS", "教程"]
category: "开发"
description: "从零把网站部署上线：域名购买与 DNS 解析、国内 ICP 备案流程、服务器选购、Nginx/Node/Python 环境部署、Let's Encrypt 免费 HTTPS 证书，以及上线后的监控备份与常见坑。"
---

代码写完了，网站却还只能本地访问？本文记录网站从零上线的完整链路：域名、备案、服务器、环境部署、HTTPS，以及上线后必须做的监控与备份。内容以国内服务器 + 个人网站为默认场景，兼顾常见问题。

## 一、域名购买与解析

- 在 [阿里云](https://www.aliyun.com/)、[腾讯云](https://cloud.tencent.com/) 或 [Cloudflare Registrar](https://www.cloudflare.com/products/registrar/) 等平台注册域名，个人建站常见 `.com` / `.cn` / `.top` 等后缀，首年常有优惠
- 购买后需完成**实名认证**（国内注册商要求），并配置 **DNS 解析**：

| 记录类型 | 主机记录 | 记录值 | 说明 |
| --- | --- | --- | --- |
| A | `@` | `1.2.3.4` | 主域名指向服务器 IP |
| A | `www` | `1.2.3.4` | www 子域名 |
| CNAME | `www` | `example.com` | 也可用 CNAME 指向主域名 |

解析生效后可用 `ping example.com` 或 `nslookup` 验证。

> [!WARNING]
> 国内服务器解析域名必须使用**已备案**的域名，否则无法通过 80/443 端口访问。

## 二、国内备案流程简介

只要服务器在中国大陆，网站就必须完成 **ICP 备案**（工信部要求，托管于阿里云/腾讯云等平台时在对应备案系统在线办理）：

1. 在云厂商的备案控制台提交主体信息（个人身份证、手机号）与网站信息
2. 平台初审 → 短信核验 → 提交管局审核，一般 **1~3 周**（各省略有差异）
3. 通过后获得备案号，需在网站底部展示并链接到工信部网站

- 阿里云备案入口：[beian.aliyun.com](https://beian.aliyun.com/)
- 腾讯云备案入口：[beian.cloud.tencent.com](https://beian.cloud.tencent.com/)

> 若服务器在香港、海外或使用 Cloudflare Pages / Vercel 等境外托管，则**不需要** ICP 备案，但国内访问速度和稳定性通常不如备案后的国内节点。

## 三、服务器选购建议

- **云厂商**：阿里云、腾讯云、华为云等，新用户常有低价轻量服务器（轻量应用服务器性价比高，适合个人博客）
- **配置参考**：个人博客 1~2 核 CPU + 1~2GB 内存 + 40GB SSD 起步；流量选按量或每月固定额度
- **系统**：推荐 **Ubuntu 22.04/24.04 LTS** 或 Debian，资料多、社区活跃
- 购买后立即做的三件事：**修改 root 密码、创建普通用户、配置 SSH 密钥登录并禁用密码登录**

```bash
# 创建部署用户并加入 sudo
adduser deploy
usermod -aG sudo deploy
```

## 四、环境部署（Nginx / Node / Python）

**Nginx**（当前稳定版为 1.30.x，见 [nginx.org](https://nginx.org/)）作为反向代理统一入口：

```bash
sudo apt update && sudo apt install -y nginx
```

在 `/etc/nginx/sites-available/` 新建站点配置：

```nginx
server {
    listen 80;
    server_name example.com www.example.com;

    root /var/www/blog;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }
}
```

启用站点并重载：

```bash
sudo ln -s /etc/nginx/sites-available/blog /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

**Node.js**（推荐用官方源安装 LTS 版本，见 [nodejs.org](https://nodejs.org/)）：

```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs
```

**Python**（系统自带 3.10+，或使用 [官网](https://www.python.org/) 安装新版；生产环境建议配合 `venv` 虚拟环境）：

```bash
sudo apt install -y python3 python3-venv python3-pip
```

> [!TIP]
> 静态站也可直接用 `nginx -s reload` 后访问测试；动态应用建议通过 `proxy_pass` 反代到 Node/Python 进程，并用 `systemd` 托管进程以保证开机自启与崩溃重启。

## 五、HTTPS 证书

推荐 [Let's Encrypt](https://letsencrypt.org/zh-cn/) 的免费证书（有效期 90 天），用 [Certbot](https://certbot.eff.org/) 自动申请与续期：

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d example.com -d www.example.com
```

Certbot 会自动修改 Nginx 配置并配置 90 天自动续期，验证续期任务：

```bash
sudo systemctl list-timers | grep certbot   # 确认续期定时器存在
sudo certbot renew --dry-run                # 测试续期是否正常
```

申请完成后访问 `https://example.com`，浏览器地址栏出现锁形图标即为成功。建议同时配置 **HTTP 强制跳转 HTTPS**（Certbot 默认已加）和 HSTS 响应头。

> [!WARNING]
>  证书有效期仅 90 天，**务必确认自动续期正常**，否则到期后网站会显示不安全提示。

## 六、上线后的监控与备份

- **可用性监控**：使用 [Uptime Kuma](https://github.com/louislam/uptime-kuma) 等自建监控（可用 Docker 一键部署），异常时推送通知到 Telegram/邮件
- **日志**：定期查看 Nginx 访问/错误日志，配置 `logrotate` 防止日志膨胀
- **备份**：数据库定时 `mysqldump`，网站文件用 `rsync`/`rclone` 同步到对象存储或其他机器；**备份与服务器分离**，并定期演练恢复
- **安全基线**：关闭不必要端口、仅开放 22/80/443；及时执行系统安全更新

## 七、常见坑

| 坑 | 现象 | 解决 |
| --- | --- | --- |
| 域名未备案 | 国内服务器 80/443 被拦截 | 先完成 ICP 备案 |
| 防火墙未放行 | 端口通、外网访问失败 | 检查云厂商安全组 + 系统 `ufw` |
| DNS 缓存 | 改了解析不生效 | 等 TTL 过期或用 `nslookup` 换 DNS 验证 |
| 证书续期失败 | 到期后 HTTPS 报错 | 检查 `certbot renew --dry-run` 日志 |
| 权限过宽 | 网站被篡改/注入 | 站点目录最小权限，禁用 root 运行服务 |

## 小结

从域名到 HTTPS 的链路并不复杂，但每个环节都有细节。建议按"域名 → 解析 → 服务器 → 环境 → 证书 → 监控备份"的顺序推进，遇到问题时优先查阅官方文档（Nginx、Certbot、云厂商帮助中心）。上线只是开始，稳定的运维才是长期课题。
