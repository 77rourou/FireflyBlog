---
title: "内网穿透完全指南：frp 与 Cloudflare Tunnel"
published: 2026-07-23
tags: ["网络", "内网穿透", "frp", "Cloudflare", "教程"]
category: "开发"
description: "从原理到实战：介绍内网穿透的两种主流方案 frp 与 Cloudflare Tunnel（cloudflared）的完整配置流程，覆盖远程桌面、网站、SSH 等常见场景与安全注意事项。"
---

家里的 NAS、树莓派、开发机没有公网 IP，人在外面就访问不到？内网穿透（NAT Traversal）就是解决这个问题的通用方案：借助一台有公网 IP 的中转服务器或云服务，把内网服务"搬运"到公网。本文介绍目前最主流的两个方案：开源自建 **frp** 和零配置的 **Cloudflare Tunnel**。

## 一、内网穿透是什么

普通家庭宽带处于 NAT 之后，只有内网 IP，公网无法直接访问。内网穿透的核心思路是**反向连接**：内网设备主动向外网的中转节点建立长连接，中转节点收到公网请求后，沿这条已建立的隧道把流量转发回内网设备。

```
公网用户 ──> 中转服务器（公网 IP）── 长连接隧道 ──> 内网设备
```

## 二、frp：开源自建方案

frp 是 [fatedier/frp](https://github.com/fatedier/frp) 开源的快速反向代理工具，支持 TCP/UDP/HTTP/HTTPS 等多种协议，文档见 [gofrp.org](https://gofrp.org/zh-cn/)。你需要一台有公网 IP 的云服务器作为**服务端（frps）**，内网机器运行**客户端（frpc）**。

> [!WARNING]
> frp 自 v0.52 起配置全面迁移为 **TOML 格式**，旧版 `frps.ini` / `frpc.ini` 已弃用，请勿照抄老教程。

### 1. 服务端配置（云服务器）

从 [frp Releases](https://github.com/fatedier/frp/releases) 下载对应系统的压缩包解压，创建 `frps.toml`：

```toml
bindPort = 7000

auth.method = "token"
auth.token = "请换成一段足够长的随机字符串"
```

后台运行：

```bash
./frps -c frps.toml
```

> [!TIP]
> 建议配合 systemd 或 `nohup` 常驻，并记得在云厂商安全组放行 `7000/tcp` 以及后面映射的远程端口。

### 2. 客户端配置（内网机器）

创建 `frpc.toml`，以映射 SSH 和一台内网 Web 服务为例：

```toml
serverAddr = "你的云服务器IP"
serverPort = 7000

auth.method = "token"
auth.token = "与 frps.toml 中保持一致"

[[proxies]]
name = "ssh"
type = "tcp"
localIP = "127.0.0.1"
localPort = 22
remotePort = 6000          # 公网访问端口

[[proxies]]
name = "web"
type = "http"
localIP = "127.0.0.1"
localPort = 8080
customDomains = ["home.example.com"]
```

启动客户端：`./frpc -c frpc.toml`。之后 `ssh -p 6000 user@云服务器IP` 即可连回内网机器。

| 常用配置项 | 说明 |
| --- | --- |
| `type = "tcp" / "udp"` | 转发任意 TCP/UDP 服务 |
| `type = "http" / "https"` | 按域名转发 Web 服务（需在 frps 配置 `vhostHTTPPort`） |
| `localIP / localPort` | 内网服务地址 |
| `remotePort` | 公网映射端口（tcp 类型） |
| `customDomains` | 访问域名（http 类型） |

## 三、Cloudflare Tunnel（cloudflared）

不想自建服务器？Cloudflare Tunnel 免费、无需公网 IP、自动带 HTTPS，把隧道出口直接接在 Cloudflare 边缘节点上。官方文档见 [Cloudflare Tunnel](https://developers.cloudflare.com/tunnel/)。

### 1. 安装 cloudflared

从 [cloudflared Releases](https://github.com/cloudflare/cloudflared/releases) 下载对应平台的二进制（Linux/macOS/Windows 均有），或使用系统包管理器安装：

```bash
# Debian / Ubuntu 可直接下载 .deb 安装；macOS 可用 brew
brew install cloudflared
```

### 2. 临时快速隧道（零配置试用）

一条命令即可获得一个 `trycloudflare.com` 的随机公网地址，适合临时分享：

```bash
cloudflared tunnel --url http://localhost:8080
```

### 3. 命名隧道（固定域名，生产推荐）

```bash
cloudflared tunnel login            # 浏览器授权
cloudflared tunnel create my-home   # 创建隧道
cloudflared tunnel route dns my-home home.example.com  # 绑定自己的域名
```

编写 `~/.cloudflared/config.yml`：

```yaml
tunnel: my-home
credentials-file: /root/.cloudflared/<隧道ID>.json

ingress:
  - hostname: home.example.com
    service: http://localhost:8080
  - service: http_status:404
```

启动：`cloudflared tunnel run my-home`。之后在 Cloudflare 控制台还能叠加 Access 身份验证、限流等安全策略。

## 四、常见使用场景

| 场景 | frp 配置要点 | Cloudflare Tunnel 要点 |
| --- | --- | --- |
| 远程桌面（RDP 3389） | tcp 类型映射 3389 端口 | 直接映射 rdp 到本机（需客户端支持） |
| 网站 | http/https 类型 + 域名 | ingress 指向本地 Web 端口 |
| SSH | tcp 类型映射 22 | 指向 localhost:22 |

## 五、安全注意事项

> 把内网服务暴露到公网 = 把攻击面暴露到公网，务必做好以下防护：

1. **frp 务必设置 token 认证**，且使用高强度随机字符串
2. **绝不直接暴露 22 端口默认配置**：改用密钥登录、禁用 root 密码登录（详见本站《Linux 服务器入门》一文）
3. **最小暴露原则**：只映射需要的端口，用完即关；Web 服务建议叠加 Cloudflare Access 或 frp 的 `allowUsers`/IP 白名单
4. 定期关注 [frp Releases](https://github.com/fatedier/frp/releases) 与 [cloudflared Releases](https://github.com/cloudflare/cloudflared/releases) 的安全更新

## 参考链接

- [fatedier/frp（GitHub）](https://github.com/fatedier/frp)
- [frp 官方文档（gofrp.org）](https://gofrp.org/zh-cn/)
- [Cloudflare Tunnel 官方文档](https://developers.cloudflare.com/tunnel/)
- [cloudflared 下载页](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/downloads/)
