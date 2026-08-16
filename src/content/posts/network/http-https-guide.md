---
title: "HTTP/HTTPS 协议详解：从请求到加密"
published: 2026-07-19
tags: ["网络", "HTTP", "HTTPS", "协议", "教程"]
category: "开发"
description: "从 HTTP 请求/响应结构、常用方法与状态码速查表，到 Cookie/Session、HTTPS 与 TLS 握手原理，再到 HTTP/2 与 HTTP/3 新特性，一次讲清 Web 传输协议。"
---

无论前端、后端还是运维，HTTP 都是绕不开的基础协议。本篇笔记把 HTTP/HTTPS 的核心知识点整理成文：请求与响应长什么样、常用方法怎么选、状态码怎么查，以及 HTTPS 如何用 TLS 加密、HTTP/2 和 HTTP/3 又改进了什么。

## 一、HTTP 是什么

HTTP（超文本传输协议）是 Web 的基石，采用**请求-响应（Request-Response）模型**：客户端（浏览器）发起请求，服务器返回响应，一次请求对应一次响应。

```
客户端(浏览器) --① 请求--> 服务器
客户端(浏览器) <--② 响应-- 服务器
```

HTTP 本身是**无状态**协议，服务器不记忆上一次请求——这正是后面需要 Cookie/Session 的原因。

## 二、请求与响应结构

请求由**请求行 + 请求头 + 请求体**组成：

```http
POST /api/login HTTP/1.1
Host: example.com
Content-Type: application/json
User-Agent: Mozilla/5.0

{"username": "admin", "password": "123456"}
```

响应由**状态行 + 响应头 + 响应体**组成：

```http
HTTP/1.1 200 OK
Content-Type: application/json
Set-Cookie: session=abc123; HttpOnly; Path=/

{"code": 0, "msg": "登录成功"}
```

> [!TIP]
> 提示：HTTP/2 及以后把请求行改写为 `:method`、`:path` 等伪头部字段，但语义不变。规范依据见 [RFC 9110](https://datatracker.ietf.org/doc/html/rfc9110) 与 [RFC 9112](https://datatracker.ietf.org/doc/html/rfc9112)。

## 三、常用请求方法

| 方法 | 语义 | 是否携带请求体 | 典型场景 |
| --- | --- | --- | --- |
| `GET` | 获取资源 | 否 | 打开页面、查询数据 |
| `POST` | 提交数据 / 创建资源 | 是 | 登录、表单提交 |
| `PUT` | 整体替换资源 | 是 | 更新用户资料 |
| `DELETE` | 删除资源 | 通常否 | 删除文章 |

> [!WARNING]
> 幂等性：`GET`/`PUT`/`DELETE` 重复执行结果一致（幂等），`POST` 不幂等，因此提交订单等操作不要用 `GET`，避免刷新页面重复下单。

## 四、状态码分类速查表

| 分类 | 含义 | 常见例子 |
| --- | --- | --- |
| 1xx | 信息性响应 | 100 Continue、101 协议切换（WebSocket 升级）、103 Early Hints |
| 2xx | 成功 | 200 OK、201 已创建、204 无内容 |
| 3xx | 重定向 | 301 永久、302 临时、304 未修改（走缓存）、307/308 |
| 4xx | 客户端错误 | 400 参数错误、401 未认证、403 无权限、404 不存在、429 限流 |
| 5xx | 服务器错误 | 500 内部错误、502 网关错误、503 服务不可用、504 网关超时 |

完整速查表见 [MDN：HTTP 响应状态码](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Status)。

## 五、常见 Header

| Header | 作用 |
| --- | --- |
| `Host` | 指定目标域名（虚拟主机必需） |
| `Content-Type` | 请求/响应体类型（如 `application/json`） |
| `Authorization` | 认证凭证（如 `Bearer <token>`） |
| `User-Agent` | 客户端标识 |
| `Cache-Control` | 缓存策略，如 `no-cache`、`max-age=3600` |
| `Set-Cookie` | 服务器下发 Cookie |
| `Access-Control-Allow-Origin` | CORS 跨域控制 |

## 六、Cookie 与 Session

Cookie 是服务器通过 `Set-Cookie` 下发、由浏览器保存的小段文本，之后每次请求都会自动带上。关键属性：

- `HttpOnly`：禁止 JS 读取，防 XSS 窃取
- `Secure`：仅允许 HTTPS 传输
- `SameSite`：`Lax`/`Strict`/`None`，是防 CSRF 的重要手段

```js
document.cookie = "theme=dark; SameSite=Lax; Secure"
```

Session 通常指**服务器端保存的会话数据**，通过 Cookie 中的 sessionId 关联；无 Cookie 场景（如 App）则常用 JWT 等 Token 方案。

## 七、HTTPS 与 TLS 握手

HTTPS = HTTP + TLS。对称加密快但密钥分发难，非对称加密慢但能安全交换密钥，两者结合使用：

1. **ClientHello**：客户端发送支持的 TLS 版本与加密套件
2. **ServerHello**：服务器选定参数，并下发证书（含公钥）
3. **证书校验**：客户端验证证书信任链、有效期与域名
4. **密钥交换**：双方通过 ECDHE 等算法协商出会话密钥（支持前向保密）
5. **加密通信**：之后所有数据用会话密钥做对称加密

TLS 1.3（[RFC 8446](https://datatracker.ietf.org/doc/html/rfc8446)）把握手从 1.2 的两次往返压缩为一次（1-RTT），并移除了 RSA 密钥交换等弱算法。个人站点可免费申请证书，参考 [Let's Encrypt](https://letsencrypt.org/zh-cn/)。

> [!TIP]
>  主流浏览器已逐步淘汰 TLS 1.0/1.1，部署 HTTPS 时至少应支持 TLS 1.2，建议只启用 TLS 1.3。

## 八、HTTP/2 与 HTTP/3

- **HTTP/2**（[RFC 9113](https://datatracker.ietf.org/doc/html/rfc9113)）：二进制分帧、多路复用（一个连接并发多个请求）、HPACK 头部压缩。
- **HTTP/3**（[RFC 9114](https://datatracker.ietf.org/doc/html/rfc9114)）：基于 QUIC（UDP 之上），解决 TCP 队头阻塞，支持 0-RTT 快速建连，网络切换不中断。

| 特性 | HTTP/1.1 | HTTP/2 | HTTP/3 |
| --- | --- | --- | --- |
| 传输层 | TCP | TCP | UDP（QUIC） |
| 多路复用 | 无（需多连接） | 有 | 有 |
| 队头阻塞 | 有 | 传输层仍有 | 基本消除 |
| 建连握手 | TCP + TLS | TCP + TLS | 0-RTT 可选 |

> [!TIP]
> 提示：Nginx 开启 HTTP/2 只需在 `listen 443 ssl http2;` 配置（新版语法为单独 `http2 on;`）；当前主流浏览器与各大 CDN 均已默认支持 HTTP/3。

## 参考链接

- [MDN：HTTP 概述](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Overview)
- [MDN：HTTP 响应状态码](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Status)
- [RFC 9110：HTTP Semantics](https://datatracker.ietf.org/doc/html/rfc9110)
- [RFC 9114：HTTP/3](https://datatracker.ietf.org/doc/html/rfc9114)
- [Let's Encrypt 免费证书](https://letsencrypt.org/zh-cn/)
