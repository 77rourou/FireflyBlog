// 音乐播放器配置
export type MusicPlayerConfig = {
	// 使用方式：'meting' 或 'local'
	mode?: "meting" | "local"; // "meting" 使用 Meting API，"local" 使用本地/混合歌单

	// 默认音量 (0-1)
	volume?: number;

	// 播放模式：'list'=列表循环, 'one'=单曲循环, 'random'=随机播放
	playMode?: "list" | "one" | "random";

	// 是否显示歌词
	showLyrics?: boolean;

	// 是否在导航栏显示音乐播放器
	showInNavbar?: boolean;

	// 是否在侧边栏显示音乐播放器组件
	showInSidebar?: boolean;

	// Meting API 配置（同时作为混合歌单中未单独指定 api 的外链条目的默认配置）
	meting?: {
		// Meting API 地址
		api?: string;

		// 音乐平台：netease=网易云音乐, tencent=QQ音乐, kugou=酷狗音乐, xiami=虾米音乐, baidu=百度音乐
		server?: "netease" | "tencent" | "kugou" | "xiami" | "baidu";

		// 类型：song=单曲, playlist=歌单, album=专辑, search=搜索, artist=艺术家
		type?: "song" | "playlist" | "album" | "search" | "artist";

		// 歌单/专辑/单曲 ID 或搜索关键词
		id?: string;

		// 认证 token（可选）
		auth?: string;

		// 备用 API 配置（当主 API 失败时使用）
		fallbackApis?: string[];
	};

	// 本地音乐 / 混合歌单配置（当 mode 为 'local' 时使用）
	local?: {
		playlist?: Array<{
			// ── 直接音源（本地文件或任意 http(s) 直链） ──
			name?: string; // 歌曲名称
			artist?: string; // 艺术家
			url?: string; // 本地路径（相对于 public 目录）或完整 http(s) 直链
			cover?: string; // 封面图片路径（相对于 public 目录）或完整 http(s) 直链
			lrc?: string; // 歌词内容，支持 LRC 格式（文件路径或字符串）

			// ── 外链音源：由 Meting API 在浏览器端解析 ──
			// 支持平台：netease=网易云 / tencent=QQ音乐 / kugou=酷狗 / xiami=虾米 / baidu=百度
			// （汽水音乐无标准 Meting 服务，请用上方 url 直链方式接入）
			meting?: {
				server: "netease" | "tencent" | "kugou" | "xiami" | "baidu";
				type: "song" | "playlist" | "album" | "search" | "artist";
				id: string; // 歌曲/歌单/专辑 ID 或搜索关键词
				api?: string; // 可选，单独指定 API 地址
				auth?: string; // 可选，认证 token
				fallbackApis?: string[]; // 可选，单独指定备用 API
			};
		}>;
	};
};
