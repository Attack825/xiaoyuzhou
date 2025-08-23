import { NextRequest, NextResponse } from "next/server";

/**
 * 收藏列表响应根接口
 */
interface FavoriteListResponse {
  data: EpisodeItem[];
  loadMoreKey: string;
}

/**
 * 播客剧集信息（单条收藏项）
 */
interface EpisodeItem {
  /** 点赞数 */
  clapCount: number;
  /** 评论数 */
  commentCount: number;
  /** 剧集描述（纯文本） */
  description: string;
  /** 音频时长（秒） */
  duration: number;
  /** 剧集唯一ID */
  eid: string;
  /** 音频附件信息 */
  enclosure: Enclosure;
  /** 收藏数 */
  favoriteCount: number;
  /** 剧集封面图信息 */
  image: ImageInfo;
  /** IP属地 */
  ipLoc: string;
  /** 是否自定义配置 */
  isCustomized: boolean;
  /** 当前用户是否已收藏 */
  isFavorited: boolean;
  /** 是否完结 */
  isFinished: boolean;
  /** 是否被精选 */
  isPicked: boolean;
  /** 当前用户是否已播放 */
  isPlayed: boolean;
  /** 是否为私有媒体 */
  isPrivateMedia: boolean;
  /** 标签列表（无标签时为空数组） */
  labels: string[];
  /** 音频媒体信息 */
  media: MediaInfo;
  /** 音频媒体Key（与media.id一致） */
  mediaKey: string;
  /** 付费类型（如：FREE-免费） */
  payType: string;
  /** 权限列表（如分享权限） */
  permissions: Permission[];
  /** 所属播客ID（与podcast.pid一致） */
  pid: string;
  /** 播放量 */
  playCount: number;
  /** 所属播客整体信息 */
  podcast: PodcastInfo;
  /** 发布时间（ISO 8601格式） */
  pubDate: string;
  /** 阅读追踪信息（预留字段，暂为空） */
  readTrackInfo: Record<string, unknown>;
  /** 剧集详情（HTML格式，含主播、内容简介等） */
  shownotes: string;
  /** 赞助商列表（无赞助商时为空数组） */
  sponsors: unknown[];
  /** 剧集状态（如：NORMAL-正常） */
  status: string;
  /** 剧集标题 */
  title: string;
  /** 转录文本关联信息 */
  transcript: Transcript;
  /** 内容类型（固定为EPISODE-剧集） */
  type: string;
  /** 微信分享配置 */
  wechatShare: WechatShareConfig;
}

/**
 * 音频附件信息
 */
interface Enclosure {
  /** 音频文件URL */
  url: string;
}

/**
 * 图片信息（通用：剧集封面、播客封面等）
 */
interface ImageInfo {
  /** 大图URL */
  largePicUrl: string;
  /** 其他图片尺寸字段（预留，根据实际场景补充，如smallPicUrl等） */
  [key: string]: unknown;
}

/**
 * 音频媒体详情
 */
interface MediaInfo {
  /** 媒体文件ID（与mediaKey一致） */
  id: string;
  /** 媒体类型（如：audio/mp4） */
  mimeType: string;
  /** 媒体文件大小（字节） */
  size: number;
  /** 媒体源信息 */
  source: MediaSource;
}

/**
 * 媒体源配置
 */
interface MediaSource {
  /** 访问模式（如：PUBLIC-公开） */
  mode: string;
  /** 媒体源URL */
  url: string;
}

/**
 * 权限配置项
 */
interface Permission {
  /** 权限名称（如：SHARE-分享权限） */
  name: string;
  /** 权限状态（如：PERMITTED-允许） */
  status: string;
}

/**
 * 播客整体信息
 */
interface PodcastInfo {
  /** 播客作者名称 */
  author: string;
  /** 播客简介（简短） */
  brief: string;
  /** 播客主题色配置 */
  color: PodcastColor;
  /** 联系方式列表（如公众号、社交账号等） */
  contacts: Contact[];
  /** 播客详细描述 */
  description: string;
  /** 总集数 */
  episodeCount: number;
  /** 是否有热门剧集 */
  hasPopularEpisodes: boolean;
  /** 播客封面图（与ImageInfo结构一致） */
  image: ImageInfo;
  /** 是否自定义配置 */
  isCustomized: boolean;
  /** 最新剧集发布时间（ISO 8601格式） */
  latestEpisodePubDate: string;
  /** 付费剧集数量 */
  payEpisodeCount: number;
  /** 播客付费类型（如：FREE-免费） */
  payType: string;
  /** 播客权限列表（如分享权限） */
  permissions: Permission[];
  /** 播客唯一ID */
  pid: string;
  /** 播客主列表 */
  podcasters: Podcaster[];
  /** 阅读追踪信息（预留字段，暂为空） */
  readTrackInfo: Record<string, unknown>;
  /** 播客状态（如：NORMAL-正常） */
  status: string;
  /** 订阅人数 */
  subscriptionCount: number;
  /** 是否开启订阅推送 */
  subscriptionPush: boolean;
  /** 订阅推送优先级（如：HIGH-高） */
  subscriptionPushPriority: string;
  /** 是否标星订阅 */
  subscriptionStar: boolean;
  /** 订阅状态（如：ON-已订阅） */
  subscriptionStatus: string;
  /** 同步模式（如：SELF_HOSTING-自建） */
  syncMode: string;
  /** 播客标题 */
  title: string;
  /** 播客主题标签列表（无标签时为空数组） */
  topicLabels: string[];
  /** 内容类型（固定为PODCAST-播客） */
  type: string;
}

