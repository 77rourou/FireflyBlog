---
title: "Java 与 APK 反编译入门：CFR / JD-GUI / jadx"
published: 2026-07-15
tags: ["反编译","Java","APK","jadx","教程"]
category: "开发"
description: "从 Java class 到 Android APK：掌握 CFR、JD-GUI、jadx、apktool 四大反编译工具的安装与使用，并了解合规边界。"
---

反编译（Decompile）是把编译后的字节码（`.class`、`.dex`）还原成可读 Java / Kotlin 源码或资源的过程。它常用于学习开源实现、维护无源码的老项目、安全审计等场景。本篇整理 Java 与 APK 反编译的主流工具与实操步骤。

## 一、Java class 反编译：CFR（命令行）

CFR 是当前维护最活跃的 Java 反编译器之一，支持较新版本的 Java 语法特性，无需安装，直接以 jar 运行。

1. 下载：[CFR 官网](http://benf.org/other/cfr/index.html) 或 [Maven 仓库](https://mvnrepository.com/artifact/org.benf/cfr) 获取 `cfr-<版本>.jar`
2. 本机需已安装 JDK（用 `java -version` 验证）

```bash
# 反编译单个 class 文件，结果输出到终端
java -jar cfr.jar Hello.class

# 反编译整个 jar 并导出到目录
java -jar cfr.jar app.jar --outputdir ./decompiled

# 附加依赖 jar，避免反编译出的源码不完整
java -jar cfr.jar App.class --extraclasspath libs/*
```

> [!WARNING]
> 提示：CFR 对匿名类、lambda、switch 表达式等现代语法还原度较高；反编译失败时可加 `--silent false` 查看详细日志。

## 二、JD-GUI：图形化反编译

JD-GUI 是老牌图形化反编译工具，虽然更新频率低（最新稳定版 1.6.6），但开箱即用，适合快速浏览源码。

- 下载：[JD-GUI GitHub Releases](https://github.com/java-decompiler/jd-gui/releases)（Windows 选 `.zip`，macOS 选 `.dmg`）
- 官网：[java-decompiler.github.io](https://java-decompiler.github.io/)

使用步骤：启动 JD-GUI → 将 `.class` 或 `.jar` 文件拖入窗口 → 左侧树状结构浏览类 → 右侧查看源码；「File → Save All Sources」可导出整个项目。

> [!TIP]
> 提示：JD-GUI 对 Java 9+ 模块化 jar 兼容一般，复杂项目建议改用 CFR 或 jadx。

## 三、APK 反编译：jadx

jadx 能把 APK 内的 DEX 字节码直接还原为 Java 源码（并映射资源引用），是当前 Android 反编译的首选工具。

### 1. 安装

```bash
# Windows（winget / scoop）
winget install Skylot.jadx

# macOS（Homebrew）
brew install jadx
```

也可以从 [jadx GitHub Releases](https://github.com/skylot/jadx/releases) 下载对应平台压缩包，解压即用（需要 JDK 11+，最新版本见 [Releases 页面](https://github.com/skylot/jadx/releases)）。

### 2. 基本使用

```bash
# 反编译整个 APK 到指定目录
jadx -d ./output app.apk

# 跳过资源反编译，只保留源码，速度更快
jadx -d ./output --no-res app.apk

# 图形界面
jadx-gui app.apk
```

输出目录中 `sources/` 是还原出的 Java 源码，`resources/` 是资源文件。

## 四、apktool：资源反编译与回编译

jadx 侧重看代码，apktool 则专注资源（布局、图片、AndroidManifest.xml、smali 代码），且支持修改后重新打包（回编译），是改包与汉化的常用工具。

1. 下载：[apktool 官网](https://apktool.org/) 或 [GitHub Releases](https://github.com/iBotPeaches/Apktool/releases)。注意 2.x 与 3.x 是不同代际：2.12.1 仍是成熟稳定线，3.0 于 2026 年初发布，迁移前先看官方 [3.0 发布说明](https://apktool.org/blog/apktool-3.0.0/)

```bash
# d = decode，反编译资源与 smali
apktool d app.apk -o ./app-src

# b = build，回编译打包
apktool b ./app-src -o app-rebuilt.apk
```

| 工具 | 定位 | 主要输出 |
| --- | --- | --- |
| CFR | Java class / jar 反编译（命令行） | Java 源码 |
| JD-GUI | Java 反编译（图形化） | Java 源码 |
| jadx | APK → Java 源码 | 源码 + 资源 |
| apktool | APK 资源 / smali 反编译与回编译 | 资源、smali、可重新打包的 APK |

## 五、常见场景与法律提醒

**常见场景：**
- 学习他人开源 App 的实现思路
- 为没有源码的老项目做维护与兼容性修复
- 安全研究：分析恶意样本、定位漏洞

> [!WARNING]
> 法律提醒：反编译可能违反软件许可协议（EULA）与著作权法。请仅对你有权分析的代码（自有代码、开源项目、获得授权的安全研究样本）进行反编译；不要用于破解付费应用、去除广告、抄袭或二次分发。中国大陆《计算机软件保护条例》同样保护软件著作权，逆向应以学习研究为目的并遵守相关法律法规。

**参考链接：** [CFR 官网](http://benf.org/other/cfr/index.html) · [CFR GitHub](https://github.com/leibnitz27/cfr) · [JD-GUI 官网](https://java-decompiler.github.io/) · [JD-GUI Releases](https://github.com/java-decompiler/jd-gui/releases) · [jadx GitHub](https://github.com/skylot/jadx) · [apktool 官网](https://apktool.org/) · [Apktool Releases](https://github.com/iBotPeaches/Apktool/releases)
