---
title: "本地部署大模型：Ollama 从安装到上手"
published: 2026-08-02
tags: ["AI", "大模型", "Ollama", "教程"]
category: "AI"
description: "从零开始用 Ollama 在本地部署大语言模型：安装、模型拉取与运行、常用命令速查、API 调用，以及内存不足、下载慢等常见问题的解决办法。"
---

想在自己电脑上跑大模型，又不想折腾复杂的部署流程？Ollama 是目前最流行的本地大模型运行工具之一，一条命令就能下载并运行 Qwen、Llama、DeepSeek 等开源模型，还自带兼容 OpenAI 的本地 API。本文记录从安装到调用的完整流程。

## 一、Ollama 是什么

Ollama 是一个开源的大语言模型本地运行工具，支持 Windows、macOS、Linux。它把模型下载、量化、推理服务封装成简单命令，自带 REST API，无需手动配置 Python 环境即可使用。

- 官网：[ollama.com](https://ollama.com)
- 文档：[docs.ollama.com](https://docs.ollama.com)
- 源码：[github.com/ollama/ollama](https://github.com/ollama/ollama)
- 模型库：[ollama.com/library](https://ollama.com/library)

## 二、安装 Ollama

### Windows

前往官网下载页 [ollama.com/download](https://ollama.com/download) 下载 Windows 安装包，双击安装即可。完成后在命令行验证：

```sh
ollama --version
```

### Linux / macOS

Linux 一条命令安装：

```sh
curl -fsSL https://ollama.com/install.sh | sh
```

macOS 可在官网下载 `.dmg` 安装包，或使用 Homebrew：

```sh
brew install ollama
```

> [!TIP]
> 提示：Linux 安装后默认以 systemd 服务方式运行，可用 `sudo systemctl status ollama` 查看运行状态。

## 三、拉取并运行模型

模型都托管在 [Ollama 模型库](https://ollama.com/library)，模型名格式为 `名称:标签`，标签通常表示参数量或量化版本。先拉取模型（以 8B 的 Qwen3 为例，建议内存/显存 8GB 以上）：

```sh
ollama pull qwen3:8b
```

直接运行（首次运行会自动下载）：

```sh
ollama run qwen3:8b
```

进入交互界面后直接输入问题即可，输入 `/bye` 退出。模型选择参考：

| 模型 | 参数量 | 适用场景 |
| --- | --- | --- |
| `qwen3:8b` | 8B | 中文对话、编程，资源占用适中，新手首选 |
| `llama3.3:70b` | 70B | 英文能力更强，需要较大显存/内存 |
| `deepseek-r1:7b` | 7B | 推理任务，输出带思维链过程 |

## 四、常用命令速查

| 命令 | 说明 |
| --- | --- |
| `ollama pull <模型名>` | 下载模型 |
| `ollama run <模型名>` | 运行模型（交互式对话） |
| `ollama list` | 查看已下载的模型 |
| `ollama ps` | 查看当前加载到内存的模型 |
| `ollama stop <模型名>` | 停止运行中的模型，释放内存 |
| `ollama rm <模型名>` | 删除模型 |
| `ollama show <模型名>` | 查看模型详情（参数量、上下文长度等） |
| `ollama serve` | 启动/重启本地 API 服务 |

## 五、通过 API 调用

Ollama 启动后默认在 `http://localhost:11434` 提供 REST API。原生聊天接口：

```bash
curl http://localhost:11434/api/chat -d '{
  "model": "qwen3:8b",
  "messages": [{"role": "user", "content": "介绍一下你自己"}]
}'
```

同时兼容 OpenAI 接口（`/v1/chat/completions`），可直接用 `openai` Python SDK 调用：

```python
from openai import OpenAI

client = OpenAI(base_url="http://localhost:11434/v1", api_key="ollama")
resp = client.chat.completions.create(
    model="qwen3:8b",
    messages=[{"role": "user", "content": "你好"}],
)
print(resp.choices[0].message.content)
```

> [!TIP]
> 提示：本地接口的 `api_key` 随意填写即可，Ollama 默认不校验。

## 六、常见问题

**1. 内存/显存不足**

模型推理需要与参数量匹配的内存，报 `out of memory` 时优先换成更小的模型或更低的量化版本，例如把 `qwen3:32b` 换成 `qwen3:8b`。也可用 `ollama ps` 查看占用、`ollama stop` 及时释放。

**2. 模型下载慢**

默认从官方源下载，国内网络可能较慢。可设置代理加速：

```sh
export HTTPS_PROXY=http://127.0.0.1:7890
ollama pull qwen3:8b
```

**3. 修改模型存储位置**

模型默认存在用户目录，磁盘紧张时可迁移到其他盘。以 Windows 为例，设置环境变量：

```
OLLAMA_MODELS=D:\ollama\models
```

设置后重启 Ollama 服务（`ollama serve`）并重新拉取模型。

> [!TIP]
> 提示：修改 `OLLAMA_MODELS` 后旧模型不会自动迁移，需要重新 `ollama pull`；修改 `OLLAMA_HOST` 可以改变监听地址和端口。

**4. 对话无响应或端口被占用**

先确认服务在运行：`curl http://localhost:11434`，若返回 `Ollama is running` 则正常。端口被占用时换一个端口启动：

```sh
# 修改监听地址与端口
export OLLAMA_HOST=127.0.0.1:11435
ollama serve
```

**5. 多显卡/显存分配异常**

有多个 GPU 时可用 `ollama run` 前的环境变量指定设备：

```sh
export CUDA_VISIBLE_DEVICES=0   # 只使用第一张显卡
```

以上是 Ollama 的基本用法，配合 [Open WebUI](https://github.com/open-webui/open-webui) 等前端还能获得接近 ChatGPT 的网页体验，有需要可以自行折腾。
