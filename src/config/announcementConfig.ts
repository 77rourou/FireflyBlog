import type { AnnouncementConfig } from "../types/announcementConfig";

export const announcementConfig: AnnouncementConfig = {
	// 公告标题
	title: "欢迎来到阿猫嚯嚯的笔记本",

	// 公告内容
	content:
		"这里记录我的学习笔记、技术折腾与生活点滴。方块酒馆服务器因供应商调整暂停运营，恢复后会在动态第一时间公告；入服教程已置顶，欢迎收藏～",

	// 是否允许用户关闭公告
	closable: true,

	link: {
		// 启用链接
		enable: true,
		// 链接文本
		text: "查看方块酒馆教程",
		// 链接 URL
		url: "/posts/game/minecraft-install/",
		// 内部链接
		external: false,
	},
};
