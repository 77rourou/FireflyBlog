---
title: "Minecraft 服务器搭建入门：从开服到联机"
published: 2026-08-01
tags: ["Minecraft", "我的世界", "服务器", "开服", "教程"]
category: "游戏"
description: "从零搭建 Minecraft Java 版服务器：Java 与版本选择、Vanilla/Paper/Fabric/Forge 服务端对比、下载启动、server.properties 基础配置、端口映射与内网穿透，以及内存不足、连接超时等常见问题排查。"
---

想和朋友一起玩自己的 Minecraft 世界，开一个专属服务器是最自由的方式。本教程以 Java 版（JAVA Edition）为例，带你从零搭建一个可联机的服务器：前置准备、服务端选择、下载启动、基础配置到公网联机，全程适合新手。

## 一、开服前置：Java 与版本

Minecraft 服务端由 Java 编写，必须先安装 Java 运行时。**新版 MC（1.20.5+）要求 Java 21**，旧版本通常需要 Java 17，建议直接安装 Java 21：

```bash
# Windows 可使用 winget 一键安装
winget install EclipseAdoptium.Temurin.21.JDK

# 验证安装
java -version
```

> [!TIP]
> 版本选择建议：开服前先和朋友们确认**统一游戏版本**（如 1.21.x），客户端与服务端版本必须一致才能进入。各版本 Java 要求详见 [Minecraft Wiki](https://minecraft.wiki/w/Tutorials/Setting_up_a_server)。

## 二、服务端类型对比

服务端核心决定你能否装 Mod、性能上限如何，常见四类：

| 类型 | 特点 | 适合场景 |
| --- | --- | --- |
| Vanilla（原版） | 官方服务端，最稳定、无额外功能 | 纯原版体验 |
| Paper | 性能优化强、插件生态大（Spigot 系） | 插件服、多人生存、小游戏 |
| Fabric | 轻量、Mod 兼容性好、启动快 | 装 Mod 的生存/技术服 |
| Forge | Mod 生态最庞大、老牌 | 大型整合包、经典 Mod |

> [!WARNING]
>  核心选择与 **Mod/插件** 直接相关：装 Mod 用 Fabric/Forge，装插件用 Paper；Mod 与插件**不通用**，混用会崩溃。详细对比可参考 [Paper 官方文档](https://docs.papermc.io/paper/getting-started) 与 [Fabric 官网](https://fabricmc.net/)。

## 三、下载与启动

以 Paper 为例（其他核心大同小异）：

1. 前往 [PaperMC 官网](https://papermc.io/) 下载对应游戏版本的核心 Jar
2. 新建文件夹 `mc-server`，把 Jar 放入并重命名为 `server.jar`
3. 编写启动脚本：

```bat
@echo off
java -Xmx4G -Xms4G -jar server.jar nogui
pause
```

> [!TIP]
> 内存建议：4G 左右可流畅支撑 5～10 人；`-Xmx` 上限不要超过物理内存的 70%，否则会被系统杀进程。

4. 双击启动，首次运行会生成 `eula.txt`，把 `eula=false` 改为 `eula=true` 同意协议，再次启动即可

```text
# eula.txt 中修改为
eula=true
```

## 四、基础配置

### 1. server.properties

服务端核心配置都在 `server.properties`，修改后需重启生效：

```properties
server-port=25565            # 服务端口，默认 25565
motd=Welcome to my server!   # 服务器列表显示的文字
max-players=10               # 最大在线人数
white-list=true              # 是否开启白名单
online-mode=true             # 正版验证（开服联机建议保持 true）
view-distance=10             # 视距，影响内存与性能
```

### 2. 白名单与管理员

```bash
# 在服务器控制台执行
whitelist add 玩家名     # 添加白名单
op 玩家名                # 设为管理员
```

> [!WARNING]
> 若朋友无法进服，先确认：游戏版本一致 → 白名单已添加 → 服务器已开启白名单。

### 3. 局域网联机（最快方式）

如果只是同一 WiFi 下联机，无需公网配置：进游戏 → 对局域网开放 → 朋友在多人游戏中直接搜索即可加入。

## 五、端口映射与内网穿透

好友不在同一网络时，需要让服务器能被公网访问：

- **有公网 IP（家庭宽带或云服务器）**：在路由器管理页找到"端口映射/虚拟服务器"，把 TCP `25565` 端口转发到开服电脑的内网 IP

```text
外部端口: 25565  →  内部 IP: 192.168.x.x  →  内部端口: 25565
```

- **无公网 IP（大多数家庭网络）**：使用内网穿透工具，如 [Tailscale](https://tailscale.com/)（免费组网）、[frp](https://github.com/fatedier/frp)、花生壳（[贝锐教程](https://service.oray.com/question/1694.html)），将 25565 端口映射到公网

>  正版服务器（`online-mode=true`）联机最简单：对方只需加入你的公网地址（域名或 `IP:端口`）即可，无需任何额外操作。

## 六、Mod 与插件安装

- **Paper 插件**：把 `.jar` 插件放入 `plugins` 文件夹，重启服务器即自动加载
- **Fabric/Forge Mod**：服务端先安装对应加载器，再把 Mod 放入 `mods` 文件夹；**客户端必须装相同的 Mod**（Fabric 官方安装教程见 [Fabric 文档](https://docs.fabricmc.net/)）
- 常用管理工具：[EssentialsX](https://essentialsx.net/)（基础指令）、[LuckPerms](https://luckperms.net/)（权限管理）

## 七、常见问题排查

| 现象 | 可能原因 | 解决办法 |
| --- | --- | --- |
| 内存不足（OutOfMemory） | `-Xmx` 设置过小 | 调大内存上限，关闭不需要的插件 |
| 连接超时 | 端口未放行 / 未开穿透 | 检查防火墙、路由器端口映射、穿透配置 |
| 版本不符 | 客户端与服务端版本不一致 | 统一双方游戏版本 |
| 启动闪退 | Java 版本不对 / eula 未同意 | 确认 Java 21，检查 `eula.txt` |
| 卡顿掉线 | 视距过高、内存不足 | 降低 `view-distance`，优化启动参数 |

> [!TIP]
> 开服排错黄金法则：**先看控制台日志**，报错信息会直接指出问题所在；官方 Wiki 的 [服务器搭建教程](https://minecraft.wiki/w/Tutorials/Setting_up_a_server) 也是很好的参考。

## 总结

开服的完整链路可以浓缩为：**装 Java → 选服务端 → 下载启动 → 改配置 → 联机（局域网或穿透）**。先用局域网和好友跑通流程，再考虑公网与 Mod，遇到问题优先查日志。祝你和朋友们玩得开心！
