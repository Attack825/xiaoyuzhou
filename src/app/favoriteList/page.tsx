"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface EpisodeItem {
  clapCount: number;
  commentCount: number;
  description: string;
  duration: number;
  eid: string;
  enclosure: { url: string };
  favoriteCount: number;
  image: { largePicUrl: string };
  ipLoc: string;
  isCustomized: boolean;
  isFavorited: boolean;
  isFinished: boolean;
  isPicked: boolean;
  isPlayed: boolean;
  isPrivateMedia: boolean;
  labels: string[];
  media: {
    id: string;
    mimeType: string;
    size: number;
    source: { mode: string; url: string };
  };
  mediaKey: string;
  payType: string;
  permissions: Array<{ name: string; status: string }>;
  pid: string;
  playCount: number;
  podcast: {
    author: string;
    brief: string;
    color: { dark: string; light: string; original: string };
    contacts: Array<{ name: string; note: string; type: string }>;
    description: string;
    episodeCount: number;
    hasPopularEpisodes: boolean;
    image: { largePicUrl: string };
    isCustomized: boolean;
    latestEpisodePubDate: string;
    payEpisodeCount: number;
    payType: string;
    permissions: Array<{ name: string; status: string }>;
    pid: string;
    podcasters: Array<{
      avatar: { picture: { largePicUrl: string } };
      bio: string;
      ipLoc: string;
      isBlockedByViewer: boolean;
      isCancelled: boolean;
      isNicknameSet: boolean;
      nickname: string;
      readTrackInfo: Record<string, unknown>;
      relation: string;
      type: string;
      uid: string;
    }>;
    readTrackInfo: Record<string, unknown>;
    status: string;
    subscriptionCount: number;
    subscriptionPush: boolean;
    subscriptionPushPriority: string;
    subscriptionStar: boolean;
    subscriptionStatus: string;
    syncMode: string;
    title: string;
    topicLabels: string[];
    type: string;
  };
  pubDate: string;
  readTrackInfo: Record<string, unknown>;
  shownotes: string;
  sponsors: unknown[];
  status: string;
  title: string;
  transcript: { mediaId: string };
  type: string;
  wechatShare: { style: string };
}

interface UserData {
  accessToken: string;
  refreshToken: string;
  userId: string;
  nickname: string;
  bio: string;
  avatar: {
    original: string;
    large: string;
    middle: string;
    small: string;
    thumbnail: string;
    size: { width: number; height: number };
  };
}

