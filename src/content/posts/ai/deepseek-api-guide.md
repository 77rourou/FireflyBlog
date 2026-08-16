---
title: "DeepSeek API 使用指南：从注册到调用"
published: 2026-08-03
tags: ["AI", "DeepSeek", "API", "教程"]
category: "AI"
description: "DeepSeek API 完整上手教程：注册与获取 API Key、OpenAI 兼容接口说明、Python 调用示例、deepseek-chat 与 deepseek-reasoner 的区别，以及计费与限流注意事项。"
---

DeepSeek 是广受关注的国产大模型，其 API 以价格低、上下文长、完全兼容 OpenAI 接口著称，被大量开发者用于聊天机器人、Agent、翻译和自动化脚本。本文记录从注册到 Python 调用的完整流程。

## 一、注册与获取 API Key

1. 访问 [DeepSeek 开放平台](https://platform.deepseek.com/) 注册账号
2. 登录后在「API Keys」页面点击「创建 API Key」
3. 复制并妥善保存 Key——它只完整显示一次，丢失需重新创建

> [!TIP]
> API Key 相当于账户密码，切勿提交到 Git 仓库或写进前端代码，建议通过环境变量注入。

官方文档：[api-docs.deepseek.com](https://api-docs.deepseek.com/zh-cn/)

## 二、两个核心模型

DeepSeek API 目前提供两个模型：

| 模型名 | 定位 | 特点 |
| --- | --- | --- |
| `deepseek-chat` | 通用对话 | 对应 DeepSeek-V3 系列，响应快、价格低，适合日常对话、写作、编程 |
| `deepseek-reasoner` | 推理模型 | 对应 DeepSeek-R1 系列，先深度思考再作答，适合数学、逻辑、复杂推理 |

选择建议：日常任务用 `deepseek-chat`；需要严密推导、可解释过程时用 `deepseek-reasoner`。注意 reasoner 的思考过程不会通过普通接口返回，且通常更慢、单价更高。

## 三、OpenAI 兼容接口

DeepSeek API 的消息格式与 OpenAI 完全一致，Base URL 为：

```
https://api.deepseek.com
```

也支持 `https://api.deepseek.com/v1` 写法，大多数 OpenAI SDK 只需修改 `base_url` 和 `api_key` 即可无缝切换，无需改业务代码。

## 四、Python 调用示例

安装 OpenAI SDK：

```sh
pip install openai
```

普通对话：

```python
import os
from openai import OpenAI

client = OpenAI(
    api_key=os.environ["DEEPSEEK_API_KEY"],  # 推荐从环境变量读取
    base_url="https://api.deepseek.com",
)

resp = client.chat.completions.create(
    model="deepseek-chat",
    messages=[
        {"role": "system", "content": "你是一个简洁的中文助手。"},
        {"role": "user", "content": "用一句话解释什么是向量数据库"},
    ],
)
print(resp.choices[0].message.content)
```

流式输出：

```python
stream = client.chat.completions.create(
    model="deepseek-chat",
    messages=[{"role": "user", "content": "写一首五言绝句"}],
    stream=True,
)
for chunk in stream:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")
```

## 五、计费与限流注意事项

- 价格以官方[模型与价格页](https://api-docs.deepseek.com/quick_start/pricing/)为准，按输入/输出 token 分别计费，价格会随版本调整，接入前先确认当前费率
- 上下文窗口为 64K，超出部分会被截断，长文本任务建议先做摘要或分块处理
- 接口存在并发与速率限制，触发限流会返回 429 错误，需要做退避重试：

```python
import time

for attempt in range(3):
    try:
        resp = client.chat.completions.create(model="deepseek-chat", messages=msgs)
        break
    except Exception:
        time.sleep(2**attempt)  # 简单指数退避
```

- 注意 token 计量方式（中文一个汉字通常对应 1~2 个 token），预算敏感场景可开启流式输出并设置 `max_tokens`

> [!TIP]
> 提示：新注册账户通常有免费体验额度（以平台活动为准），正式上线前留意官方公告。

## 六、常见错误排查

| 错误码/现象 | 原因 | 解决办法 |
| --- | --- | --- |
| 401 Invalid Authentication | API Key 错误或已失效 | 重新创建 Key，检查是否多复制了空格 |
| 402 Insufficient Balance | 账户余额不足 | 前往平台充值后再试 |
| 429 Rate Limit | 触发速率限制 | 降低请求频率，加入退避重试逻辑 |
| 400 Context Length Exceeded | 输入超出 64K 上下文 | 精简对话历史或做摘要分块 |
| 返回内容被截断 | 超出 `max_tokens` | 调大 `max_tokens` 或拆分任务 |

## 七、小结

DeepSeek API 上手成本极低：注册 → 创建 Key → 改 `base_url` 即可跑通。函数调用、JSON 输出等进阶能力可查阅官方文档 [api-docs.deepseek.com](https://api-docs.deepseek.com/zh-cn/)。
