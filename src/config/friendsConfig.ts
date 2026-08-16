import type { FriendLink, FriendsPageConfig } from "../types/friendsConfig";

// 可以在src/content/spec/friends.md中编写友链页面下方的自定义内容

// 友链页面配置
export const friendsPageConfig: FriendsPageConfig = {
	// 页面标题，如果留空则使用 i18n 中的翻译
	title: "",

	// 页面描述文本，如果留空则使用 i18n 中的翻译
	description: "",

	// 是否显示底部自定义内容（friends.mdx 中的内容）
	showCustomContent: true,

	// 是否显示评论区，需要先在commentConfig.ts启用评论系统
	showComment: true,

	// 是否开启随机排序配置，如果开启，就会忽略权重，构建时进行一次随机排序
	randomizeSort: false,
};

// 友链配置
export const friendsConfig: FriendLink[] = [
	// 添加你的友链配置示例：
	// {
	// 	title: "友链名称",
	// 	imgurl: "头像URL",
	// 	desc: "描述",
	// 	siteurl: "https://example.com",
	// 	tags: ["Blog"],
	// 	weight: 10,
	// 	enabled: true,
	// },	
	

	{
		title: "Re0XIAOPA DOCS",
		imgurl: "https://www.awafuns.cn/tool.png",
		desc: "每时每刻学习着  -  Learning all the time",
		siteurl: "https://www.awafuns.cn/",
		tags: ["文档"],
		weight: 10,
		enabled: true,
	},
	{
		title: "BlockTavern - 方块酒馆",
		imgurl: "/assets/images/logo-blocktavern.png",
		desc: "认准 BlockTavern 官方网站，获取最新安全版本",
		siteurl: "https://www.blocktavern.cn/",
		tags: ["游戏"],
		weight: 10,
		enabled: true,
	},
	{
		title: "BlockTavern 文档",
		imgurl: "https://docs.blocktavern.cn/assets/images/logo.png",
		desc: "欢迎来到 BlockTavern 官方文档！在这里，每一个方块都有故事，每一个玩家都是传奇。",
		siteurl: "https://docs.blocktavern.cn/",
		tags: ["文档"],
		weight: 10,
		enabled: true,
	},
	

];

// 获取启用的友链并进行排序
export const getEnabledFriends = (): FriendLink[] => {
	const friends = friendsConfig.filter((friend) => friend.enabled);

	if (friendsPageConfig.randomizeSort) {
		return friends.sort(() => Math.random() - 0.5);
	}

	return friends.sort((a, b) => b.weight - a.weight);
};
