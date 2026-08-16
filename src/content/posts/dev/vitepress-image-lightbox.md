---
title: "VitePress 图片缩放预览（点击放大灯箱）配置教程"
published: 2026-07-12
tags: ["Vitepress", "markdown-it", "fancybox", "教程"]
category: "开发"
description: "使用 markdown-it-custom-attrs 插件为 VitePress 文档站添加图片点击放大预览（Fancybox 灯箱）效果的完整配置步骤。"
---

VitePress 默认的图片点击后没有放大预览效果，查看大图很不方便。本文记录通过 `markdown-it-custom-attrs` + Fancybox 为 VitePress 添加**图片点击缩放预览**（灯箱）的完整配置。

## Step. 1：安装依赖

```bash
npm i markdown-it-custom-attrs
```

## Step. 2：引入插件

在 `docs/.vitepress/config.js`（或 `config.ts`）中引入：

```js
import mdItCustomAttrs from 'markdown-it-custom-attrs'
```

## Step. 3：配置 markdown

在 VitePress 配置文件的 `markdown.config` 中注册插件，为所有图片加上 `data-fancybox` 属性：

```js
export default {
  markdown: {
    config: (md) => {
      // use more markdown-it plugins!
      md.use(mdItCustomAttrs, 'image', {
        'data-fancybox': "gallery"
      })
    }
  }
}
```

这样渲染出的图片标签会自动带上 `data-fancybox="gallery"` 属性：

```html
<img src="图片地址" data-fancybox="gallery"/>
```

## Step. 4：引入图片灯箱 js 和 css 文件

在 VitePress 配置文件的 `head` 配置中加入 Fancybox 的样式和脚本（使用 jsDelivr CDN）：

```js
export default {
  head: [
    [
      "link",
      { rel: "stylesheet", href: "https://cdn.jsdelivr.net/npm/@fancyapps/ui/dist/fancybox.css" },
    ],
    ["script", { src: "https://cdn.jsdelivr.net/npm/@fancyapps/ui@4.0/dist/fancybox.umd.js" }],
  ]
}
```

## Step. 5：渲染效果

配置完成后，文档中的普通图片：

```markdown
![](图片地址)
```

会渲染为：

```html
<img src="图片地址" data-fancybox="gallery"/>
```

点击图片即可弹出灯箱预览，支持缩放、切换上一张/下一张，同一篇文章中的所有图片会自动归入同一个 `gallery` 分组，方便连续浏览。