export default function FavoriteList() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [favorites, setFavorites] = useState<EpisodeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // 格式化时长
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
    }
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  // 格式化播放量
  const formatPlayCount = (count: number) => {
    if (count >= 10000) {
      return `${(count / 10000).toFixed(1)}万`;
    }
    return count.toString();
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}小时前`;
    } else if (diffInHours < 24 * 7) {
      return `${Math.floor(diffInHours / 24)}天前`;
    } else {
      return date.toLocaleDateString('zh-CN');
    }
  };

  // 检查用户登录状态
  useEffect(() => {
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      try {
        const parsed = JSON.parse(storedUserData);
        setUserData(parsed);
      } catch (e) {
        console.error('解析用户数据失败:', e);
        localStorage.removeItem('userData');
        router.push('/login');
      }
    } else {
      router.push('/login');
    }
  }, [router]);

  // 获取收藏列表
  const fetchFavorites = useCallback(async () => {
    if (!userData?.accessToken) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/favoriteList', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-jike-access-token': userData.accessToken,
        },
      });

      const result = await response.json();

      if (result.success) {
        console.log('收藏列表数据:', result.data);
        if (result.data && result.data.length > 0) {
          console.log('第一个收藏项结构:', result.data[0]);
        }
        setFavorites(result.data || []);
      } else {
        if (response.status === 401) {
          // 令牌过期，跳转到登录页
          localStorage.removeItem('userData');
          router.push('/login');
          return;
        }
        setError(result.message || '获取收藏列表失败');
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
      console.error('获取收藏列表错误:', err);
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  }, [userData?.accessToken, router]);

  // 当用户数据加载完成后获取收藏列表
  useEffect(() => {
    if (userData?.accessToken) {
      fetchFavorites();
    }
  }, [userData, fetchFavorites]);

  // 处理登出
  const handleLogout = () => {
    localStorage.removeItem('userData');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return null; // 正在跳转到登录页
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* 头部导航 */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="text-gray-500 hover:text-gray-700 transition-colors"
                title="返回主页"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">我的收藏</h1>
              <span className="text-sm text-gray-500">
                {favorites.length} 个收藏
              </span>
            </div>

            <div className="flex items-center space-x-4">
              {/* 用户信息 */}
              <div className="flex items-center space-x-3">
                <Image
                  src={userData.avatar.small || userData.avatar.original}
                  alt={userData.nickname}
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-sm font-medium text-gray-700">
                  {userData.nickname}
                </span>
              </div>

              {/* 刷新按钮 */}
              <button
                onClick={fetchFavorites}
                disabled={isLoading}
                className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                title="刷新收藏列表"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>

              {/* 登出按钮 */}
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                退出登录
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">正在加载收藏列表...</p>
          </div>
        )}

        {!isLoading && favorites.length === 0 && !error && (
          <div className="text-center py-12">
            <div className="mx-auto h-24 w-24 text-gray-300 mb-4">
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无收藏</h3>
            <p className="text-gray-500">您还没有收藏任何播客剧集</p>
          </div>
        )}

        {/* 收藏列表 */}
        <div className="space-y-6">
          {favorites.map((episode) => (
            <div
              key={episode.eid}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md hover:border-blue-300 transition-all duration-200 cursor-pointer group"
              onClick={() => window.open(`https://www.xiaoyuzhoufm.com/episode/${episode.eid}`, '_blank')}
            >
              <div className="p-6">
                <div className="flex space-x-4">
                  {/* 剧集封面 */}
                  <div className="flex-shrink-0">
                    {episode.image?.largePicUrl || episode.podcast?.image?.largePicUrl ? (
                      <Image
                        src={episode.image?.largePicUrl || episode.podcast?.image?.largePicUrl}
                        alt={episode.title || '剧集封面'}
                        width={80}
                        height={80}
                        className="w-20 h-20 rounded-lg object-cover"
                        onError={() => {
                          // Handle error by showing placeholder
                        }}
                      />
                    ) : null}
                    <div className={`w-20 h-20 rounded-lg bg-gray-200 flex items-center justify-center ${episode.image?.largePicUrl || episode.podcast?.image?.largePicUrl ? 'hidden' : ''}`}>
                      <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                      </svg>
                    </div>
                  </div>

                  {/* 剧集信息 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                            {episode.title || '未知标题'}
                          </h3>
                          <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </div>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {episode.description || '暂无描述'}
                        </p>

                        {/* 播客信息 */}
                        {episode.podcast && (
                          <div className="flex items-center space-x-4 mb-3">
                            <div className="flex items-center space-x-2">
                              {episode.podcast.image?.largePicUrl ? (
                                <Image
                                  src={episode.podcast.image.largePicUrl}
                                  alt={episode.podcast.title || '播客'}
                                  width={20}
                                  height={20}
                                  className="w-5 h-5 rounded-full"
                                />
                              ) : null}
                              <div className={`w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center ${episode.podcast.image?.largePicUrl ? 'hidden' : ''}`}>
                                <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                </svg>
                              </div>
                              <span className="text-sm text-gray-700 font-medium">
                                {episode.podcast.title || '未知播客'}
                              </span>
                            </div>
                            <span className="text-sm text-gray-500">
                              {episode.podcast.author || '未知作者'}
                            </span>
                          </div>
                        )}

                        {/* 统计信息 */}
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{formatDuration(episode.duration || 0)}</span>
                          <span>{formatPlayCount(episode.playCount || 0)} 播放</span>
                          <span>{episode.clapCount || 0} 点赞</span>
                          <span>{episode.commentCount || 0} 评论</span>
                          <span>{formatDate(episode.pubDate || new Date().toISOString())}</span>
                        </div>
                      </div>

                      {/* 操作按钮 */}
                      <div className="flex flex-col space-y-2 ml-4" onClick={(e) => e.stopPropagation()}>
                        <button
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          title="取消收藏"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                          </svg>
                        </button>
                        <button
                          className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                          title="播放"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
