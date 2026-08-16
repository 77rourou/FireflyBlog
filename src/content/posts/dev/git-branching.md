---
title: "Git 分支策略与团队协作"
published: 2026-07-30
tags: ["Git", "分支", "协作", "教程"]
category: "开发"
description: "系统梳理 Git 分支基础、Git Flow / GitHub Flow / Trunk-Based 三大工作流对比、Pull Request 协作流程、冲突解决与 Conventional Commits 提交规范，以及保护分支配置。"
---

分支是 Git 团队协作的核心机制：每个人在独立分支上开发，互不干扰，再通过合并汇聚成果。本篇从分支基础讲起，对比主流工作流，并覆盖 PR 协作、冲突解决、提交规范与保护分支。

## 一、分支基础

```sh
# 查看分支
git branch

# 创建并切换分支（推荐新写法）
git switch -c feature/login

# 传统写法
git checkout -b feature/login

# 合并分支
git switch main && git merge feature/login

# 删除已合并分支
git branch -d feature/login
```

> 分支的实质只是一个指向提交的指针，创建与切换成本极低，所以「开新分支」是常态而不是负担。

## 二、三大工作流对比

| 维度 | Git Flow | GitHub Flow | Trunk-Based |
| --- | --- | --- | --- |
| 常驻分支 | `main` + `develop` | 仅 `main` | 仅 `main`（主干） |
| 临时分支 | feature / release / hotfix | feature + PR | 极短命的分支 |
| 适合场景 | 版本化发布（如 SDK、传统软件） | 持续部署的 Web 项目 | 大规模 / 微服务团队 |
| 发布方式 | release 分支打标签 | 合并即部署 | 小步提交 + 特性开关 |
| 优点 | 发布节奏清晰、可并行维护多版本 | 简单、上手快 | 冲突最少、集成最快 |
| 缺点 | 分支多、流程重 | 发布与主干耦合 | 对 CI 与纪律要求高 |

- **Git Flow**：由 Vincent Driessen 提出（[原文](https://nvie.com/posts/a-successful-git-branching-model/)），`develop` 集成开发，`feature` 并入 `develop`，`release` 准备发布，`hotfix` 紧急修线，适合有明确版本号的场景
- **GitHub Flow**：官方推荐流程（见 [GitHub 文档](https://docs.github.com/zh/get-started/using-github/github-flow)），所有改动走分支 + PR，合并到 `main` 即部署
- **Trunk-Based Development**：见 [trunkbaseddevelopment.com](https://trunkbaseddevelopment.com/)，所有人频繁提交主干，用特性开关隐藏未完成功能，追求最小集成摩擦

## 三、Pull Request 协作流程

PR 是「分支 + 代码评审 + CI 检查」的组合，标准流程：

```sh
# 1. 同步最新主干
git switch main && git pull

# 2. 开功能分支
git switch -c fix/typo-in-readme

# 3. 提交（规范见第五节）
git commit -m "fix: 修正 README 拼写错误"

# 4. 推送并在平台创建 PR
git push -u origin fix/typo-in-readme
```

随后在 GitHub / GitLab 上：填写 PR 描述（改动内容、测试方式、关联 Issue）→ 邀请评审 → 通过 CI 检查 → 合并。评审意见通过评论与「建议修改」提出，作者跟进后再推送新提交即可。

>  小 PR 好评审：一次 PR 聚焦一个改动，尽量控制在可快速 review 的规模；合并前确认目标分支已同步最新代码。

## 四、冲突解决

当两个分支修改了同一文件的同一区域，合并时会产生冲突。冲突标记长这样：

```text
<<<<<<< HEAD
这是主干上的版本
=======
这是分支上的版本
>>>>>>> feature/login
```

处理步骤：手动编辑保留正确内容（删除 `<<<<<<<`、`=======`、`>>>>>>>` 标记）→ 保存 → `git add` → 继续合并：

```sh
git merge --continue   # 或者 git commit
```

如果合并过程失控，可随时回退：

```sh
git merge --abort      # 放弃本次合并，回到合并前状态
git rebase --abort     # 放弃本次变基
```

> [!WARNING]
>  冲突并不可怕，可怕的是「用 `git push --force` 覆盖别人提交」。需要强制推送时优先用 `--force-with-lease`，它能校验远程是否被他人更新过，避免误伤协作者。

## 五、提交信息规范（Conventional Commits）

统一提交信息让历史可读、可自动生成 changelog，规范见 [conventionalcommits.org](https://www.conventionalcommits.org/zh-hans/)：

```text
<type>(<scope>): <subject>

feat: 新增文章搜索功能
fix(login): 修复 Token 过期后跳转异常
docs: 更新部署文档
refactor!: 重构 API 返回结构（破坏性变更）
```

常用类型：`feat`（新功能）、`fix`（修复）、`docs`（文档）、`style`（格式）、`refactor`（重构）、`test`（测试）、`chore`（杂务）；`!` 或 `BREAKING CHANGE:` 标记破坏性变更。scope 是可选的影响范围，如 `fix(login)`。

## 六、保护分支

保护分支防止主干被直接破坏，GitHub 的配置项（[官方文档](https://docs.github.com/zh/repositories/configuring-branches-and-merges/managing-protected-branches/about-protected-branches)）常见组合：

- **要求 PR 评审**：至少 1 人批准才能合并
- **要求状态检查通过**：CI（构建、测试、Lint）必须绿
- **禁止直接推送**：`main` 只能通过 PR 合并
- **要求分支最新**：合并前必须同步主干，避免「过期分支合并」

## 小结

工作流没有银弹：版本化产品用 Git Flow，持续部署团队用 GitHub Flow 或 Trunk-Based。比选型更重要的是把 PR 评审、提交规范与保护分支这些「软约束」落实成团队习惯，协作效率自然就上来了。
