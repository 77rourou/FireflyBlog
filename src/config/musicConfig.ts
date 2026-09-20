import type { MusicPlayerConfig } from "../types/musicConfig";

// 音乐播放器配置
export const musicPlayerConfig: MusicPlayerConfig = {
	// 是否在导航栏显示音乐播放器入口
	showInNavbar: true,

	// 是否在侧边栏显示音乐播放器组件
	showInSidebar: true,

	// 使用方式："local" = 混合歌单（本地文件 + 多平台外链）
	// 每条外链可在 playlist 内用 meting 字段自行指定平台，支持
	// netease(网易云) / tencent(QQ音乐) / kugou(酷狗) / xiami(虾米) / baidu(百度)
	mode: "local",

	// 默认音量 (0-1)
	volume: 0.7,

	// 播放模式：'list'=列表循环, 'one'=单曲循环, 'random'=随机播放
	playMode: "list",

	// 是否显启用歌词
	showLyrics: true,

	// Meting API 全局配置（作为外链条目未单独指定 api 时的默认配置）
	meting: {
		api: "https://api.i-meto.com/meting/api?server=:server&type=:type&id=:id&r=:r",
		// 认证 token（可选）
		auth: "",
		// 备用 API 配置（当主 API 失败时使用）
		fallbackApis: [
			"https://api.injahow.cn/meting/?server=:server&type=:type&id=:id",
			"https://api.moeyao.cn/meting/?server=:server&type=:type&id=:id",
		],
	},

	// 混合歌单：本地文件 + 外链混排
	// - 本地文件：把 mp3 放进 public/assets/music/，封面放 public/assets/music/cover/，
	//   歌词可选放 public/assets/music/lrc/，然后下面用 url 指向 "/assets/music/xxx.mp3"
	// - 外链：用 meting 字段指定 server/type/id，构建时由浏览器端 Meting API 解析
	//   （汽水音乐无标准 Meting 服务，请用 url 直链方式接入，见文末示例）
	local: {
		playlist: [
			// ───────── 本地文件 ─────────
			// {
			// 	name: "使一颗心免于哀伤",
			// 	artist: "知更鸟 / HOYO-MiX / Chevy",
			// 	url: "/assets/music/使一颗心免于哀伤-哼唱.mp3",
			// 	cover: "/assets/music/cover/109951169585655912.webp",
			// 	lrc: "",
			// },

			// ───────── 外链：网易云歌单（整张歌单会展开为多条） ─────────
			// {
			// 	meting: {
			// 		server: "netease",
			// 		type: "playlist",
			// 		id: "10046455237",
			// 	},
			// },

			// ───────── 外链示例：QQ音乐单曲（把 id 换成你的歌曲 ID） ─────────
			// {
			// 	meting: {
			// 		server: "tencent",
			// 		type: "song",
			// 		id: "替换为QQ音乐歌曲ID",
			// 	},
			// },

			// ───────── 外链示例：酷狗单曲 ─────────
			// {
			// 	meting: {
			// 		server: "kugou",
			// 		type: "song",
			// 		id: "替换为酷狗歌曲ID",
			// 	},
			// },

			// ───────── 汽水音乐：标准 Meting 不支持，必须自托管音频 ─────────
			// 原因：汽水音乐无标准 Meting 平台；第三方解析 API 无 CORS 头（浏览器端无法调用）；
			//       直链带签名会过期。最稳做法是下载一次、永久放进 public/assets/music/。
			// 你的链接 https://qishui.douyin.com/s/iX95Enn1/ 反查 track_id = 7681517882018891803
			// 获取方式（二选一）：
			//   A. 把上面链接丢到 https://www.toolpro.cc/tool/qishui-music 解析，下载 M4A+封面+歌词，
			//      把音频放到 public/assets/music/、封面放 public/assets/music/cover/，然后去掉注释并填好；
			//   B. 直接把解析出的「音频直链」发我，我在服务端下载成文件落库并自动接好（不过期）。
			//   C. https://www.otool.net.cn/qishui-music-parse 下载音频
			// 文件名建议用 track_id 命名，例如 qishui-7681517882018891803.mp3
			// {
			// 	name: "汽水音乐歌曲名",
			// 	artist: "歌手",
			// 	url: "/assets/music/qishui-7681517882018891803.mp3",
			// 	cover: "/assets/music/cover/qishui-7681517882018891803.jpg",
			// 	lrc: "",
			// },
			{
				name: "Honey July（slow）",
				artist: "忧郁小美",
				url: "/assets/music/Honey July.m4a",
				cover: "/assets/music/cover/Honey July（slow）.jpg",
				lrc: "",
			},
			{
				name: "violets",
				artist: "shxnei",
				url: "/assets/music/violets.m4a",
				cover: "/assets/music/cover/violets.jpg",
				lrc: "",
			},
			{
				name: "In The Shadow Of The Sun (Remix)",
				artist: "Darkvibe",
				url: "/assets/music/In The Shadow Of The Sun (Remix).m4a",
				cover: "/assets/music/cover/In The Shadow Of The Sun (Remix).jpg",
				lrc: "",
			},
			

		],
	},
};
