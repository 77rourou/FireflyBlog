---
title: "Linux 服务器入门：SSH 连接与安全加固"
published: 2026-07-24
tags: ["服务器", "Linux", "SSH", "教程"]
category: "开发"
description: "面向新手的 Linux 服务器上手指南：SSH 远程连接、常用文件/权限/进程/日志命令、apt/yum/dnf 包管理器速查，以及禁用密码登录、修改端口、fail2ban、ufw 防火墙等安全加固实战。"
---

买了一台云服务器，装好 Ubuntu 或 CentOS，然后呢？本文整理从零连接 Linux 服务器到完成基础安全加固的完整流程，覆盖 SSH 连接、常用命令、包管理器三大件，以及一套开箱即用的加固清单。

## 一、SSH 远程连接

SSH 是连接 Linux 服务器的标准方式。云厂商通常会提供一个初始密码或密钥，本地终端执行：

```bash
# 基本连接
ssh root@你的服务器IP

# 指定端口连接
ssh -p 2222 user@服务器IP

# 指定私钥连接
ssh -i ~/.ssh/my_key user@服务器IP
```

首次连接会提示确认主机指纹，输入 `yes` 即可。Windows 用户可直接用系统自带终端（PowerShell）或 Windows Terminal，无需额外安装客户端。

## 二、常用命令速查

| 分类 | 命令 | 说明 |
| --- | --- | --- |
| 文件 | `ls -lah` / `cd` / `pwd` | 列目录 / 切换目录 / 当前路径 |
| 文件 | `cp -r` / `mv` / `rm -rf` | 复制 / 移动 / 删除（`-rf` 慎用） |
| 权限 | `chmod 755 file` / `chown user:group file` | 改权限 / 改属主 |
| 进程 | `ps aux` / `top` / `htop` | 查看进程 / 实时监控 |
| 进程 | `kill -9 PID` / `systemctl start|stop|status xxx` | 杀进程 / 管理系统服务 |
| 日志 | `tail -f /var/log/syslog` | 实时跟踪日志（`-f` 表示跟随） |
| 日志 | `journalctl -u nginx -f` | 查看 systemd 服务日志 |

> [!TIP]
> 提示：磁盘满了先看 `df -h`，进程找不到先 `ps aux | grep 关键词`，日志报错先 `tail -n 100`，这三大排查习惯能解决 80% 的新手问题。

### 权限数字速记

`chmod` 的权限数字由 `读(4) + 写(2) + 执行(1)` 相加得出，三个数字分别对应**属主 / 属组 / 其他人**：

| 数字 | 权限 | 常见组合 |
| --- | --- | --- |
| `7 = 4+2+1` | 读+写+执行 | 程序文件 `755`（目录） |
| `6 = 4+2` | 读+写 | 配置文件 `644` |
| `5 = 4+1` | 读+执行 | 脚本 `755` |
| `0` | 无权限 | 敏感文件 `600` |

例如 `chmod 600 ~/.ssh/id_ed25519` 可确保私钥只归自己读写——私钥权限过宽会导致 SSH 直接拒绝使用该密钥。

## 三、包管理器：apt / yum / dnf

| 发行版 | 包管理器 | 更新索引 | 安装 | 卸载 |
| --- | --- | --- | --- | --- |
| Debian / Ubuntu | `apt` | `apt update` | `apt install 包名` | `apt remove 包名` |
| CentOS 7 / RHEL 7 | `yum` | `yum makecache` | `yum install 包名` | `yum remove 包名` |
| CentOS 8+ / Fedora / RHEL 8+ | `dnf` | `dnf makecache` | `dnf install 包名` | `dnf remove 包名` |

```bash
# 以 Ubuntu 为例：装软件前先更新索引，再升级
sudo apt update && sudo apt upgrade -y
sudo apt install nginx git curl -y
```

> [!TIP]
> 提示：CentOS 8 之后 `yum` 已被 `dnf` 取代（yum 是 dnf 的别名）；新装系统建议先 `apt upgrade`（或 `dnf upgrade`）把内核和软件包更新到最新再继续。

## 四、SSH 密钥登录配置

密码登录易被暴力破解，换成密钥登录是加固的第一步：

```bash
# 1. 本地生成密钥对（ed25519 比 rsa 更安全更快）
ssh-keygen -t ed25519 -C "你的备注"

# 2. 把公钥一键拷到服务器（会自动追加到 ~/.ssh/authorized_keys）
ssh-copy-id -i ~/.ssh/id_ed25519.pub user@服务器IP
```

## 五、安全加固清单

### 1. 修改 SSH 端口并禁用密码登录

编辑 `/etc/ssh/sshd_config`（Debian 系新版本建议在 `/etc/ssh/sshd_config.d/` 下新建 `99-hardening.conf`）：

```ini
Port 2222                    # 换掉默认 22 端口
PermitRootLogin no           # 禁止 root 直接登录
PasswordAuthentication no    # 禁用密码登录（密钥登录不受影响）
PubkeyAuthentication yes
```

生效并验证：

```bash
sudo systemctl restart sshd
#  先开一个新终端确认密钥能登录，再关掉旧连接，避免把自己锁在外面！
```

### 2. fail2ban 防暴力破解

fail2ban 会监控登录日志，多次失败即封禁来源 IP：

```bash
sudo apt install fail2ban -y
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo systemctl enable --now fail2ban
# 查看封禁状态
sudo fail2ban-client status sshd
```

### 3. ufw 防火墙

```bash
sudo ufw default deny incoming
sudo ufw allow 2222/tcp        # 放行修改后的 SSH 端口（务必先放行再开防火墙）
sudo ufw allow 80,443/tcp      # Web 端口
sudo ufw enable
sudo ufw status verbose
```

> [!WARNING]
> 顺序很重要：**先放行 SSH 端口，再启用 ufw**，否则启用瞬间自己就被断了。云厂商安全组里的规则和服务器内部防火墙是两层，都要配置。

### 4. 其他建议

- 定期 `apt update && apt upgrade -y` 打安全补丁
- 用 `sudo adduser 新用户` + `usermod -aG sudo 新用户` 创建普通管理员账号，日常不用 root
- 关键服务（如数据库）不要监听 `0.0.0.0`，只绑定内网或本机地址
- 用 `last` 查看登录历史、`who` 查看当前在线用户，定期检查有没有异常登录记录

## 参考链接

- [OpenSSH 官方文档](https://www.openssh.com/manual.html)
- [fail2ban 官方文档](https://fail2ban.readthedocs.io/)
- [Ubuntu Server 文档（安全部分）](https://ubuntu.com/server/docs/security)
