---
title: "RESTful API 设计规范"
published: 2026-07-29
tags: ["API", "RESTful", "设计规范", "教程"]
category: "开发"
description: "从资源命名、HTTP 方法语义、状态码使用到版本管理与 JWT 鉴权，系统梳理 RESTful API 设计规范，并给出分页、过滤、排序与错误返回的统一约定。"
---

RESTful API 是当前 Web 服务最主流的接口风格，核心思想是把一切抽象为「资源」，用 HTTP 方法表达操作。设计规范没有绝对标准，但社区有高度共识，本篇按模块梳理一套可落地的约定。

## 一、资源命名规范

- 用**名词复数**表示资源集合：`/users`、`/articles`，不要用动词（`/getUsers` 是反例）
- 层级关系用嵌套表达：`/users/{id}/posts` 表示某用户的文章
- 一律小写，单词间用连字符 `-`，避免下划线与驼峰
- 子资源超过两层嵌套时，考虑用查询参数代替，保持 URL 简洁

```
GET    /users/{id}
POST   /articles
GET    /articles/{id}
DELETE /articles/{id}
```

## 二、HTTP 方法语义

每个方法对应一种操作（语义定义见 [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110)）：

| 方法 | 语义 | 幂等 |
| --- | --- | --- |
| `GET` | 查询资源，无副作用 | 是 |
| `POST` | 创建资源，或触发非幂等操作 | 否 |
| `PUT` | 整体替换资源 | 是 |
| `PATCH` | 部分更新资源 | 否 |
| `DELETE` | 删除资源 | 是 |

> [!WARNING]
>  `GET` 请求不应修改服务器状态；用 `POST` 代替 `GET` 执行「搜索」可以避免 URL 过长和日志泄露查询条件，这是常见的折衷做法。

## 三、状态码使用

状态码是接口语义的一部分，不要「永远返回 200 + 业务码」：

| 状态码 | 场景 |
| --- | --- |
| `200 OK` | 查询成功 |
| `201 Created` | 创建成功，返回新资源 |
| `204 No Content` | 删除成功，无返回体 |
| `400 Bad Request` | 参数缺失或格式错误 |
| `401 Unauthorized` | 未认证（缺少或无效 Token） |
| `403 Forbidden` | 已认证但无权限 |
| `404 Not Found` | 资源不存在 |
| `409 Conflict` | 资源状态冲突（如重复创建） |
| `422 Unprocessable Entity` | 请求语义错误（如邮箱格式非法） |
| `429 Too Many Requests` | 触发限流 |
| `500 / 503` | 服务器内部错误 / 服务不可用 |

完整清单见 [MDN HTTP 状态码](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Status)。

## 四、版本管理

接口演进不可避免，常用两种版本策略：

- **URL 路径版本**（最常用）：`/api/v1/users`、`/api/v2/users`，直观、易于缓存与调试
- **请求头版本**：`Accept: application/vnd.example.v1+json`，URL 干净但排查成本高

> [!TIP]
> 建议：小改动向后兼容就不升版本，破坏性变更必须升版本，并为旧版本预留废弃（deprecated）过渡期。

## 五、鉴权：Token 与 JWT

主流方案是基于 Token 的 Bearer 鉴权，JWT 是其中最常用的自包含 Token：

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

- Token 放在 `Authorization` 请求头，**不要放在 URL 查询参数**（会进日志与历史记录）
- JWT 由 `Header.Payload.Signature` 三段组成，服务端只验签不查库，适合无状态分布式场景
- 必须设置过期时间，走 HTTPS 传输，密钥妥善保管；退出登录等服务端主动失效的场景应改用可撤销的会话 Token 或维护黑名单

## 六、分页 / 过滤 / 排序

列表接口应统一支持这三类查询参数：

```
GET /api/v1/articles?page=2&page_size=20&status=published&sort=-created_at
```

- 分页：`page` + `page_size`（或游标 `cursor`），返回体中带 `total` 与 `has_more`
- 过滤：语义化字段名 `?status=published&tag=Astro`
- 排序：`sort=created_at` 升序，`sort=-created_at` 降序（负号表示倒序）
- 约定俗成：分页上限如 100，超过则按上限截断或返回 400

## 七、错误返回格式

统一错误体，让客户端不用猜字段：

```json
{
  "error": {
    "code": "ARTICLE_NOT_FOUND",
    "message": "文章不存在",
    "details": { "id": "abc123" }
  }
}
```

约定：`code` 是机器可读的错误码（稳定、不随文案变化），`message` 是人类可读描述（可本地化），`details` 放附加信息（如校验失败的字段列表）。配套一份错误码文档，客户端据此做分支处理。

## 八、文档工具：OpenAPI / Swagger

接口文档应与代码同步维护，最通用的方案是 OpenAPI：

- [OpenAPI 规范](https://spec.openapis.org/oas/latest.html)（原 Swagger 规范）用 YAML/JSON 描述路径、参数、请求响应结构
- 从 OpenAPI 文件可直接生成交互式文档（[Swagger UI](https://swagger.io/)）、客户端 SDK 与 Mock 服务
- 现代框架多支持注解自动生成：FastAPI、SpringDoc、NestJS 等都能「代码即文档」，避免文档过期

> [!WARNING]
> 设计口诀：**资源名词化、方法语义化、状态码准确、错误体统一、文档自动化**。规范的价值在于团队一致性，先定好约定，再逐步迭代。

## 小结

RESTful 设计的关键不是「严格符合某标准」，而是让接口可预期、可维护。把资源命名、方法语义、状态码、版本、鉴权、列表查询与错误返回这七块约定固化下来，配合 OpenAPI 文档自动化，团队协作的摩擦会小很多。
