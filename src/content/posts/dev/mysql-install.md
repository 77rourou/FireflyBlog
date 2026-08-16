---
title: "MySQL 安装与环境配置（MSI / 压缩包两种方式完整教程）"
published: 2026-07-09
tags: ["MySQL", "数据库", "环境配置", "教程"]
category: "开发"
description: "MySQL 下载、安装、环境变量配置、my.ini 配置、初始化、服务安装与启动、登录改密、忘记密码重置，压缩包版与 MSI 版全覆盖。"
---

本篇整理了 MySQL 的完整安装与环境配置流程，覆盖 **MSI 程序版** 和 **ZIP 压缩包版** 两种方式，从下载、环境变量、配置文件、初始化到密码管理一应俱全。

## 一、下载

- 程序版本（MSI Installer）：[点击下载](https://dev.mysql.com/downloads/mysql/) 选择 Windows (x86, 64-bit), MSI Installer
- 压缩包版（ZIP Archive）：[点击下载](https://dev.mysql.com/downloads/mysql/) 选择 Windows (x86, 64-bit), ZIP Archive

> [!TIP]
> 当新版本有问题时，可以尝试降低版本使用（如 8.0.28 等稳定版本）。

## 二、安装

- **程序版本**：直接安装，有可视化界面提示，跟着提示操作即可，默认会将环境添加到 PATH
- **压缩包版**：自行解压到指定目录，如 `D:\MySQL\mysql-8.0.28-winx64`

## 三、环境变量配置（压缩包版）

### 第一种：直接添加 bin 目录

1. 搜索 **`编辑系统环境变量`**，打开 **`环境变量`** → **`系统变量`** → 选中 `Path` → **`编辑`** → **`新建`**
2. 将 `D:\MySQL\mysql-8.0.28-winx64\bin` 添加到 Path 中

### 第二种：通过 MYSQL_HOME 变量

1. 打开 **`环境变量`** → **`系统变量`** → **`新建`**
2. 新建环境变量：变量名 `MYSQL_HOME`，变量值 `D:\MySQL\mysql-8.0.28-winx64`
3. **`系统变量`** → **`Path`** → **`新建`**，添加：

```
%MYSQL_HOME%\bin
```

## 四、添加配置文件 my.ini

1. 在 MySQL 根目录（如 `mysql-8.0.28-winx64`）下新建配置文件 `my.ini`
2. 将如下内容复制到配置文件中，**路径需修改为你的实际路径**

**配置一（基础版）**：

```ini
[mysqld]
# 设置MYSQL的安装目录
basedir=D:\MySQL\mysql-8.0.28-winx64
# 设置MYSQL的数据目录
datadir=D:\MySQL\mysql-8.0.28-winx64\data
# 设置端口
port=3306
#设置SQL模式
sql_mode=NO_ENGINE_SUBSTITUTION,STRICT_TRANS_TABLES
```

**配置二（推荐完整版）**：

```ini
[mysqld]
# 自定义设置3306端口，建议采用默认；如果已存在可以设置其它端口号
port=3306
# 设置mysql的安装目录
# 切记此处一定要用双斜杠\\，单斜杠可能这里会出错(根据情况而定)
basedir=C:\\Software\\MySQL8.0\\mysql-8.4.0-winx64
# 设置mysql数据库的数据的存放目录
datadir=C:\\Software\\MySQL8.0\\mysql-8.4.0-winx64\\data
# 允许最大连接数
max_connections=200
# 允许连接失败的次数。这是为了防止有人从该主机试图攻击数据库系统
max_connect_errors=10
# 服务端使用的字符集默认为UTF8
character-set-server=utf8mb4
# 创建新表时将使用的默认存储引擎
default-storage-engine=INNODB

[mysql]
# 设置mysql客户端默认字符集
default-character-set=utf8mb4

[client]
# 设置mysql客户端连接服务端时默认使用的端口，要与第三行的port保持一致
port=3306
default-character-set=utf8mb4
```

**配置三（旧版本 5.x 示例）**：

```ini
[mysql]
# 设置mysql客户端默认字符集
default-character-set=utf8

[mysqld]
#设置3306端口
port = 3306
# 设置mysql的安装目录
basedir=D:\mysql\mysql-5.6.33-winx64
# 设置mysql数据库的数据的存放目录
datadir=D:\mysql\mysql-5.6.33-winx64\data
# 允许最大连接数
max_connections=200
# 服务端使用的字符集默认为8比特编码的latin1字符集
character-set-server=utf8
# 创建新表时将使用的默认存储引擎
default-storage-engine=INNODB
```

## 五、安装步骤（管理员 CMD）

进入安装的磁盘，例如 D 盘，**管理员身份**打开 cmd（英文输入法输入）：

```bash
# 进入D盘
D:
```

```bash
# 进入 bin 目录（路径按你的实际安装位置修改）
cd D:\SQL\mysql-8.0.28-winx64\bin
```

### 1. 初始化

```bash
mysqld --initialize-insecure --user=mysql
```

> [!WARNING]
> 使用 `--initialize-insecure` 初始化后默认 root 无密码；若使用 `mysqld --initialize --console` 则会生成初始密码（注意保存）。

### 2. 安装 MySQL 服务

```bash
mysqld --install MySQL --defaults-file="D:\SQL\mysql-8.0.28-winx64\my.ini"
```

> `--defaults-file=` 后面填 my.ini 的实际路径。

### 3. 启动 MySQL 服务

```bash
net start mysql
```

> [!TIP]
> 也可以直接搜索「服务」打开 MySQL 服务。

### 4. 登录 MySQL

```bash
mysql -h localhost -u root -p
```

> 按上面的步骤，默认无需密码，直接回车即可；除非你使用了 `mysqld --initialize --console` 生成了初始密码。
> [!TIP]
> 参数说明：`-h` 后面是主机地址，`-u` 后面是用户名，`-p` 后面是用户登录密码。

### 5. 设置密码

```bash
SET PASSWORD FOR root@localhost = '123456';
```

### 6. 退出 mysql

三种方式任选：

```bash
\q
```

```bash
quit
```

```bash
exit
```

### 7. 卸载 MySQL 服务

```bash
mysqld remove MySQL
```

## 六、重置密码（忘记密码怎么办？）

1. 关闭 MySQL 服务：

```bash
net stop mysql
```

2. 跳过密码输入授权，免密启动（另开一个管理员 CMD 运行）：

```bash
mysqld --console --skip-grant-tables --shared-memory
```

3. 再打开一个管理员 CMD 窗口，依次执行命令（会直接进入，不用输入密码）：

```bash
mysql
```

```bash
use mysql
```

4. 修改更新 root 用户的密码：

```bash
UPDATE user SET authentication_string = PASSWORD('123456') WHERE User = 'root';
```

> [!WARNING]
> 注意：在 **MySQL 8.0 及之后的版本中 `PASSWORD()` 函数已被移除**，应使用 `ALTER USER` 语句重置密码：

```bash
ALTER USER 'root'@'localhost' IDENTIFIED BY '123456';
```

5. 刷新权限使更改生效：

```bash
FLUSH PRIVILEGES;
```

6. 完成：关闭窗口，重新启动 MySQL 服务，用修改的密码登录即可。
