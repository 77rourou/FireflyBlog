---
title: "GitHub520：5 分钟解决 GitHub 访问慢、图片加载不出来的问题"
published: 2026-07-13
tags: ["Github", "GitHub520", "加速", "教程", "hosts"]
category: "开发"
description: "GitHub 访问慢、图片裂开？通过修改 hosts 文件即可加速，无需安装任何程序，5 分钟搞定。附手动、SwitchHosts 自动更新、一键命令等多种方式。"
---

对 GitHub 说"爱"太难了：访问慢、图片加载不出来。**GitHub520** 项目通过修改本地 hosts 文件，解决 GitHub 访问速度慢和项目图片显示不出的问题，**无需安装任何程序，仅需 5 分钟**。

- 项目地址：[https://github.com/521xueweihan/GitHub520](https://github.com/521xueweihan/GitHub520)

> [!TIP]
> 原理：GitHub 在国内的 CDN 节点不稳定，通过将 GitHub 相关域名解析到最快的 IP 并写入 hosts 文件，即可大幅提升访问速度。hosts 内容会定时自动更新，随时获取最新最优 IP。

## 一、获取最新 hosts 内容

下面的地址无需访问 GitHub 即可获取到最新的 hosts 内容：

- 文件：https://raw.hellogithub.com/hosts
- JSON：https://raw.hellogithub.com/hosts.json

内容格式如下（以 2024-11 版本为例，实际请以获取到的最新内容为准）：

```
# GitHub520 Host Start
140.82.112.26                 alive.github.com
140.82.113.5                  api.github.com
185.199.109.153               assets-cdn.github.com
140.82.113.4                  github.com
140.82.113.18                 github.community
185.199.109.154               github.githubassets.com
185.199.109.153               github.io
185.199.111.133               raw.githubusercontent.com
...
# Update time: 2024-11-16T12:06:54+08:00
# Update url: https://raw.hellogithub.com/hosts
# Star me: https://github.com/521xueweihan/GitHub520
# GitHub520 Host End
```

## 二、修改 hosts 文件

hosts 文件在每个系统的位置不一：

| 系统 | hosts 路径 |
| --- | --- |
| Windows | `C:\Windows\System32\drivers\etc\hosts` |
| Linux | `/etc/hosts` |
| Mac（苹果电脑） | `/etc/hosts` |
| Android（安卓） | `/system/etc/hosts`（需要 root） |
| iPhone（iOS） | `/etc/hosts`（需要越狱） |

修改方法：把第一步复制的内容粘贴到 hosts 文件**末尾**。

1. Windows：用记事本打开（需要管理员权限）
2. Linux / Mac：使用 Root 权限 `sudo vi /etc/hosts`
3. iPhone、iPad 须越狱、Android 必须要 root

## 三、激活生效（刷新 DNS）

大部分情况下修改后直接生效；如未生效，可尝试刷新 DNS：

1. Windows：CMD 窗口输入 `ipconfig /flushdns`
2. Linux：`sudo nscd restart`，如报错则先安装：`sudo apt install nscd` 或 `sudo /etc/init.d/nscd restart`
3. Mac：`sudo killall -HUP mDNSResponder`

> [!TIP]
> **Tips：** 上述方法无效可以尝试重启机器。

## 四、自动方式：SwitchHosts（推荐）

推荐使用 [SwitchHosts](https://github.com/oldj/SwitchHosts) 工具管理 hosts，这样每次 hosts 有更新都能及时自动更新，免去手动更新的麻烦。

以 SwitchHosts 为例，配置参考：

- Hosts 类型：`Remote`
- Hosts 标题：随意
- URL：`https://raw.hellogithub.com/hosts`
- 自动刷新：最好选 `1 小时`

![SwitchHosts 配置示例](https://github.com/521xueweihan/GitHub520/raw/main/img/switch-hosts.png)

## 五、一行命令方式

### Windows

需要安装 [Git Bash](https://gitforwindows.org/)。复制以下命令保存到本地，命名为 `fetch_github_hosts`（无扩展名）：

```shell
_hosts=$(mktemp /tmp/hostsXXX)
hosts=/c/Windows/System32/drivers/etc/hosts
remote=https://raw.hellogithub.com/hosts
reg='/# GitHub520 Host Start/,/# Github520 Host End/d'

sed "$reg" $hosts > "$_hosts"
curl "$remote" >> "$_hosts"
cat "$_hosts" > "$hosts"

rm "$_hosts"
```

在 **CMD** 中执行以下命令，执行前需要替换 `git-bash.exe` 和 `fetch_github_hosts` 为你本地的路径（注意前者为 Windows 路径格式，后者为 shell 路径格式）：

```
"C:\Program Files\Git\git-bash.exe" -c "/c/Users/XXX/fetch_github_hosts"
```

可以将上述命令添加到 Windows 的**任务计划程序**中定时执行。

### GNU（Ubuntu/CentOS/Fedora）

```sh
sudo sh -c 'sed -i "/# GitHub520 Host Start/Q" /etc/hosts && curl https://raw.hellogithub.com/hosts >> /etc/hosts'
```

### BSD/macOS

```sh
sudo sed -i "" "/# GitHub520 Host Start/,/# Github520 Host End/d" /etc/hosts && curl https://raw.hellogithub.com/hosts | sudo tee -a /etc/hosts
```

将上面的命令添加到 cron，可定时执行。使用前确保 GitHub520 内容在该文件最后部分。

> [!WARNING]
> 在 Docker 中运行若遇到 `Device or resource busy` 错误，可使用以下命令：
> `cp /etc/hosts ~/hosts.new && sed -i "/# GitHub520 Host Start/Q" ~/hosts.new && curl https://raw.hellogithub.com/hosts >> ~/hosts.new && cp -f ~/hosts.new /etc/hosts`

## 六、AdGuard 用户（自动方式）

在 **过滤器 > DNS 封锁清单 > 添加阻止列表 > 添加一个自定义列表**，配置如下：

- 名称：随意
- URL：`https://raw.hellogithub.com/hosts`

![AdGuard 添加列表](https://github.com/521xueweihan/GitHub520/raw/main/img/AdGuard-rules.png)

更新间隔在 **设置 > 常规设置 > 过滤器更新间隔**（设置一小时一次即可），记得勾选 **使用过滤器和 Hosts 文件以拦截指定域名**。

![AdGuard 更新间隔](https://github.com/521xueweihan/GitHub520/raw/main/img/AdGuard-rules2.png)

> [!TIP]
> **Tip：** 不要添加在 **DNS 允许清单** 内，只能添加在 **DNS 封锁清单** 才管用。AdGuard for Mac / Windows / Android / iOS 等 AdGuard 家族软件添加方法均类似。

## 七、效果对比

| 修改前 | 修改后 |
| --- | --- |
| ![修改前：加载缓慢、图片裂开](https://github.com/521xueweihan/GitHub520/raw/main/img/old.png) | ![修改后：秒开、图片正常](https://github.com/521xueweihan/GitHub520/raw/main/img/new.png) |

## 写在最后

- hosts 内容由项目方定时自动更新，IP 无变动时不会重复更新
- 若修改后仍未生效，可以尝试重启电脑
- 本项目遵循 [署名-非商业性使用-禁止演绎 4.0 国际](https://creativecommons.org/licenses/by-nc-nd/4.0/deed.zh) 许可协议
