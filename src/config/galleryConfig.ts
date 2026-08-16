import type { GalleryConfig } from "@/types/galleryConfig";

// 相册配置
export const galleryConfig: GalleryConfig = {
	// 相册列表
	albums: [
		// 记得在 public/gallery/ 目录下创建对应的子目录并放入图片
		{
			id: "blog",
			name: "我的博客",
			description: "博客搭建记录，从零开始搭起来的 Firefly 主题小站。",
			location: "线上",
			date: "2026-07-22",
			tags: ["博客", "搭建"],
		},
		{
			id: "blocktavern",
			name: "方块酒馆",
			description: "BlockTavern 方块酒馆服务器与客户端截图。",
			location: "方块酒馆",
			date: "2026-07-30",
			tags: ["Minecraft", "方块酒馆"],
		},
		{
			id: "study-notes",
			name: "学习笔记",
			description: "学习过程中整理的笔记与答案截图存档。",
			location: "学习",
			date: "2026-08-08",
			tags: ["学习", "笔记"],
		},
	],

	// 瀑布流最小列宽(px)，浏览器根据容器宽度自动计算列数，默认 240
	// 值越小列数越多，值越大列数越少
	columnWidth: 240,
};
