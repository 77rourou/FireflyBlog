---
title: "Python 反编译与 pyc 逆向入门"
published: 2026-07-16
tags: ["反编译","Python","pyc","逆向","教程"]
category: "开发"
description: "从 Python 字节码与 .pyc 文件原理出发，掌握 dis/marshal 查看字节码、uncompyle6/decompyle3/pycdc/pycdas 等反编译工具的使用与常见失败原因。"
---

Python 与 Java 不同，源码通常以 `.py` 明文发布，但出于性能、保护或发布便利，也常以编译后的 `.pyc`（字节码文件）形式分发。本篇讲解 Python 字节码与 `.pyc` 文件的原理，以及如何用工具把它还原回可读的 Python 源码。

## 一、原理：从源码到 .pyc

Python 是解释型语言，但解释器并非逐行翻译源码，而是先编译成**字节码**（bytecode），再交给虚拟机（CPython 的 ceval 循环）执行。`py_compile`、`compileall` 或导入模块时都会生成缓存文件，Python 3.2+ 统一存放在 `__pycache__` 目录下：

```bash
# 单文件编译
python -m py_compile app.py

# 递归编译整个目录
python -m compileall src/
```

生成的 `__pycache__/app.cpython-312.pyc` 结构大致如下：

| 部分 | 内容 |
| --- | --- |
| 文件头 | 4 字节 magic number（标识解释器版本）+ flags + 哈希/时间戳 |
| Code Object | 经 `marshal` 序列化的代码对象（含常量、变量名、字节码指令序列等） |

> [!WARNING]
> 提示：magic number 与 Python 版本严格对应，用 3.11 解释器无法加载 3.12 编译的 `.pyc`，这也是反编译失败最常见的原因之一。

## 二、用 dis / marshal 查看字节码

反编译之前，先学会"看"字节码。标准库 `dis` 可以把代码对象反汇编为可读的指令序列：

```python
import dis

def add(a, b):
    return a + b

dis.dis(add)
```

输出中每一行是一个指令（如 `LOAD_FAST`、`BINARY_OP`、`RETURN_VALUE`），配合操作数即可大致还原逻辑。`marshal` 则用于解析 `.pyc` 中的 code object：

```python
import marshal, struct, types

with open("app.cpython-312.pyc", "rb") as f:
    f.read(16)                      # 跳过文件头
    code = marshal.load(f)          # 读取 code object
print(code.co_consts, code.co_names)
```

> [!TIP]
> 提示：手工解析比较繁琐，直接使用 `python -m dis app.py` 可以快速查看整个模块的字节码。官方文档见 [dis 模块](https://docs.python.org/3/library/dis.html) 与 [marshal 模块](https://docs.python.org/3/library/marshal.html)。

拿到未知来源的 `.pyc` 时，第一步是确定它的 Python 版本，可以通过文件头 magic number 反查：

```python
import struct

with open("app.pyc", "rb") as f:
    magic = struct.unpack("<H", f.read(2))[0]
print(hex(magic))
```

将 magic 值与 CPython 源码中 [importlib/_bootstrap_external.py](https://github.com/python/cpython/blob/main/Lib/importlib/_bootstrap_external.py) 的版本表对照即可确认解释器版本。另外注意 Python 3.7+ 默认还带有 hash-based pyc（文件头 flags 位不同），这类文件校验的是内容哈希而非时间戳，不影响反编译，但了解其存在有助于排查加载异常。

## 三、主流反编译工具

| 工具 | 语言 | 支持版本 | 维护状态 | 特点 |
| --- | --- | --- | --- | --- |
| [uncompyle6](https://github.com/rocky/python-uncompyle6) | Python | 2.7–3.8 | 基本停更 | 老牌工具，2.x 兼容好 |
| [decompyle3](https://github.com/rocky/python-decompile3) | Python | 3.7–3.8 | 停更 | uncompyle6 的后继实验版 |
| [pycdc](https://github.com/zrax/pycdc) | C++ | 覆盖较新版本 | 活跃 | 反编译（Decompyle++） |
| [pycdas](https://github.com/zrax/pycdc) | C++ | 同上 | 活跃 | 字节码反汇编（Disassembler++） |

**Python 侧工具**（需与目标 `.pyc` 的 Python 版本匹配的 Python 环境）：

```bash
pip install uncompyle6
uncompyle6 app.cpython-38.pyc > app_restored.py
```

**C++ 侧工具**（从源码编译，无需安装对应版本 Python，适合较新字节码）：

```bash
git clone https://github.com/zrax/pycdc.git
cd pycdc && cmake . && make

# 反编译为 Python 源码
./pycdc app.cpython-312.pyc
# 反汇编为字节码指令
./pycdas app.cpython-312.pyc
```

## 四、常见失败原因

1. **版本不匹配**：magic number 不一致是最常见错误。确认目标 `.pyc` 的 Python 大版本与小版本，尽量用同版本工具或同版本解释器。
2. **字节码过新**：Python 3.11 起引入 [PEP 659 自适应特化解释器](https://peps.python.org/pep-0659/)，字节码指令大幅调整，uncompyle6 等旧工具无能为力，只能靠 pycdc/pycdas 或人工阅读字节码。
3. **混淆/加密**：部分程序会 `marshal.dumps` 后加密存储、自定义 import hook 动态解密，拿到手的是密文而非标准 `.pyc`，需先还原出标准字节码。
4. **编译期信息丢失**：变量名、注释、格式在编译时被丢弃，反编译结果与原始源码必然存在差异，只能作为阅读参考。

> [!WARNING]
> 合规提醒：反编译他人代码可能违反软件许可协议（EULA）与著作权法。请仅对你有权分析的代码（自有代码、开源项目、获得授权的安全研究样本，如 CTF 题目）进行反编译；不要用于破解商业软件、剥离授权或二次分发。

**参考链接：** [Python dis 文档](https://docs.python.org/3/library/dis.html) · [Python marshal 文档](https://docs.python.org/3/library/marshal.html) · [py_compile 文档](https://docs.python.org/3/library/py_compile.html) · [uncompyle6 GitHub](https://github.com/rocky/python-uncompyle6) · [decompyle3 GitHub](https://github.com/rocky/python-decompile3) · [pycdc GitHub](https://github.com/zrax/pycdc) · [PEP 659](https://peps.python.org/pep-0659/) · [Python 3.11 新特性](https://docs.python.org/3/whatsnew/3.11.html)
