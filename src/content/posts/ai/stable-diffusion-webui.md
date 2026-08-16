---
title: "AI 绘画入门：本地部署 Stable Diffusion WebUI"
published: 2026-08-05
tags: ["AI", "AI绘画", "Stable Diffusion", "教程"]
category: "AI"
description: "本地部署 Stable Diffusion WebUI 完整指南：环境要求、安装步骤、模型下载与放置、常用参数说明、LoRA 与 ControlNet 简介，以及显存不足的解决办法。"
---

Stable Diffusion 是目前最流行的开源文生图扩散模型，而 Stable Diffusion WebUI（AUTOMATIC1111 版）是用户量最大的图形界面，点点鼠标就能出图。本文记录本地部署的完整流程与常用参数，让你把"画图"跑在自己电脑上。

## 一、环境要求

| 项目 | 建议配置 |
| --- | --- |
| 显卡 | NVIDIA 显卡（8GB 显存起步，体验较好）；AMD / Apple Silicon 可用但兼容性稍差 |
| 内存 | 16GB 及以上 |
| 磁盘 | 至少 20GB 可用空间（模型体积大） |
| 软件 | Git、Python 3.10 ~ 3.11 |

> [!TIP]
> 官方项目推荐 Python 3.10/3.11，版本过新或过旧都可能导致依赖安装失败。

## 二、安装步骤

1. 安装 [Git](https://git-scm.com/) 与 [Python](https://www.python.org/downloads/)（安装 Python 时勾选 Add to PATH）
2. 克隆项目：

```sh
git clone https://github.com/AUTOMATIC1111/stable-diffusion-webui.git
cd stable-diffusion-webui
```

3. Windows 双击 `webui-user.bat`；Linux / macOS 运行：

```sh
./webui.sh
```

首次启动会下载依赖并安装 PyTorch，耗时较长。看到 `Running on local URL: http://127.0.0.1:7860` 即启动成功，浏览器打开该地址即可使用。

> [!TIP]
> 提示：国内网络下载 PyTorch 慢时，可在启动脚本中配置 pip 镜像源加速。

## 三、模型下载与放置

WebUI 本身不含模型，需要自己下载大模型（Checkpoint，通常为 `.safetensors` 格式）。推荐下载来源：

- [CivitAI](https://civitai.com/)：社区模型站，二次元、写实风格丰富
- [Hugging Face](https://huggingface.co/)：官方与开源模型集中地

下载后按类型放入对应目录：

| 模型类型 | 放置目录 |
| --- | --- |
| 大模型 Checkpoint（.safetensors） | `models/Stable-diffusion/` |
| LoRA（.safetensors） | `models/Lora/` |
| VAE（.safetensors） | `models/VAE/` |
| Embedding（.pt/.safetensors） | `embeddings/` |

放好后回到 WebUI 页面，在左上角下拉框选择模型即可开始生成。

## 四、常用参数

| 参数 | 说明 | 常见取值 |
| --- | --- | --- |
| Prompt | 正向提示词，描述想要的画面 | 英文描述效果普遍更好 |
| Negative prompt | 负向提示词，排除不想要的内容 | `blurry, lowres, bad anatomy` |
| Sampling method | 采样器，影响画质与风格 | `DPM++ 2M Karras`、`Euler a` |
| Steps | 采样步数，过高不一定更好 | 20 ~ 30 |
| CFG Scale | 提示词遵循度，过高易失真 | 7 ~ 12 |
| Width / Height | 分辨率，超出显存会报错 | 从 512×512 起步 |
| Seed | 随机种子，固定后可复现同一构图 | -1 表示随机 |

## 五、LoRA 与 ControlNet 简介

- **LoRA**：轻量微调模型，体积小（几十到几百 MB），用于固定画风、角色或物体，例如"赛博朋克风""某动漫角色"。在 Prompt 中以 `<lora:名称:权重>` 形式引用，如 `<lora:cyberpunk:0.8>`。
- **ControlNet**：通过线稿、深度图、姿态骨架等额外条件约束构图，让生成结果更可控，例如保持人物姿势、给草图自动上色。在「扩展」页安装 ControlNet 插件并下载对应模型后，即可在生成页上传控制图。

## 六、显存不足怎么办

低显存（4GB / 6GB）运行时常见 `CUDA out of memory` 报错，可按以下顺序解决：

1. 在启动脚本的 `COMMANDLINE_ARGS` 中加入低显存参数：

```sh
# webui-user.bat（Windows）或 webui.sh（Linux/macOS）中设置
COMMANDLINE_ARGS=--medvram --xformers
```

`--medvram`（中等显存优化）与 `--lowvram`（低显存优化）按需选择；`--xformers` 可降低显存占用并加速（需 NVIDIA 显卡）。

2. 降低生成分辨率，如 512×512 改为 384×512
3. 关闭高分辨率修复（Hires fix）或调小放大倍率
4. 安装 Tiled VAE 扩展，将大图分块处理

> 修改启动参数后需重启 WebUI 才生效；若启动即报错，先看控制台日志定位原因。

## 七、小结

部署 Stable Diffusion WebUI 的关键就三步：装好 Python/Git、克隆项目跑启动脚本、下载模型放入目录。之后就是不断调参和积累提示词的过程。更详细的资料可参考官方仓库 [AUTOMATIC1111/stable-diffusion-webui](https://github.com/AUTOMATIC1111/stable-diffusion-webui)。
