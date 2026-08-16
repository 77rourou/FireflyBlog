---
title: "Python 自动化脚本实战：批量处理文件与定时任务"
published: 2026-07-07
tags: ["脚本","Python","自动化","教程"]
category: "开发"
description: "用 Python 完成批量重命名、批量图片压缩与定时任务，附 os / shutil / pathlib / requests 常用库速查与路径、编码注意事项。"
---

Python 是写自动化脚本最顺手的语言之一：语法简单、标准库强大、第三方生态丰富。本篇用三个实战例子覆盖「文件批量处理 + 定时执行」，并给出常用库速查与避坑指南。

## 一、环境准备

1. 从 [Python 官网](https://www.python.org/downloads/) 下载安装（Windows 安装时务必勾选 **Add Python to PATH**）
2. 建议为每个项目创建虚拟环境，避免依赖冲突

```bash
# 创建并激活虚拟环境（Windows）
python -m venv .venv
.venv\Scripts\activate

# 安装依赖
pip install pillow requests
```

> [!TIP]
> 提示：`python --version` 可验证安装；2026 年建议使用 Python 3.12 及以上版本。

## 二、实战 1：批量重命名文件

把目录下所有 `IMG_*.jpg` 按序号重命名，用标准库 `pathlib` 即可完成：

```python
from pathlib import Path

folder = Path(r"D:\photos")  # 原始字符串避免转义问题
for i, file in enumerate(folder.glob("IMG_*.jpg"), start=1):
    new_name = folder / f"photo_{i:03d}{file.suffix}"
    file.rename(new_name)
    print(f"{file.name} -> {new_name.name}")
```

## 三、实战 2：批量压缩图片

借助 Pillow 把目录下所有图片限制在指定尺寸内，显著减小体积：

```python
from pathlib import Path
from PIL import Image

src = Path(r"D:\photos")
out = src / "compressed"
out.mkdir(exist_ok=True)

for img_path in src.glob("*.jpg"):
    img = Image.open(img_path).convert("RGB")
    img.thumbnail((1600, 1600))  # 最长边限制 1600px，保持宽高比
    img.save(out / img_path.name, quality=80, optimize=True)
    print("done:", img_path.name)
```

> [!TIP]
> 提示：`Image.thumbnail` 会自动保持宽高比；`quality=80` 是体积与画质的常用平衡点，可按需调整。

## 四、实战 3：定时运行脚本

### Windows：任务计划程序

```bash
# schtasks 创建每天 02:00 运行的任务
schtasks /Create /TN "PhotoCompress" /TR "python D:\scripts\compress.py" /SC DAILY /ST 02:00
```

也可以打开「任务计划程序」图形界面：创建基本任务 → 触发器选「每天」→ 操作选「启动程序」→ 程序填 `python`，参数填脚本的绝对路径。

### Linux / macOS：cron

```bash
# crontab -e 编辑，每天 02:00 执行，并把输出写入日志
0 2 * * * /usr/bin/python3 /home/user/scripts/compress.py >> /tmp/compress.log 2>&1
```

> [!TIP]
> 提示：Windows 任务计划中 `python` 若不在 PATH，应填解释器的完整路径（如 `C:\Users\me\AppData\Local\Programs\Python\Python312\python.exe`）。

## 五、常用库速查表

| 库 | 用途 | 常用函数 / 方法 |
| --- | --- | --- |
| `os` | 系统与路径操作 | `os.listdir`、`os.rename`、`os.makedirs` |
| `shutil` | 文件复制 / 移动 / 删除 | `shutil.copy2`、`shutil.move`、`shutil.rmtree` |
| `pathlib` | 面向对象路径（推荐） | `Path.glob`、`Path.rename`、`Path.mkdir` |
| `requests` | HTTP 请求 | `requests.get`、`requests.post`、`resp.json()` |
| `Pillow` | 图片处理 | `Image.open`、`img.thumbnail`、`img.save` |

下载文件示例：

```python
import requests

resp = requests.get("https://example.com/file.zip", timeout=30)
with open("file.zip", "wb") as f:
    f.write(resp.content)
```

## 六、注意事项：路径与编码

1. **路径**：Windows 路径含反斜杠，建议用原始字符串 `r"C:\dir"` 或直接使用 `Path` 对象；避免把绝对路径硬编码进脚本，可用 `Path(__file__).parent` 定位脚本所在目录
2. **编码**：读写文本文件务必显式指定编码，否则在 Windows 上会按 GBK 处理导致报错或乱码

```python
# 以 UTF-8 读取文本
with open("data.txt", "r", encoding="utf-8") as f:
    lines = f.readlines()
```

3. **安全与日志**：涉及删除、覆盖的脚本建议先加 `--dry-run` 参数演练一遍；定时任务把输出重定向到日志文件，便于排查失败原因。

> [!TIP]
> 提示：官方文档 [pathlib](https://docs.python.org/zh-cn/3/library/pathlib.html)、[os](https://docs.python.org/zh-cn/3/library/os.html)、[shutil](https://docs.python.org/zh-cn/3/library/shutil.html)、[requests](https://requests.readthedocs.io/zh-cn/latest/) 都提供中文版本，遇到细节直接查阅。
