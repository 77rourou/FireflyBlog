---
title: "Windows 批处理 bat 实战"
published: 2026-07-04
tags: ["脚本","bat","Windows","自动化","教程"]
category: "开发"
description: "从 bat 基础语法、变量与参数、if/for 循环到任务计划程序，掌握批量重命名、一键部署等实战写法，并解决 GBK/UTF-8 编码乱码问题。"
---

批处理（.bat）是 Windows 上最轻量的自动化方式，无需安装任何环境即可双击运行。虽然语法古老，但配合任务计划程序，足以完成批量重命名、一键部署、定时备份等日常任务。本篇按「语法基础 → 流程控制 → 任务计划 → 实战 → 编码」的顺序整理。

## 一、bat 基础语法

```bat
@echo off
rem 这是注释（rem 或 ::）
echo Hello, Firefly!
pause
```

- `@echo off`：关闭命令回显，让脚本只显示输出；`@` 表示本行自身也不回显
- `echo`：输出文本，`echo.` 输出空行
- `pause`：暂停等待按键，防止窗口闪退

## 二、变量与参数

```bat
@echo off
set name=Firefly
echo 站点名称：%name%

rem 使用 set /p 交互输入
set /p input=请输入内容：
echo 你输入了：%input%

rem 位置参数：%1、%2 ...，%0 是脚本自身路径
echo 第一个参数：%1
echo 所有参数：%*
echo 脚本所在目录：%~dp0
```

| 写法 | 含义 |
| --- | --- |
| `%name%` | 引用变量 |
| `%1`–`%9` | 位置参数 |
| `%*` | 全部参数 |
| `%~dp0` | 脚本所在目录（含结尾反斜杠），常用于定位同目录文件 |
| `%~nx1` | 第一个参数的纯文件名（去路径） |

## 三、if 与 for 循环

```bat
@echo off
set /p score=输入分数：
if %score% GEQ 60 (
    echo 及格
) else (
    echo 不及格
)

rem 检测文件是否存在
if exist "C:\temp\a.txt" echo 文件存在
```

for 是 bat 中最强大的命令，标准格式为 `for %%变量 in (集合) do 命令`（脚本内必须写双百分号）：

```bat
@echo off
rem 遍历当前目录所有 .txt 文件
for %%f in (*.txt) do echo 找到：%%f

rem 1 到 5 计数循环
for /l %%i in (1,1,5) do echo 第 %%i 次

rem 逐行读取文件
for /f "delims=" %%l in (list.txt) do echo %%l
```

> [!WARNING]
> 提示：命令提示符里手动输入 for 时用单百分号 `%i`，写进 .bat 文件必须用 `%%i`，这是新手最常见的报错点。

## 四、常用命令速查

| 命令 | 用途 |
| --- | --- |
| `copy` / `xcopy` / `robocopy` | 复制（robocopy 功能最强，支持增量、多线程） |
| `del` / `rd` | 删除文件 / 目录 |
| `ren` | 重命名 |
| `mkdir` / `cd /d` | 创建目录 / 切换盘符目录 |
| `tasklist` / `taskkill` | 查看进程 / 结束进程 |
| `start` | 启动程序或打开文件 |

## 五、配合任务计划程序定时执行

图形界面：Win + R 输入 `taskschd.msc` 打开「任务计划程序」，创建任务 → 触发器设置时间 → 操作选择要执行的 .bat 文件。命令行可用 `schtasks`：

```bat
schtasks /create /tn "LogClean" /tr "C:\scripts\clean.bat" /sc daily /st 03:00
schtasks /query /tn "LogClean"     rem 查询
schtasks /delete /tn "LogClean" /f rem 删除
```

> [!TIP]
> 提示：任务计划默认以当前用户运行，若脚本需要管理员权限，勾选「使用最高权限运行」；路径含空格时用引号包裹。

## 六、实战示例

### 1. 批量重命名（加日期前缀）

```bat
@echo off
for %%f in (*.jpg) do (
    ren "%%f" "2026-%%f"
)
echo 重命名完成
pause
```

### 2. 一键部署（复制 + 启动）

```bat
@echo off
set DEPLOY_DIR=C:\apps\blog
if not exist "%DEPLOY_DIR%" mkdir "%DEPLOY_DIR%"
xcopy /e /i /y dist "%DEPLOY_DIR%\dist"
start "" "%DEPLOY_DIR%\start.bat"
echo 部署完成
pause
```

## 七、编码注意：GBK / UTF-8

批处理的编码问题是中文乱码的主要来源：**cmd 默认代码页 936（GBK）**，而现代编辑器默认保存为 UTF-8，两者不一致就会显示乱码。

| 情况 | 处理 |
| --- | --- |
| 脚本含中文、保存为 GBK | 直接运行，一般正常 |
| 脚本含中文、保存为 UTF-8 | 文件开头加 `chcp 65001 >nul` 切换到 UTF-8 代码页 |
| 中文输出乱码 | 检查文件编码与 `chcp` 代码页是否一致 |
| 推荐做法 | 纯 ASCII 脚本避免中文；需要中文时统一 GBK 保存或统一 UTF-8 + `chcp 65001` |

```bat
@echo off
chcp 65001 >nul
echo 中文测试
pause
```

> [!TIP]
> 注意：`chcp 65001` 需在输出中文之前执行，且部分旧程序（如某些版本的 ping、findstr）对 UTF-8 代码页支持不佳；批量脚本建议优先使用英文提示信息，从根源上避开乱码。

**参考链接：** [Windows 命令概述（Microsoft Learn）](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/windows-commands) · [for 命令文档](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/for) · [schtasks 命令文档](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/schtasks) · [任务计划程序文档](https://learn.microsoft.com/en-us/windows/win32/taskschd/task-scheduler-start-page) · [chcp 命令文档](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/chcp)
