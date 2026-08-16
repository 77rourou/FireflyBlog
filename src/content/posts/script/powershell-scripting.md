---
title: "PowerShell 脚本入门：从命令到自动化"
published: 2026-07-03
tags: ["脚本","PowerShell","自动化","教程"]
category: "开发"
description: "从执行策略到变量、管道与函数，用 PowerShell 把重复操作写成脚本，附常用 cmdlet 速查表与常见报错排障。"
---

PowerShell 是 Windows 内置的脚本与自动化框架，基于 .NET，既能当命令行使用，也能编写复杂脚本。本篇按「配置环境 → 语法基础 → 实战示例 → 速查表 → 排障」的顺序整理。

## 一、执行策略：先解决「不让跑脚本」的问题

Windows 默认禁止运行脚本，第一次使用前先查看并调整执行策略：

```powershell
# 查看当前策略
Get-ExecutionPolicy

# 设为 RemoteSigned：本地脚本可运行，网络下载的脚本需签名
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

| 策略 | 含义 |
| --- | --- |
| `Restricted` | 默认值，禁止运行任何脚本 |
| `RemoteSigned` | 本地脚本可运行，远程脚本需签名（推荐） |
| `AllSigned` | 所有脚本都需签名 |
| `Bypass` | 完全放行，不推荐 |

> [!TIP]
> 提示：`-Scope CurrentUser` 无需管理员权限；以管理员身份运行 PowerShell 才能修改 Machine 级策略。

## 二、变量、数组与哈希表

```powershell
# 变量（以 $ 开头，不区分大小写）
$name = "Firefly"

# 数组
$files = @("a.txt", "b.txt", "c.txt")

# 哈希表（键值对）
$config = @{ Name = "blog"; Port = 4321 }
$config.Port        # 4321
$config["Name"]     # blog
```

## 三、条件与循环

```powershell
# if / elseif / else
if ($size -gt 1MB) { "大文件" } elseif ($size -gt 1KB) { "中等" } else { "小文件" }

# switch
switch ($env:OS) { "Windows_NT" { "Windows" } default { "其他" } }

# for / foreach
for ($i = 1; $i -le 5; $i++) { $i }

foreach ($f in $files) { $f }

# while
$n = 0
while ($n -lt 3) { $n++ }
```

> [!TIP]
> 提示：PowerShell 的比较运算符是 `-eq`、`-ne`、`-gt`、`-lt`，不是 `==`、`>` 等 C 系写法。

## 四、函数

```powershell
function Rename-WithDate {
    param(
        [string]$Path,
        [switch]$Quiet
    )
    $stamp = Get-Date -Format "yyyyMMdd"
    Get-ChildItem $Path -File | ForEach-Object {
        Rename-Item $_.FullName -NewName "$stamp-$($_.Name)"
    }
}
```

## 五、管道

管道把前一个命令的输出传给下一个命令处理，是 PowerShell 的灵魂：

```powershell
# 找出大于 10MB 的文件，按大小降序展示名称与大小
Get-ChildItem C:\logs -Recurse -File |
    Where-Object { $_.Length -gt 10MB } |
    Sort-Object Length -Descending |
    Select-Object Name, Length
```

## 六、实战：批量重命名文件

给当前目录下所有 `.png` 图片加上日期前缀：

```powershell
$stamp = Get-Date -Format "yyyyMMdd"
Get-ChildItem . -Filter *.png | ForEach-Object {
    Rename-Item $_.FullName -NewName "${stamp}_$($_.Name)"
}
```

## 七、常用 cmdlet 速查表

| 类别 | 常用命令 |
| --- | --- |
| 文件操作 | `Get-ChildItem`、`Copy-Item`、`Move-Item`、`Remove-Item`、`Rename-Item` |
| 内容读写 | `Get-Content`、`Set-Content`、`Out-File` |
| 筛选排序 | `Where-Object`、`Select-Object`、`Sort-Object`、`Select-String` |
| 系统信息 | `Get-Process`、`Get-Service`、`Get-Date`、`Get-EventLog` |
| 网络 | `Invoke-WebRequest`、`Test-NetConnection` |
| 遍历 | `ForEach-Object`、`ForEach` 语句 |

## 八、常见报错与解决

**1. 执行策略受限**

```
xxx.ps1 cannot be loaded because running scripts is disabled on this system.
```

解决：执行 `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser`；只想对单条命令放行可加参数：

```powershell
powershell -ExecutionPolicy Bypass -File script.ps1
```

**2. 中文乱码 / 编码问题**

脚本文件编码不对时，中文会输出乱码。排查顺序：

- Windows PowerShell 5.1 对无 BOM 的 UTF-8 文件会按 ANSI 读取导致乱码，用 VS Code 保存脚本时选择 **UTF-8 with BOM**
- 读写文件时显式指定编码：`Get-Content -Encoding UTF8`、`Set-Content -Encoding UTF8`
- 控制台乱码可先执行 `chcp 65001`

> [!TIP]
> 提示：Windows PowerShell 5.1 是系统自带版本，默认编码处理较老；建议安装跨平台、默认 UTF-8 的 [PowerShell 7](https://github.com/PowerShell/PowerShell/releases)，命令行输入 `pwsh` 即可进入。