/**
 * 播客主题色配置
 */
interface PodcastColor {
  /** 深色模式主题色 */
  dark: string;
  /** 浅色模式主题色 */
  light: string;
  /** 原始主题色 */
  original: string;
}

/**
 * 联系方式项
 */
interface Contact {
  /** 联系方式名称（如：猫头鹰喜剧） */
  name: string;
  /** 备注说明（如：订阅公众号） */
  note: string;
  /** 联系方式类型（如：wechatOfficialAccounts-微信公众号） */
  type: string;
}

/**
 * 播客主信息
 */
interface Podcaster {
  /** 播客主头像信息 */
  avatar: Avatar;
  /** 播客主简介 */
  bio: string;
  /** 播客主IP属地 */
  ipLoc: string;
  /** 当前用户是否屏蔽该播客主 */
  isBlockedByViewer: boolean;
  /** 播客主账号是否注销 */
  isCancelled: boolean;
  /** 是否设置昵称 */
  isNicknameSet: boolean;
  /** 播客主昵称 */
  nickname: string;
  /** 阅读追踪信息（预留字段，暂为空） */
  readTrackInfo: Record<string, unknown>;
  /** 与当前用户的关系（如：STRANGE-陌生） */
  relation: string;
  /** 账号类型（如：USER-个人用户） */
  type: string;
  /** 播客主唯一ID */
  uid: string;
}

/**
 * 头像信息
 */
interface Avatar {
  /** 头像图片详情 */
  picture: PictureInfo;
}

/**
 * 图片详情（用于头像）
 */
interface PictureInfo {
  /** 图片格式（如：jpeg） */
  format: string;
  /** 图片高度（像素） */
  height: number;
  /** 大图URL */
  largePicUrl: string;
  /** 图片宽度（像素） */
  width: number;
  /** 其他图片字段（预留，如smallPicUrl等） */
  [key: string]: unknown;
}

/**
 * 转录文本关联信息
 */
interface Transcript {
  /** 关联的媒体文件ID（与media.id一致） */
  mediaId: string;
}

/**
 * 微信分享配置
 */
interface WechatShareConfig {
  /** 分享样式（如：LINK_CARD-链接卡片） */
  style: string;
}

export async function POST(req: NextRequest) {
  try {
    // 从请求头获取访问令牌
    const XJikeAccessToken = req.headers.get("x-jike-access-token");

    if (!XJikeAccessToken) {
      return NextResponse.json(
        {
          success: false,
          message: "缺少访问令牌，请先登录",
          data: null
        },
        { status: 401 }
      );
    }

    const url = "https://api.xiaoyuzhoufm.com/v1/favorite/list";
    const isoTime = new Date().toISOString();

    const headers = {
      Host: "api.xiaoyuzhoufm.com",
      "User-Agent": "Xiaoyuzhou/2.57.1 (build:1576; iOS 17.4.1)",
      Market: "AppStore",
      "App-BuildNo": "1576",
      OS: "ios",
      "x-jike-access-token": XJikeAccessToken,
      Manufacturer: "Apple",
      BundleID: "app.podcast.cosmos",
      Connection: "keep-alive",
      "abtest-info": "{}",
      "Accept-Language": "zh-Hans-CN;q=1.0, zh-Hant-TW;q=0.9",
      Model: "iPhone14,2",
      "app-permissions": "4",
      Accept: "*/*",
      "Content-Type": "application/json",
      "App-Version": "2.57.1",
      WifiConnected: "true",
      "OS-Version": "17.4.1",
      "x-custom-xiaoyuzhou-app-dev": "",
      "Local-Time": isoTime,
      Timezone: "Asia/Shanghai",
      "x-jike-device-properties": "",
      "x-jike-device-id": "",
    };
    const body = {}

    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      // 处理不同的错误状态码
      if (response.status === 401) {
        return NextResponse.json(
          {
            success: false,
            message: "访问令牌无效或已过期，请重新登录",
            data: null
          },
          { status: 401 }
        );
      }

      if (response.status === 403) {
        return NextResponse.json(
          {
            success: false,
            message: "没有权限访问收藏列表",
            data: null
          },
          { status: 403 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          message: `请求失败 (${response.status})`,
          data: null
        },
        { status: response.status }
      );
    }

    const data: FavoriteListResponse = await response.json();


    return NextResponse.json({
      success: true,
      message: "获取收藏列表成功",
      data: data.data
    });

  } catch (error) {
    console.error("FavoriteList API 错误:", error);
    const errMsg = error instanceof Error ? error.message : "未知服务器错误";

    return NextResponse.json(
      {
        success: false,
        message: "获取收藏列表失败：" + errMsg,
        data: null
      },
      { status: 500 }
    );
  }
}
