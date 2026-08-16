---
title: "本地知识库 RAG 搭建入门"
published: 2026-08-07
tags: ["AI", "RAG", "知识库", "向量数据库", "教程"]
category: "AI"
description: "从零搭建本地知识库：理解 RAG 检索+生成原理、Embedding 向量化、向量数据库选型、文档切分策略，以及完整的构建流程与落地建议。"
---

大模型虽然知识广博，却不了解你的私有文档，还容易一本正经地"编造"（幻觉）。RAG（Retrieval-Augmented Generation，检索增强生成）通过在生成前先检索相关资料，把答案"钉"在证据上，是目前落地知识库问答最主流的方案。本文记录从原理到搭建的完整路径。

## 一、RAG 是什么：检索 + 生成

RAG 的思想最早由 Meta 等机构在 2020 年的论文 [Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks](https://arxiv.org/abs/2005.11401) 中提出，核心只有两步：

1. **检索（Retrieval）**：根据用户问题，从知识库中找出最相关的若干文档片段
2. **生成（Generation）**：把问题与检索到的片段一起交给大模型，让它基于材料回答

```text
用户提问
   │
   ▼
向量检索 ──► 召回 Top-K 相关片段
   │
   ▼
组装 Prompt（问题 + 片段）
   │
   ▼
大模型生成答案（并附引用）
```

相比直接微调模型，RAG 的优势是：知识更新只需改文档、不用重训模型；回答可溯源、能大幅降低幻觉；文档量从几十篇到上百万篇都能应对。

## 二、Embedding 向量化

机器无法直接比较"两段文字像不像"，所以需要先把文本变成**向量**（一串浮点数），语义相近的文本向量距离也近。这个转换模型就叫 **Embedding 模型**。

- 商业 API：[OpenAI Embeddings](https://platform.openai.com/docs/guides/embeddings)（如 `text-embedding-3-small`）、通义、文心等
- 开源本地：[BGE 系列](https://huggingface.co/BAAI/bge-m3)（智源 BAAI 出品，中文效果好）、`text2vec`、`m3e` 等

> [!TIP]
> 提示：中文场景优先选对中文优化过的模型（如 BGE-M3，支持中英等多语言），效果可参考 HuggingFace 的 [MTEB 榜单](https://huggingface.co/spaces/mteb/leaderboard)。

## 三、向量数据库选型

向量数据库负责存储向量并做相似度检索（如余弦相似度）。2026 年主流选择：

| 方案 | 特点 | 适用场景 |
| --- | --- | --- |
| [pgvector](https://github.com/pgvector/pgvector) | PostgreSQL 扩展，与业务数据同库 | 已有 PG 的项目，简单省事 |
| [Chroma](https://www.trychroma.com/) | 轻量、Python 友好、可嵌入式 | 学习、原型、小规模 |
| [Milvus](https://milvus.io/) | 分布式、高性能、生态完善 | 百万级以上、生产环境 |
| [Qdrant](https://qdrant.tech/) | Rust 实现，速度快、易容器化 | 中等规模、生产部署 |
| [FAISS](https://github.com/facebookresearch/faiss) | Meta 的检索库，非数据库 | 科研、离线批量检索 |

选型原则：**先小后大**。个人知识库（几千篇文档以内）用 pgvector 或 Chroma 完全够用，不必一上来就上分布式集群。

## 四、文档切分策略

向量检索的单位是"文档块"（chunk），切分质量直接决定检索效果。常用策略：

- **固定长度切分**：按字符数切块，留 10%~20% 重叠，简单但可能切断语义
- **递归切分**：按段落、句子逐级切分，保段落结构（LangChain 的 `RecursiveCharacterTextSplitter`）
- **语义切分**：用 Embedding 判断断点，质量高、速度慢
- **结构化保留**：Markdown / 表格类文档按标题、代码块边界切分

```python
from langchain_text_splitters import RecursiveCharacterTextSplitter

splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=50,
    separators=["\n\n", "\n", "。", " ", ""],
)
chunks = splitter.split_text(markdown_text)
```

> [!WARNING]
> 警告：不要盲目追求"块越大越好"。块太大，检索命中后塞进 Prompt 的内容过多，既费 token 又稀释重点；通常 300~800 字一块、带少量重叠是比较稳妥的起点。

## 五、构建流程

一条完整的 RAG 链路分**离线入库**与**在线问答**两个阶段：

```text
离线：文档 → 清洗 → 切分 → Embedding → 写入向量库
在线：问题 → Embedding → 向量检索 → 组装 Prompt → LLM 生成
```

入库脚本示意（Chroma + OpenAI Embedding）：

```python
from langchain_community.document_loaders import DirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_chroma import Chroma

docs = DirectoryLoader("./docs", glob="**/*.md").load()
chunks = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50).split_documents(docs)

db = Chroma.from_documents(
    chunks,
    embedding=OpenAIEmbeddings(model="text-embedding-3-small"),
    persist_directory="./chroma_db",
)
```

问答时先 `db.similarity_search(question, k=5)` 取回 Top-5 片段，拼进 Prompt 让模型"只依据材料回答，并标注来源"即可。

## 六、常用工具与框架

| 工具 | 定位 | 官网 |
| --- | --- | --- |
| [LangChain](https://python.langchain.com/) | 通用编排框架，组件最全 | langchain.com |
| [LlamaIndex](https://www.llamaindex.ai/) | 专注 RAG / 数据连接 | llamaindex.ai |
| [Dify](https://dify.ai/) | 低代码平台，可视化搭建 | dify.ai |
| [RAGFlow](https://ragflow.io/) | 深度文档解析 + RAG，中文友好 | ragflow.io |
| [Ollama](https://ollama.com/) | 本地跑模型（Embedding 与 LLM） | ollama.com |

> [!TIP]
> 提示：想快速验证效果，用 Dify 或 RAGFlow 拖拽搭建最快；想深度定制，用 LangChain / LlamaIndex 写代码；在意隐私的话，本地模型 + 本地向量库（如 Ollama + pgvector）可以完全离线。

## 七、落地建议

1. **先评估检索质量**：上线前抽 30~50 个真实问题，人工看召回结果是否命中关键段落
2. **"索引即产品"**：文档质量决定 RAG 上限——先清洗格式、去重、补全元数据
3. **混合检索更稳**：向量检索 + 关键词检索（BM25）融合，专有名词、编号类问题命中率更高
4. **保留引用溯源**：回答附上原文片段，既增加可信度，也方便人工复核
5. **持续迭代**：把答错的案例收集起来，针对性调整切分参数、Embedding 与 Prompt

RAG 的工程链条很长，但每一步都有成熟工具。从"几十篇 Markdown + Chroma + 一个 API"的最小闭环起步，你就能拥有一个属于自己的、可溯源的知识库问答系统。
