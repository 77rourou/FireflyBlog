---
title: "Windows 实用技巧合集：策略组、修改用户名、新机断网、暂停更新"
published: 2026-07-02
tags: ["Windows", "技巧", "系统", "教程"]
category: "系统"
description: "Windows 家庭版开启策略组、修改系统用户名、新机安装跳过联网、延长系统更新暂停天数，四个实用系统技巧一次讲清楚。"
---

本篇整理了四个 Windows 实用技巧：家庭版开启策略组、修改系统用户名、新机安装跳过联网、延长系统更新暂停天数。全部亲测可用，适用于 Windows 10 / 11。

## 一、Windows 家庭版打开策略组（gpedit.msc）

Windows 家庭版输入命令 `gpedit.msc` 会提示没有策略组，可以按照以下步骤打开：

1. 桌面新建 txt 文本文件（或直接下载现成的批处理文件），文本内容如下：

```bat
@echo off
pushd "%~dp0"
dir /b C:\Windows\servicing\Packages\Microsoft-Windows-GroupPolicy-ClientExtensions-Package~3*.mum >List.txt
dir /b C:\Windows\servicing\Packages\Microsoft-Windows-GroupPolicy-ClientTools-Package~3*.mum >>List.txt
for /f %%i in ('findstr /i . List.txt 2^>nul') do dism /online /norestart /add-package:"C:\Windows\servicing\Packages\%%i"
pause
```

2. 保存文本，右键文本文件，**更改后缀为 `.bat`**
3. 右键选择 **「以管理员身份运行」**，运行完成后关闭窗口
4. 重新打开 `gpedit.msc`，即可看到策略组

## 二、修改系统用户名（解决中文用户名兼容问题）

> [!WARNING]
> 该操作是修改 Windows 注册表中的用户配置文件路径，将其从当前的用户名更改为英文名称。这种操作可以解决某些软件或系统功能对非英文用户名支持不佳的问题。这是一个**高级操作**，涉及系统注册表的修改，需要谨慎进行。

1. 按 `Win + R` 打开运行窗口，输入 `regedit` 并回车，打开注册表编辑器
2. 在注册表编辑器中，找到以下路径：

```
HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows NT\CurrentVersion\ProfileList
```

3. 在 `ProfileList` 下，找到与当前用户账户对应的键值（带 `S-1-5-21-...` 前缀的项，可通过右侧 `ProfileImagePath` 确认哪个是当前用户），将其中的用户名修改为英文名称
4. 保存退出，重启电脑生效

## 三、Windows 新机断网教程（跳过联网激活）

在某些情况下，你可能需要在 Windows 新机设置过程中禁用网络连接，以避免强制联网。以下方法适用于 Windows 10 和 Windows 11。

1. **进入命令提示符**：在 Windows 安装过程中，按下 **`Shift + F10`** 组合键，调出命令提示符（cmd）
2. **打开任务管理器**：在命令提示符中输入以下命令并回车：

```bash
taskmgr
```

3. **关闭网络连接进程**：在任务管理器中，切换到「进程」选项卡，找到 **`OOBENetworkConnectionFlow.exe`** 进程，右键点击选择「结束任务」，以禁用网络连接
4. **使用命令跳过网络设置**：如果需要进一步确保网络设置被跳过，可以在命令提示符中运行：

```bash
oobe\bypassnro
```

或者运行：

```bash
oobe\bypassnro.cmd
```

运行后电脑会重启，重新进入 Windows 安装过程，此时网络连接将被禁用，可以顺利跳过联网步骤。

> [!WARNING]
> 注意事项：
> [!WARNING]
> - 谨慎操作：在系统安装过程中修改进程或运行命令可能会对系统设置产生影响，请确保了解每一步操作的目的
> - 适用范围：Windows 10 和 Windows 11
> - 恢复网络：完成设置后，重启计算机即可恢复正常网络连接

## 四、Windows 更新暂停天数修改（注册表）

通过修改注册表，可以控制 Windows 更新的暂停天数（**延长禁用天数，大概可禁用 20 年**）。

1. **打开注册表编辑器**：按 `Win + R`，输入 `regedit` 回车
2. **导航到目标路径**：

```
HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\WindowsUpdate\UX\Settings
```

3. **新建 DWORD(32位) 值**：在 `Settings` 项下，右键点击空白处 → 新建 → `DWORD (32位) 值`，命名为 **`FlightSettingsMaxPauseDays`**
4. **修改数值**：打开该值属性对话框，在「数值数据」中输入你希望的暂停天数（十进制格式），点击确定保存
5. **生效**：设置 → Windows 更新里即可选择更长的暂停天数

> [!TIP]
>  也有现成的注册表文件（.reg）可以直接导入运行：
> [!TIP]
> - 禁用系统更新（延长禁用天数）：延长禁用天数，大概可禁用 20 年
> [!TIP]
> - 禁用系统更新延长 99999 天：天数过大，Win11 部分电脑在筛选禁用周数时可能会卡顿

> [!WARNING]
> 注意事项：
> [!TIP]
> - 谨慎操作：修改注册表可能会对系统稳定性产生影响，操作前建议先备份注册表（文件 → 导出）
> - 适用范围：Windows 10 和 Windows 11
> - 恢复默认设置：将 `FlightSettingsMaxPauseDays` 的值设置为 `0` 或删除该键值即可
