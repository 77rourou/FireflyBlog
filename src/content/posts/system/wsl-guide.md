---
title: "WSL 安装配置指南：Windows 上的 Linux"
published: 2026-07-05
tags: ["Windows", "WSL", "Linux", "教程"]
category: "系统"
description: "从零开始配置 WSL：WSL1 与 WSL2 的区别、wsl --install 一键安装、发行版选择、文件互访、终端与 VS Code 集成，以及网络、内存、磁盘和迁移到其他盘的常见问题。"
---

WSL（Windows Subsystem for Linux，适用于 Linux 的 Windows 子系统）是微软官方提供的兼容层，让你无需虚拟机就能在 Windows 上直接运行完整的 Linux 环境。它天然支持 VS Code、Docker 等工具链，是很多开发者在本机体验 Linux 的首选方案。本篇基于微软官方文档整理，介绍从安装到日常使用的完整流程。

## 一、WSL 是什么

WSL 由微软开发并集成在 Windows 10/11 中，它提供：

- **真实的 Linux 内核**：WSL2 使用轻量级虚拟机运行完整的 Linux 内核，兼容绝大多数 Linux 软件
- **无缝互操作**：可以直接在 Windows 中调用 Linux 命令，也可以在 Linux 中调用 Windows 程序
- **零开销启动**：秒级启动、按需分配内存，比传统虚拟机轻量得多

> [!TIP]
> 官方定位：WSL 是微软官方支持的功能，文档齐全、长期维护，[官方介绍页](https://learn.microsoft.com/zh-cn/windows/wsl/about)有详细说明。

## 二、WSL1 与 WSL2 的区别

微软将 WSL 发展了两代，核心区别如下：

| 对比项 | WSL1 | WSL2 |
| --- | --- | --- |
| 架构 | 翻译层（模拟 Linux 系统调用） | 轻量级虚拟机 + 完整 Linux 内核 |
| 兼容性 | 部分软件无法运行 | 几乎完整的 Linux 兼容性 |
| 性能 | 文件 I/O 较快 | 编译、计算密集任务更快 |
| Docker 支持 | 不支持 | 原生支持 Docker Desktop |
| 默认版本 | 已不再作为默认 | **当前默认版本** |

>  结论：除非有特殊兼容性需求（如跨系统文件读写频繁），一律使用 **WSL2**。两者的官方对比见 [比较 WSL 版本](https://learn.microsoft.com/zh-cn/windows/wsl/compare-versions)。

## 三、一键安装

Windows 10（2004 及以上）和 Windows 11 都支持，最简单的方式是管理员身份打开 PowerShell 或 CMD，执行：

```powershell
# 安装 WSL 及默认发行版（Ubuntu）
wsl --install
```

安装完成后重启电脑，首次启动会提示创建 Linux 用户名和密码。也可以指定发行版：

```powershell
# 查看可用的发行版列表
wsl --list --online

# 安装指定发行版，如 Debian
wsl --install -d Debian
```

> 旧版 Windows 需要手动启用"适用于 Linux 的 Windows 子系统"与"虚拟机平台"功能，详细步骤见[官方安装文档](https://learn.microsoft.com/zh-cn/windows/wsl/install)。

## 四、发行版选择

不同发行版适合不同场景，常用的有：

| 发行版 | 特点 | 适合场景 |
| --- | --- | --- |
| Ubuntu | 社区最大、教程最多 | 新手首选 |
| Debian | 稳定、轻量 | 服务器环境 |
| Kali Linux | 内置大量安全工具 | 渗透测试、CTF |
| openSUSE / Fedora | 更新快、技术新 | 尝鲜 RHEL 系生态 |

> 切换默认发行版：`wsl --set-default <发行版名>`；查看已安装的发行版：`wsl --list --verbose`。

## 五、文件系统互访

WSL2 与 Windows 之间通过 UNC 路径互相访问：

```bash
# 在 WSL 中访问 Windows 文件（/mnt/c 即 C 盘）
cd /mnt/c/Users/你的用户名/Desktop

# 在 Windows 中访问 WSL 文件（资源管理器地址栏输入）
\\wsl$\Ubuntu\home\你的用户名
```

> [!TIP]
> 性能提示：跨文件系统读写（`/mnt/c`）走网络协议栈，速度较慢。**项目文件建议放在 WSL 的 Linux 文件系统内**（如 `~/projects`），配合 VS Code 远程开发可兼顾性能与体验。

## 六、与 Windows 终端、VS Code 集成

- **Windows Terminal**：微软官方终端，自动识别 WSL 发行版并生成标签页配置，见 [Windows Terminal 文档](https://learn.microsoft.com/zh-cn/windows/terminal/)
- **VS Code**：安装官方 [WSL 扩展](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-wsl) 后，在 WSL 中执行 `code .` 即可远程打开项目，调试、终端、Git 全部无缝衔接，官方教程见 [VS Code 中使用 WSL](https://learn.microsoft.com/zh-cn/windows/wsl/tutorials/wsl-vscode)

```bash
# 在 WSL 中直接启动 VS Code 打开当前目录
cd ~/projects/my-app && code .
```

## 七、常见问题

### 1. 网络问题

- **代理设置**：WSL2 默认通过 NAT 共享 Windows 网络。若使用代理软件，需在 WSL 中配置 HTTP 代理指向 Windows 主机 IP
- **防火墙**：Windows 防火墙可能拦截 WSL 入站连接，可通过 `.wslconfig` 或 Windows 防火墙规则放行

### 2. 内存与磁盘占用

WSL2 默认最多占用宿主机约 50% 内存，且虚拟磁盘（`ext4.vhdx`）只增不减。可在用户目录下创建 `.wslconfig` 文件进行限制：

```ini
[wsl2]
memory=4GB        # 限制内存上限
processors=4      # 限制 CPU 核数
swap=2GB          # 交换分区大小
```

> [!TIP]
> 提示：配置完执行 `wsl --shutdown` 重启 WSL 生效。`vhdx` 瘦身可在 `wsl --shutdown` 后使用 `diskpart` 或 `Optimize-VHD` 压缩，详见 [官方 WSL 配置文档](https://learn.microsoft.com/zh-cn/windows/wsl/wsl-config)。

### 3. 迁移到其他盘

WSL 默认安装在 C 盘，占用较大时可整体迁移：

```powershell
# 1. 导出当前发行版到指定路径
wsl --export Ubuntu D:\wsl\ubuntu.tar

# 2. 注销原发行版（注意先备份数据）
wsl --unregister Ubuntu

# 3. 导入到新位置
wsl --import Ubuntu D:\wsl\Ubuntu D:\wsl\ubuntu.tar
```

> [!WARNING]
> `wsl --unregister` 会删除该发行版的**所有数据**，务必先导出备份。导入后默认以 root 登录，可用 `ubuntu config --default-user 用户名` 恢复默认用户。

## 总结

WSL 把"装 Linux 虚拟机"变成了"在 Windows 里跑 Linux"，一条命令即可完成安装。建议新用户直接使用 WSL2 + Ubuntu，项目文件放 Linux 侧、用 VS Code 远程开发，遇到内存或磁盘问题再通过 `.wslconfig` 和迁移操作解决。更多进阶玩法可参考[微软官方 WSL 文档](https://learn.microsoft.com/zh-cn/windows/wsl/)。
