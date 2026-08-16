---
title: "DNS 解析原理与 hosts 文件实战"
published: 2026-07-22
tags: ["网络", "DNS", "hosts", "教程"]
category: "开发"
description: "通俗拆解 DNS 解析的完整流程，介绍 A/AAAA/CNAME/MX/TXT 等常用记录类型与 nslookup、dig 排查工具，最后讲透 hosts 文件原理及 GitHub520 类加速工具的机制。"
---

浏览器输入域名能打开网页，背后是 DNS（域名系统）在默默工作。理解 DNS 解析流程、会用 `dig`/`nslookup` 排查问题、玩转 hosts 文件，是排查"网站打不开""域名解析异常"这类网络问题的基本功。

## 一、DNS 解析工作流程

DNS 本质上是一个**全球分布式的键值数据库**，把域名映射到 IP。一次完整的解析过程大致如下：

```
用户输入域名
  ↓
① 本地缓存（浏览器 / 操作系统）
  ↓ 未命中
② 递归解析器（运营商 DNS / 8.8.8.8 等）
  ↓ 未命中
③ 根域名服务器（. 根）→ 指引到 .com 顶级域服务器
  ↓
④ 顶级域服务器（.com TLD）→ 指引到权威服务器
  ↓
⑤ 权威服务器（托管该域名的 DNS 服务商）→ 返回最终 IP
```

每一层的查询结果都会被各级缓存一段时间（由记录的 TTL 决定），这也是为什么修改 DNS 记录后通常要等几分钟到几小时才全球生效。

## 二、常用 DNS 记录类型

| 记录类型 | 作用 | 示例 |
| --- | --- | --- |
| `A` | 域名 → IPv4 地址 | `example.com. 3600 IN A 93.184.216.34` |
| `AAAA` | 域名 → IPv6 地址 | `example.com. 3600 IN AAAA 2606:2800:...` |
| `CNAME` | 域名 → 另一个域名（别名） | `www.example.com CNAME example.com` |
| `MX` | 邮件服务器，带优先级 | `example.com MX 10 mail.example.com` |
| `TXT` | 任意文本，常用于域名验证/SPF | `example.com TXT "v=spf1 include:_spf.google.com ~all"` |
| `NS` | 指定该域名的权威服务器 | `example.com NS ns1.cloudflare.com` |

> [!NOTE]
> 提醒：`CNAME` 记录不能与同名的 `A`/`MX` 等记录共存（RFC 规定），做 CDN 接入时常见"冲突"报错就源于此。

## 三、nslookup 与 dig 的使用

Windows 自带 `nslookup`，Linux/macOS 推荐 `dig`（Ubuntu 安装 `sudo apt install dnsutils`）。

```bash
# 查询 A 记录
nslookup example.com
dig example.com

# 指定记录类型
dig example.com MX
dig example.com TXT +short

# 指定 DNS 服务器查询（绕过本地缓存）
nslookup example.com 8.8.8.8
dig @1.1.1.1 example.com A

# 跟踪完整解析链路（排查缓存/污染神器）
dig +trace example.com
```

> [!TIP]
> 排查思路：先 `dig @8.8.8.8` 看权威结果是否正常，再对比本地运营商 DNS 的结果，两者不一致基本可以判定为本地缓存或 DNS 污染问题。

## 四、hosts 文件原理与修改

hosts 是一个**本地静态的域名 → IP 映射表**，优先级高于 DNS 查询：系统解析域名时会先查 hosts，命中就直接使用，不再发起网络请求。

| 系统 | hosts 路径 |
| --- | --- |
| Windows | `C:\Windows\System32\drivers\etc\hosts` |
| Linux / macOS | `/etc/hosts` |

文件格式非常简单，一行一条映射，`#` 开头是注释：

```
# IP地址        域名
192.168.1.10    nas.local
127.0.0.1       localhost
```

修改方法（Windows 需以管理员身份编辑，Linux/macOS 用 sudo）：

```bash
sudo nano /etc/hosts          # Linux/macOS 编辑
# 保存后立即生效，无需重启；浏览器可刷新或重启验证
```

常见用途：内网开发环境域名映射、屏蔽广告域名（指向 `127.0.0.1`）、临时指定服务器测试。

## 五、DNS 污染与 GitHub520 加速原理

**DNS 污染**指网络链路中的中间设备对 DNS 应答进行伪造/篡改，把域名解析到错误 IP，导致网站无法访问。由于污染发生在**递归解析阶段**，且大多针对 UDP 明文查询，用户难以通过换 DNS 服务器根治。

**hosts 加速的原理**就是绕开整个 DNS 查询链路：直接把目标域名的**真实、优选 IP**写死在 hosts 里，请求完全不经过会被污染的递归解析器。

[GitHub520](https://github.com/521xueweihan/GitHub520) 就是这类工具的代表：它定期通过脚本探测 GitHub 及其 CDN 域名的可用 IP，生成优化后的 hosts 内容，用户只需一键执行即可更新：

```bash
# GitHub520 一键更新 hosts（脚本会请求其维护的 hosts 列表）
bash -c "$(curl -sL https://raw.githubusercontent.com/521xueweihan/GitHub520/main/install.sh)"
```

> [!WARNING]
> hosts 方案的两个局限：一是 IP 会随 CDN 调度变化，**需要定期重新拉取**（GitHub520 支持定时任务自动更新）；二是只对列表内的域名生效，无法解决所有网络问题。不要轻信来路不明的"hosts 加速包"，谨防被指向恶意 IP。

## 参考链接

- [GitHub520（521xueweihan）](https://github.com/521xueweihan/GitHub520)
- [GitHub520 hosts 原始列表](https://raw.githubusercontent.com/521xueweihan/GitHub520/main/hosts)
- [RFC 1035：Domain Names - Implementation and Specification](https://datatracker.ietf.org/doc/html/rfc1035)
