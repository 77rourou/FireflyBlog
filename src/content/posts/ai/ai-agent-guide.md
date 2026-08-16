---
title: "AI Agent 入门：从提示词到自动化工作流"
published: 2026-08-06
tags: ["AI", "Agent", "MCP", "教程"]
category: "AI"
description: "一文搞懂 AI Agent：与普通聊天的区别、工具调用与函数调用、MCP 协议、Agent Loop 工作流程，以及常见应用场景和入门建议。"
---

2026 年，AI Agent（智能体）已经成为大模型应用的主流形态：从自动改代码的编程助手，到能查资料、跑脚本的个人助理，"Agent" 一词频繁出现在各种产品里。本文从零梳理 Agent 的核心概念，帮助你把"会聊天"的模型升级成"会干活"的助手。

## 一、什么是 AI Agent

AI Agent 是以大语言模型为"大脑"、能够自主规划、调用外部工具、并根据执行结果持续迭代直至完成目标的程序。它与普通聊天应用的本质区别在于：聊天是"一问一答"，Agent 是"接到目标后自主完成一整条工作流"。

一个 Agent 通常具备四个特征：

- **自主性**：可以独立拆解任务、决定下一步做什么
- **工具使用**：能调用搜索、代码执行、API 等外部能力
- **多步推理**：不是一次生成，而是"想一步、做一步、看结果"
- **循环执行**：根据反馈反复调整，直到任务完成或达到上限

## 二、与普通聊天的区别

| 维度 | 普通聊天 | AI Agent |
| --- | --- | --- |
| 交互方式 | 一问一答，等用户提问 | 接收目标后自主执行多步流程 |
| 工具能力 | 通常没有 | 可调用函数、API、浏览器 |
| 上下文管理 | 单轮对话 | 需要维护记忆与执行状态 |
| 输出形式 | 文本回答 | 文本 + 可执行动作（改文件、发请求） |
| 失败处理 | 答错就结束 | 观察结果、反思并重试 |

一句话总结：聊天模型负责"想"，Agent 负责"想 + 做 + 验证"。

## 三、工具调用与函数调用

工具调用（Tool Calling，早期称 Function Calling）是 Agent 的基础能力：模型不直接执行代码，而是输出一个结构化的调用请求，由外部程序真正执行，再把结果返回给模型。以 OpenAI 为例，可以在请求中声明工具：

```python
from openai import OpenAI

client = OpenAI()

tools = [{
    "type": "function",
    "function": {
        "name": "get_weather",
        "description": "查询指定城市的天气",
        "parameters": {
            "type": "object",
            "properties": {
                "city": {"type": "string"}
            }
        }
    }
}]

response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[{"role": "user", "content": "北京今天天气怎么样？"}],
    tools=tools,
)
```

模型返回的并非最终答案，而是一个 `tool_calls` 请求；程序执行 `get_weather("北京")` 后，把结果作为新的消息发给模型，模型再给出最终回答。官方文档见 [OpenAI Function Calling 指南](https://platform.openai.com/docs/guides/function-calling)。这个"模型提议 → 程序执行 → 结果回填"的闭环，就是一切 Agent 的基石。

## 四、MCP 协议简介

工具越来越多，每个都要单独写适配代码，非常麻烦。2024 年底，Anthropic 开源了 [Model Context Protocol（MCP）](https://modelcontextprotocol.io)，目标是给大模型接工具提供一个统一的"USB-C 接口"；2025 年 OpenAI、Google、Microsoft 等相继宣布支持，MCP 迅速成为事实标准，规范也在持续演进（如 [2025-11-25 版规范](https://modelcontextprotocol.io/specification/2025-11-25) 与 [2026-07-28 版更新](https://blog.modelcontextprotocol.io/posts/2026-07-28/)）。

MCP 的核心角色：

- **Host**：承载 Agent 的客户端（如 Claude Desktop、各类 IDE）
- **Client / Server**：客户端与提供能力的服务端一一配对
- **Server**：暴露三类能力——**Tools**（可调用的工具）、**Resources**（可读取的数据）、**Prompts**（可复用的提示模板）

服务端可以运行在本地（如读写文件、连数据库），也可以远程部署（如查天气、调第三方 API），一套协议通吃。对普通开发者来说，学会"找一个现成 MCP Server 装上"就够了，大量现成 Server 可在 [MCP 官方仓库](https://github.com/modelcontextprotocol) 找到。

## 五、Agent Loop 工作流程

Agent 的核心运行模式叫 **Agent Loop（智能体循环）**，大致是：

1. **接收任务**：理解用户目标
2. **规划**：把任务拆成子步骤，决定调什么工具
3. **执行**：调用工具（函数、搜索、代码执行）
4. **观察**：读取工具返回的结果
5. **反思**：判断结果是否符合预期，决定继续或修正
6. **循环或结束**：任务完成则输出，否则回到第 2 步

用伪代码表示：

```python
observations = []

while not task_done(observations):
    plan = llm.plan(task, observations)          # 规划下一步
    result = execute_tool(plan.tool_call)        # 执行工具
    observations.append(result)                  # 观察结果
```

Anthropic 的经典文章 [Building Effective Agents](https://www.anthropic.com/engineering/building-effective-agents) 把工作流与 Agent 做了清晰区分：流程固定用工作流，需要动态决策才用 Agent，不要为了"智能体"而智能体。

## 六、常见应用场景

| 场景 | 典型做法 |
| --- | --- |
| 编程开发 | 阅读仓库、改代码、跑测试、修报错（各类 AI 编程助手） |
| 智能客服 | 查订单、查知识库、自动生成工单 |
| 数据处理 | 读表格、写 SQL、生成图表 |
| 个人助理 | 查日程、订票、管理邮件 |
| 研究检索 | 多轮搜索、汇总来源、生成报告 |
| 自动化运维 | 看日志、执行命令、处理告警 |

## 七、入门建议

> [!TIP]
> 提示：先做"单 Agent + 少量工具"，跑通后再考虑多智能体协作——多 Agent 的复杂度会指数级上升。

1. **从最小闭环开始**：先做一个"查天气 / 查百科"的小 Agent，理解工具调用闭环
2. **善用现成框架**：[OpenAI Agents SDK](https://openai.com/index/new-tools-for-building-agents/)、LangGraph、Dify 都内置了工具调用与循环机制，不必从零写
3. **写好工具描述**：工具的名称、描述、参数要写清楚"什么时候用、传什么"，模型才能正确选择
4. **加护栏**：对删除、支付等高风险操作加人工确认，设置最大循环次数防止失控
5. **重视可观测性**：记录每一步的规划、调用与结果，出问题时才能定位

Agent 的门槛不在概念，而在工程细节：工具描述、错误处理、上下文管理、成本控制。从一个最小闭环开始，逐步加工具、加场景，你就能把提示词变成真正自动化的工作流。
