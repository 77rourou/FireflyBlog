---
title: "JSON 与 JSONPath：数据处理实战"
published: 2026-07-18
tags: ["JSON", "JSONPath", "jq", "教程"]
category: "开发"
description: "从 JSON 语法、Python / JavaScript 解析与生成，到 JSONPath 查询与 jq 命令行工具，最后总结编码、大文件与格式校验等常见坑。"
---

JSON（JavaScript Object Notation）是目前最通用的数据交换格式，几乎所有 Web API 都以它作为默认响应格式。本篇覆盖 JSON 语法、主流语言的解析与生成、JSONPath 查询、jq 命令行处理，以及实践中常见的坑。

## 一、JSON 语法基础

JSON 的语法规则很简单（官方定义见 [json.org](https://www.json.org/json-en.html)）：

- 对象用 `{}` 包裹，键值对用冒号分隔、逗号连接，**键必须加双引号**
- 数组用 `[]` 包裹
- 值可以是字符串、数字、布尔值、`null`、对象或数组
- 字符串必须用双引号（不能用单引号），末尾**不允许有逗号**

```json
{
  "title": "JSON 与 JSONPath：数据处理实战",
  "tags": ["JSON", "jq"],
  "published": "2026-08-28",
  "featured": false,
  "wordCount": 1200
}
```

## 二、Python 解析与生成

Python 使用标准库 `json`（官方文档见 [docs.python.org/3/library/json](https://docs.python.org/3/library/json.html)）：

```python
import json

data = {"title": "Firefly 博客", "tags": ["Astro", "Svelte"]}

# 生成：ensure_ascii=False 保留中文，indent 美化输出
text = json.dumps(data, ensure_ascii=False, indent=2)
print(text)

# 解析
parsed = json.loads(text)
print(parsed["title"])      # Firefly 博客
print(parsed["tags"][0])    # Astro
```

读写文件用 `json.load` / `json.dump`（注意对应关系：`loads`/`dumps` 处理字符串，`load`/`dump` 处理文件对象）。

## 三、JavaScript 解析与生成

JavaScript 内置 `JSON` 对象，浏览器与 Node.js 通用：

```javascript
const data = { title: "Firefly 博客", tags: ["Astro", "Svelte"] };

// 生成
const text = JSON.stringify(data, null, 2);
console.log(text);

// 解析（注意：JSON.parse 遇到非法 JSON 会抛异常）
const parsed = JSON.parse(text);
console.log(parsed.tags.join(","));
```

## 四、JSONPath 查询

JSON 层级深、数据量大时，逐层取值的代码既啰嗦又易错。JSONPath 用类似 XPath 的路径表达式直接定位数据，2024 年 1 月发布的 [RFC 9535（JSONPath: Query Expressions for JSON）](https://www.rfc-editor.org/rfc/rfc9535) 已成为权威规范。核心语法：

| 表达式 | 含义 |
| --- | --- |
| `$` | 根节点 |
| `.name` | 子节点 |
| `..price` | 递归下降查找所有 `price` |
| `[*]` | 数组通配 |
| `[0]` / `[-1]` | 下标访问 / 倒数第一个 |
| `[?(@.price < 10)]` | 过滤表达式 |
| `['a','b']` | 多字段选择 |

```jsonpath
$.store.book[?(@.price < 10)].title
```

对下方数据，该表达式会返回价格小于 10 的所有书名：

```json
{
  "store": {
    "book": [
      { "title": "正则入门", "price": 8.5 },
      { "title": "Git 实战", "price": 15 },
      { "title": "JSON 指南", "price": 6 }
    ]
  }
}
```

## 五、jq 命令行工具

[jq](https://jqlang.github.io/jq/) 是处理 JSON 的命令行瑞士军刀，由 jqlang 维护，语法与 JSONPath 类似但更强大，支持管道、函数与条件逻辑：

```bash
# 提取字段
echo '{"name":"Firefly","stars":1200}' | jq '.name'

# 过滤数组：选出价格小于 10 的书名
cat store.json | jq '.store.book[] | select(.price < 10) | .title'

# 格式化输出（等价于美化）
cat messy.json | jq .

# 校验 JSON 是否合法（非法时非零退出并报错）
jq empty file.json
```

> [!TIP]
>  写 jq 表达式时建议先小步验证：先 `.store`，再 `.store.book`，逐步加上 `[]` 与 `select`，比一次写完整表达式更容易定位问题。在线体验可用 [jq play](https://jqplay.org/)。

## 六、常见坑：编码 / 大文件 / 格式校验

### 编码问题

Python 的 `json.dumps` 默认 `ensure_ascii=True`，中文会被转成 `\uXXXX`，务必显式传 `ensure_ascii=False`；读取文件时也要指定 `encoding="utf-8"`，避免 Windows 默认编码导致的乱码。

### 大文件处理

`json.load` 会一次性把整个文件读入内存，处理上 GB 的日志或导出文件时容易内存溢出。此时应改用流式解析（如 Python 的 `ijson` 库），逐条处理 JSON 数组中的元素；若只是统计类任务，优先用 jq 在命令行完成，避免把大数据灌进应用内存。

### 格式校验

接口联调时最常见的错误是「后端返回的 JSON 少个逗号 / 多个注释 / 键没加引号」。先用 jq 或 `python -m json.tool file.json` 校验格式，再排查业务逻辑；另外注意 JSON 不允许注释，前后端对接时别把 `//` 注释写进响应。

> 单引号不是合法的 JSON 字符串定界符，JavaScript 对象字面量也不是 JSON。`{ 'a': 1 }` 在 JSON 里是非法格式，很多「JSON 解析报错」都源于此。

## 小结

掌握 JSON 语法与语言内置 API 是基本功，JSONPath 解决「怎么查」，jq 解决「怎么在命令行快速处理」，而编码、大文件、格式校验三个坑则贯穿于所有实战场景。把这套组合用熟，处理接口数据会顺手很多。
