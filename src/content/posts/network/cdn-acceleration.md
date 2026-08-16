---
title: "CDN 与网站加速原理"
published: 2026-07-20
tags: ["网络", "CDN", "加速", "教程"]
category: "开发"
description: "用一张流程图讲清 CDN 的边缘节点、回源与缓存机制，梳理缓存命中/刷新、TTL 等常见配置，并对比阿里云、腾讯云、华为云、火山引擎等国内主流 CDN 服务商。"
---

网站变慢最常见的瓶颈是：用户离服务器太远、静态资源太多、源站带宽不足。CDN（内容分发网络）正是为解决这些问题而生。本文整理 CDN 的工作原理、缓存机制、常见配置，以及国内主流服务商的选型对比。

## 一、CDN 是什么

CDN 把内容**提前缓存到遍布各地的边缘节点**，让用户从"最近的节点"取数据，而不是每次都回源站。一次请求的完整链路如下：

```
用户请求
  ↓
本地 DNS → CDN 智能调度（按地理位置/运营商就近分配）
  ↓
边缘节点 ──命中(HIT)──→ 直接返回缓存内容
  ↓ 未命中(MISS)
回源（Origin Pull）→ 源站拉取并缓存后返回
```

> [!TIP]
> 提示：这里"就近"取决于用户 IP 的归属地，因此 DNS 解析结果因人而异——这是 CDN 与普通 DNS 解析最大的区别。

## 二、核心概念

- **边缘节点（Edge Node）**：分布在各地的缓存服务器，离用户最近
- **回源（Origin Pull）**：节点未命中缓存时，向源站（你的服务器）请求内容
- **智能调度**：根据用户 IP 的运营商与地理位置，返回最优节点 IP（GSLB 全局负载均衡）

## 三、缓存命中与刷新

- **命中率**：`HIT / (HIT + MISS)`。命中率越高，回源越少，源站压力越小、速度越快，也越省钱
- **URL 刷新**：清除单个或批量文件在节点上的缓存（通常几十秒到几分钟生效）
- **目录刷新**：按目录清除缓存，适合整站改版
- **URL 预热**：把热点文件**提前**推送到各节点，适合大促前"压满"缓存

>  刷新并非即时全局生效，且频繁刷新会降低命中率；正确做法是给文件加上版本号（如 `app.123.js`）或使用内容指纹，而不是每次发布都清全站缓存。

## 四、常见配置：TTL 与缓存规则

| 配置项 | 说明 |
| --- | --- |
| `TTL` | 缓存有效期，通常由源站 `Cache-Control: max-age=3600` 与 CDN 控制台共同决定 |
| 缓存规则 | 按路径/文件类型/查询参数（如忽略 `?v=`）设置是否缓存、缓存多久 |
| 动态请求 | API、登录等接口一般**不缓存**或只缓存短 TTL，避免数据过期 |
| 回源配置 | 回源 HOST、回源协议（HTTP/HTTPS）、超时与重试次数 |

```nginx
# 源站 Nginx 侧配合设置
location ~* \.(css|js|png|jpg|webp|woff2)$ {
    expires 30d;
    add_header Cache-Control "public, immutable";
}
```

## 五、国内主流 CDN 服务商对比

| 服务商 | 特点 | 官网 |
| --- | --- | --- |
| 阿里云 CDN | 市场份额大，与 OSS/WAF/DCDN 生态整合好 | [aliyun.com/product/cdn](https://www.aliyun.com/product/cdn) |
| 腾讯云 CDN | 与 COS、EdgeOne 联动，按量计费灵活 | [cloud.tencent.com/product/cdn](https://cloud.tencent.com/product/cdn) |
| 华为云 CDN | 企业级方案，全球加速能力强 | [huaweicloud.com/product/cdn](https://www.huaweicloud.com/product/cdn.html) |
| 火山引擎 CDN | 字节系，性价比高、报表细、海量带宽资源 | [volcengine.com/product/cdn](https://www.volcengine.com/product/cdn) |
| 百度智能云 CDN | 与百度搜索生态结合，适合百度系站点 | [cloud.baidu.com/product/cdn](https://cloud.baidu.com/product/cdn.html) |

> [!WARNING]
>  使用国内节点必须完成**域名 ICP 备案**，且源站一般也要求国内服务器。海外用户占比高的站点，可考虑"国内 CDN + 海外 CDN"或 Cloudflare 分区域策略（Cloudflare 免费版自带 WAF/DDoS 防护，参考 [What is a CDN?](https://www.cloudflare.com/zh-cn/learning/cdn/what-is-a-cdn/)）。

## 六、使用建议

1. **静态资源优先接入**：图片、CSS/JS、字体文件收益最大
2. **动态接口慎缓存**：可配合边缘函数（如阿里云 DCDN、腾讯 EdgeOne）做动态加速
3. **设置合理 TTL**：避免 TTL 过长导致更新不及时，过短导致回源频繁
4. **防范缓存穿透/雪崩**：为热点 Key 设置回源限流，必要时加布隆过滤器
5. **开启 HTTPS 与 HTTP/2/3**：并配置安全响应头，走全链路加密
6. **盯监控指标**：命中率、回源带宽、请求成功率是三大核心指标

## 参考链接

- [Cloudflare：What is a CDN?](https://www.cloudflare.com/zh-cn/learning/cdn/what-is-a-cdn/)
- [阿里云 CDN 产品页](https://www.aliyun.com/product/cdn)
- [腾讯云 CDN 产品页](https://cloud.tencent.com/product/cdn)
- [华为云 CDN 产品页](https://www.huaweicloud.com/product/cdn.html)
- [火山引擎 CDN 产品页](https://www.volcengine.com/product/cdn)
- [百度智能云 CDN 产品页](https://cloud.baidu.com/product/cdn.html)
