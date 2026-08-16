---
title: "Bash 脚本入门：Linux 自动化基础"
published: 2026-07-06
tags: ["脚本","Bash","Shell","Linux","教程"]
category: "开发"
description: "从 Shell 基础语法、变量参数、条件循环与函数出发，掌握 set -x 调试、cron 定时任务，并用日志清理、批量操作两个实战示例上手 Linux 自动化。"
---

Bash（Bourne Again Shell）是 Linux 上最常用的 Shell 与脚本语言，把重复的命令操作写成脚本，配合 cron 定时执行，就能实现真正的自动化。本篇按「基础语法 → 流程控制 → 调试 → 定时任务 → 实战」的顺序整理。

## 一、脚本基础：shebang 与执行

脚本第一行用 shebang 指定解释器，并给文件加上执行权限：

```bash
#!/bin/bash
echo "Hello, Firefly!"
```

```bash
chmod +x hello.sh
./hello.sh        # 相对路径执行
bash hello.sh     # 或直接用 bash 解释执行
```

> [!WARNING]
> 提示：脚本里尽量使用 `#!/bin/bash` 而非 `#!/bin/sh`，避免在不同发行版上遇到 POSIX 兼容差异。

## 二、变量与参数

```bash
name="Firefly"                 # 定义变量（= 两侧不能有空格）
echo "Hi, $name"               # 引用变量
readonly ver="1.0"             # 只读变量

# 位置参数：$1 第一个参数，$@ 所有参数，$# 参数个数
echo "脚本名: $0, 参数个数: $#"
for arg in "$@"; do echo "$arg"; done

# 特殊变量
echo "上一条命令退出码: $?"    # 0 表示成功
```

| 变量 | 含义 |
| --- | --- |
| `$0` | 脚本名 |
| `$1`–`$9` | 第 1–9 个位置参数 |
| `$@` / `$*` | 所有参数 |
| `$#` | 参数个数 |
| `$?` | 上一条命令的退出码 |
| `$$` | 当前脚本的 PID |

## 三、条件与循环

```bash
# if / elif / else
score=85
if [ "$score" -ge 90 ]; then
    echo "优秀"
elif [ "$score" -ge 60 ]; then
    echo "及格"
else
    echo "不及格"
fi

# for 循环
for i in {1..5}; do
    echo "第 $i 次"
done

# while 循环
n=0
while [ $n -lt 3 ]; do
    echo "n=$n"
    ((n++))
done
```

> [!WARNING]
> 提示：`[` 是 `test` 命令的别名，条件两侧必须有空格；`[[ ]]` 是 Bash 扩展语法，支持 `&&`、`||` 和正则 `=~`，功能更强，优先使用。

## 四、函数

```bash
greet() {
    echo "Hello, $1!"
    return 0        # 返回退出码
}
greet "World"
```

函数必须先定义后调用；函数内 `return` 返回退出码，如需返回值可用 `echo` 捕获：`result=$(greet "Tom")`。

## 五、常用命令组合

Bash 的强大在于把单条命令用管道、重定向组合起来，实现"一行脚本"：

```bash
# 管道：把前一个命令的输出作为后一个命令的输入
ps aux | grep nginx | grep -v grep

# 重定向：> 覆盖写入，>> 追加，2>&1 合并错误输出
ls > files.txt 2>&1

# 命令替换：把命令输出存入变量
today=$(date +%F)
echo "今天是 $today"

# 条件执行：&& 成功才继续，|| 失败才执行
mkdir -p backup && cp -r data backup/ || echo "备份失败"
```

> [!TIP]
> 提示：配合 `grep`、`awk`、`sed` 文本三剑客，几乎任何日志分析、文本批处理都能在命令行完成，这也是「一行脚本」文化的来源。

## 六、脚本调试

| 方法 | 作用 |
| --- | --- |
| `bash -n script.sh` | 仅做语法检查，不执行 |
| `bash -x script.sh` | 逐条打印执行的命令（追踪执行） |
| `set -x` / `set +x` | 脚本内开启/关闭追踪 |
| `set -e` | 任一条命令失败立即退出 |
| `set -u` | 使用未定义变量时报错 |

```bash
#!/bin/bash
set -eux
```

> [!WARNING]
> 提示：`-u` 能提前暴露拼写错误的变量名，是很多 CI 脚本的标配；但注意 `set -e` 在管道、条件判断等场景有例外行为，必要时配合 `set -o pipefail` 使用。

## 七、定时任务：cron

`crontab -e` 编辑当前用户的定时任务，每行格式为「分 时 日 月 周 命令」：

```cron
# 每天凌晨 3 点清理日志
0 3 * * * /home/user/scripts/clean-logs.sh
# 每 5 分钟执行一次
*/5 * * * * /home/user/scripts/check.sh >> /tmp/check.log 2>&1
```

常用命令：`crontab -l` 查看、`crontab -r` 删除、`systemctl status cron` 检查服务状态。脚本输出默认不会显示，务必重定向到日志文件便于排查。

## 八、实战示例

### 1. 日志清理

```bash
#!/bin/bash
# 删除 7 天前的 .log 文件
LOG_DIR="/var/log/myapp"
find "$LOG_DIR" -name "*.log" -mtime +7 -exec rm -f {} \;
echo "$(date '+%F %T') 清理完成" >> /tmp/clean.log
```

### 2. 批量操作（重命名）

```bash
#!/bin/bash
# 把当前目录所有 .txt 改名为 .md
for f in *.txt; do
    mv "$f" "${f%.txt}.md"
done
```

> [!WARNING]
> 注意：`mv`、`rm` 等操作不可逆，批量脚本上线前先在测试目录演练，或加 `echo` 预览将要执行的命令。

**参考链接：** [GNU Bash 参考手册](https://www.gnu.org/software/bash/manual/bash.html) · [Bash 条件表达式文档](https://www.gnu.org/software/bash/manual/bash.html#Bash-Conditional-Expressions) · [crontab(5) 手册](https://man7.org/linux/man-pages/man5/crontab.5.html) · [GNU Coreutils](https://www.gnu.org/software/coreutils/manual/coreutils.html) · [Advanced Bash-Scripting Guide](https://tldp.org/LDP/abs/html/)
