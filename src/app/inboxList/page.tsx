"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { apiRequestWithRefresh, getUserData, clearUserData } from '@/utils/tokenManager';

interface InboxItem {
    eid: string;
    title: string;
    description: string;
    duration: number;
    pubDate: string;
    playCount: number;
    clapCount: number;
    commentCount: number;
    image: { largePicUrl: string };
    podcast: {
        pid: string;
        title: string;
        author: string;
        image: { largePicUrl: string };
    };
    media: {
        id: string;
        mimeType: string;
        size: number;
        source: { mode: string; url: string };
    };
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

export default function InboxListPage() {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [inboxItems, setInboxItems] = useState<InboxItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [loadMoreKey, setLoadMoreKey] = useState<{ pubDate: string; id: string } | null>(null);
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
        const userData = getUserData();
        if (userData) {
            setUserData(userData);
        } else {
            router.push('/login');
        }
    }, [router]);

    // 获取订阅更新列表
    const fetchInboxList = useCallback(async (isLoadMore = false, currentLoadMoreKey?: { pubDate: string; id: string }) => {
        if (!userData?.accessToken) return;

        setIsLoading(true);
        setError(null);

        try {
            const requestBody: Record<string, unknown> = {};

            // 使用传入的loadMoreKey或者当前状态的loadMoreKey
            const keyToUse = currentLoadMoreKey || (isLoadMore ? loadMoreKey : null);

            console.log('当前状态loadMoreKey:', loadMoreKey);
            console.log('传入的currentLoadMoreKey:', currentLoadMoreKey);
            console.log('最终使用的keyToUse:', keyToUse);

            if (isLoadMore && keyToUse) {
                requestBody.loadMoreKey = keyToUse;
                console.log('准备发送loadMoreKey:', keyToUse);
            }

            console.log('发送到API的请求体:', requestBody);

            const response = await apiRequestWithRefresh('/api/inboxList', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            const result = await response.json();

            if (result.success) {
                console.log('订阅更新列表数据:', result.data);
                console.log('loadMoreKey:', result.data?.loadMoreKey);
                console.log('hasMore:', !!result.data?.loadMoreKey);

                const newItems = result.data?.data || [];
                console.log('新项目数量:', newItems.length);

                if (isLoadMore) {
                    setInboxItems(prev => {
                        const updatedItems = [...prev, ...newItems];
                        console.log('合并后的项目数量:', updatedItems.length);
                        return updatedItems;
                    });
                } else {
                    console.log('设置新的订阅更新列表，数量:', newItems.length);
                    setInboxItems(newItems);
                }

                // 检查是否有更多数据
                console.log('API返回的loadMoreKey:', result.data?.loadMoreKey);
                console.log('API返回的loadMoreKey类型:', typeof result.data?.loadMoreKey);
                console.log('API返回的loadMoreKey内容:', JSON.stringify(result.data?.loadMoreKey));

                setHasMore(!!result.data?.loadMoreKey);
                setLoadMoreKey(result.data?.loadMoreKey || null);

                console.log('更新后的hasMore:', !!result.data?.loadMoreKey);
                console.log('更新后的loadMoreKey:', result.data?.loadMoreKey || null);
            } else {
                console.error('API返回失败:', result);
                setError(result.message || '获取订阅更新列表失败');
            }
        } catch (err) {
            if (err instanceof Error && err.message.includes('Token刷新失败')) {
                // Token刷新失败，跳转到登录页
                clearUserData();
                router.push('/login');
                return;
            }
            setError('网络错误，请稍后重试');
            console.error('获取订阅更新列表错误:', err);
        } finally {
            setIsLoading(false);
            setLoading(false);
        }
    }, [userData?.accessToken, loadMoreKey, router]);

    // 当用户数据加载完成后获取订阅更新列表
    useEffect(() => {
        if (userData?.accessToken) {
            console.log('开始获取订阅更新列表，用户token:', userData.accessToken.substring(0, 10) + '...');
            fetchInboxList(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userData?.accessToken]);

    // 加载更多
    const handleLoadMore = () => {
        console.log('handleLoadMore被调用');
        console.log('当前hasMore:', hasMore);
        console.log('当前loadMoreKey:', loadMoreKey);

        if (hasMore && loadMoreKey) {
            console.log('开始加载更多，使用loadMoreKey:', loadMoreKey);
            fetchInboxList(true, loadMoreKey);
        } else {
            console.log('无法加载更多 - hasMore:', hasMore, 'loadMoreKey存在:', !!loadMoreKey);
        }
    };

    // 处理登出
    const handleLogout = () => {
        clearUserData();
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
                            <h1 className="text-xl font-semibold text-gray-900">订阅更新</h1>
                            <span className="text-sm text-gray-500">
                                {inboxItems.length} 个更新
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
                                onClick={() => fetchInboxList(false)}
                                disabled={isLoading}
                                className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                                title="刷新订阅更新列表"
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

                {isLoading && inboxItems.length === 0 && (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">正在加载订阅更新列表...</p>
                    </div>
                )}

                {!isLoading && inboxItems.length === 0 && !error && (
                    <div className="text-center py-12">
                        <div className="mx-auto h-24 w-24 text-gray-300 mb-4">
                            <svg fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">暂无订阅更新</h3>
                        <p className="text-gray-500">您订阅的播客还没有新的更新</p>
                    </div>
                )}

                {/* 订阅更新列表 */}
                <div className="space-y-6">
                    {/* 调试信息 */}
                    <div className="text-sm text-gray-500 mb-4">
                        当前订阅更新数量: {inboxItems.length}, hasMore: {hasMore.toString()}, loadMoreKey: {loadMoreKey ? '存在' : '无'}
                    </div>
                    {inboxItems.map((item) => (
                        <div
                            key={item.eid}
                            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md hover:border-blue-300 transition-all duration-200 cursor-pointer group"
                            onClick={() => window.open(`https://www.xiaoyuzhoufm.com/episode/${item.eid}`, '_blank')}
                        >
                            <div className="p-6">
                                <div className="flex space-x-4">
                                    {/* 剧集封面 */}
                                    <div className="flex-shrink-0">
                                        {item.image?.largePicUrl ? (
                                            <Image
                                                src={item.image.largePicUrl}
                                                alt={item.title || '剧集封面'}
                                                width={80}
                                                height={80}
                                                className="w-20 h-20 rounded-lg object-cover"
                                            />
                                        ) : (
                                            <div className="w-20 h-20 rounded-lg bg-gray-200 flex items-center justify-center">
                                                <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>

                                    {/* 剧集信息 */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-1">
                                                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                                        {item.title || '未知标题'}
                                                    </h3>
                                                    <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                    </svg>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                                    {item.description || '暂无描述'}
                                                </p>

                                                {/* 播客信息 */}
                                                {item.podcast && (
                                                    <div className="flex items-center space-x-4 mb-3">
                                                        <div className="flex items-center space-x-2">
                                                            {item.podcast.image?.largePicUrl ? (
                                                                <Image
                                                                    src={item.podcast.image.largePicUrl}
                                                                    alt={item.podcast.title || '播客'}
                                                                    width={20}
                                                                    height={20}
                                                                    className="w-5 h-5 rounded-full"
                                                                />
                                                            ) : (
                                                                <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center">
                                                                    <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                                                    </svg>
                                                                </div>
                                                            )}
                                                            <span className="text-sm text-gray-700 font-medium">
                                                                {item.podcast.title || '未知播客'}
                                                            </span>
                                                        </div>
                                                        <span className="text-sm text-gray-500">
                                                            {item.podcast.author || '未知作者'}
                                                        </span>
                                                    </div>
                                                )}

                                                {/* 统计信息 */}
                                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                    <span>{formatDuration(item.duration || 0)}</span>
                                                    <span>{formatPlayCount(item.playCount || 0)} 播放</span>
                                                    <span>{item.clapCount || 0} 点赞</span>
                                                    <span>{item.commentCount || 0} 评论</span>
                                                    <span>{formatDate(item.pubDate || new Date().toISOString())}</span>
                                                </div>
                                            </div>

                                            {/* 操作按钮 */}
                                            <div className="flex flex-col space-y-2 ml-4" onClick={(e) => e.stopPropagation()}>
                                                <button
                                                    className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                                                    title="播放"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    className="p-2 text-gray-400 hover:text-green-500 transition-colors"
                                                    title="收藏"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
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

                {/* 加载更多按钮 */}
                {hasMore && (
                    <div className="text-center mt-8">
                        <div className="text-sm text-gray-500 mb-2">
                            调试: hasMore={hasMore.toString()}, loadMoreKey存在={!!loadMoreKey}
                        </div>
                        <button
                            onClick={handleLoadMore}
                            disabled={isLoading}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isLoading ? (
                                <div className="flex items-center space-x-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span>加载中...</span>
                                </div>
                            ) : (
                                '加载更多'
                            )}
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}
