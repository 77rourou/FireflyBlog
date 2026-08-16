---
title: "DeepSeek Harness 入门：官方 Web 端与社区桌面客户端"
published: 2026-08-09
tags: ["AI", "DeepSeek", "DeepSeek Harness", "Agent", "教程"]
category: "AI"
description: "DeepSeek 开源的 Agent 框架 Harness 全面指南：核心特性、官方 Web 端使用、CLI 方式，以及 6 款社区桌面客户端的盘点与选择建议。"
---

DeepSeek 开源的 Agent 框架 **DeepSeek Harness** 一发布就引爆了社区（GitHub 一夜涨星数万），被称为"Agent 界的 Android"。它最大的特点是**一切皆插件**：模型、工具、Agent 循环全部可以替换和扩展。本文带你认识 Harness，并盘点官方形态与社区桌面客户端。

## 一、DeepSeek Harness 是什么

DeepSeek Harness 是 DeepSeek 开源的首款 Agent 框架 / AI 工作台，官方仓库：[github.com/deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness)。

与传统的"聊天机器人"不同，Harness 定位是**可编程的 Agent 执行引擎**：

- **一切皆插件**：模型插件（LLM 可替换）、工具插件、Agent Loop 插件，想换哪块换哪块，还能让 Agent 自己改装自己
- **省 Token**：内置上下文压缩（compaction）等机制，长会话更省
- **多 Agent 协作**：支持子代理（subagent）派发，大任务拆给多个 Agent 并行处理
- **工程化能力**：技能（Skill）、目标管理（Goal）、计划（Plan）、工作流（Workflow）、定时任务（Schedule）、任务清单（Todo）一应俱全
- **生态兼容**：支持 MCP（Model Context Protocol）接入外部工具、沙箱运行代码、终端/Shell 操作、凭证管理（Credentials）等

简单说：它不是一个"聊天网页"，而是一个把模型、工具、执行流程全部模块化的 **Agent 开发与运行平台**。

## 二、官方形态：Web 端 + CLI

官方目前提供两种使用形态（**官方没有出桌面客户端**，社区讨论区官方也确认了这一点）：

### 1. Web 端（Web GUI）

安装并启动后，在浏览器中访问本地地址（如 `http://127.0.0.1:17890`）即可打开图形界面。Web 端适合日常使用：

- 对话与多会话管理
- 配置模型（可接 DeepSeek API、OpenAI 兼容接口或本地模型）
- 管理技能、插件、目标与定时任务
- 查看 Agent 执行过程与日志

### 2. CLI（命令行）

适合脚本化、批量化和服务器场景，可以在终端里直接驱动 Agent，便于集成到自己的自动化流程中。

> [!TIP]
> 提示：官方仓库的 Release 页面和文档是获取安装包与使用说明的权威渠道，认准 `deepseek-ai` 官方组织。

## 三、社区桌面客户端盘点

由于官方只有 Web 端，社区涌现了一批桌面客户端，把 Harness 包装成"本地 App"的体验。以下是目前较活跃的几个项目：

| 项目 | 特点 | 地址 |
| --- | --- | --- |
| **deepseek-harness-desktop**（ningbainb） | Windows 桌面客户端，零配置安装器，集成 Codex、插件、技能、SSH、移动端远程访问，自带 11 套皮肤 | [GitHub](https://github.com/ningbainb/deepseek-harness-desktop) |
| **Deepseek-Harness-Desktop**（ChisaAlter） | Electron 桌面壳，支持主题、背景图等多种个性化配置 | [GitHub](https://github.com/ChisaAlter/Deepseek-Harness-Desktop) |
| **deepseek-harness-desktop**（chyra-moon） | 官方 Web UI 的 1:1 复刻版 Windows 桌面应用 | [GitHub](https://github.com/chyra-moon/deepseek-harness-desktop) |
| **DSHDesktop**（CCMu04） | 非官方 Windows 桌面客户端，直接包装未修改的官方 Web UI | [GitHub](https://github.com/CCMu04/DSHDesktop) |
| **DeepSeek-Harness-GUI**（yuanqiyibiansheng） | 社区 GUI 封装 | [GitHub](https://github.com/yuanqiyibiansheng/DeepSeek-Harness-GUI) |
| **@ahikl/dsh-desktop** | npm 分发的桌面端封装 | [npm](https://www.npmjs.com/package/@ahikl/dsh-desktop) |

### 怎么选？

- **想开箱即用、功能最全**：选 ningbainb 的 [deepseek-harness-desktop](https://github.com/ningbainb/deepseek-harness-desktop)，零配置安装器 + 皮肤 + SSH/远程访问，省心
- **想和官方 Web UI 完全一致**：选 chyra-moon 或 CCMu04 的复刻版，界面 1:1，上手零学习成本
- **想深度个性化**：选 ChisaAlter 的 Electron 版，主题和背景随便换
- **习惯用包管理器**：可以试试 `@ahikl/dsh-desktop`

## 四、快速开始

1. **获取官方 Harness**：前往官方 [GitHub 仓库](https://github.com/deepseek-ai/deepseek-harness) 查看安装说明，按文档启动 Web 端或 CLI
2. **配置模型**：在设置中填入你的模型 API（DeepSeek API、OpenAI 兼容接口等），或接入本地模型（如 Ollama）
3. **体验 Agent**：新建会话，给 Agent 布置一个任务（比如"帮我写一个脚本并运行"），观察它调用工具、执行命令、给出结果的全过程
4. **进阶玩法**：安装技能（Skill）和 MCP 工具、创建定时任务、用子代理拆解大任务、用工作流编排多步流程

## 五、注意事项

> [!WARNING]
> 社区桌面端均为**第三方非官方项目**，使用时注意：
>
> [!WARNING]
> - 优先从 GitHub Releases 等官方发布渠道下载，警惕来路不明的安装包
> - 桌面端会加载你的 API Key / 凭证，确认项目开源可审计后再填入
> - 社区项目可能滞后于官方版本，遇到问题先到对应仓库提 Issue
> [!TIP]
> - 官方功能更新以 [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness) 为准

## 参考链接

- [DeepSeek Harness 官方仓库](https://github.com/deepseek-ai/deepseek-harness)
- [ningbainb/deepseek-harness-desktop](https://github.com/ningbainb/deepseek-harness-desktop)
- [ChisaAlter/Deepseek-Harness-Desktop](https://github.com/ChisaAlter/Deepseek-Harness-Desktop)
- [chyra-moon/deepseek-harness-desktop](https://github.com/chyra-moon/deepseek-harness-desktop)
- [CCMu04/DSHDesktop](https://github.com/CCMu04/DSHDesktop)
- [@ahikl/dsh-desktop（npm）](https://www.npmjs.com/package/@ahikl/dsh-desktop)
- [官方讨论：#601 官方是 Web 端而非桌面端](https://github.com/deepseek-ai/deepseek-harness/discussions/601)
