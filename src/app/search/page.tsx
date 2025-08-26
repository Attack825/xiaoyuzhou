"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { apiRequestWithRefresh, getUserData, clearUserData } from '@/utils/tokenManager';


interface SearchResult {
    type?: string;
    pid?: string;
    eid?: string;
    title: string;
    author?: string;
    shownotes?: string;
    description?: string;
    media?: {
        size?: number;
        url?: string;
    };
    podcasters?: Array<{
        avatar?: string;
        nickname?: string;
        uid?: string;
    }>;
    image?: {
        largePicUrl: string;
        middlePicUrl: string;
        smallPicUrl: string;
    };
    podcast?: {
        pid: string;
        title: string;
        author: string;
        image: {
            largePicUrl: string;
        };
    };
    duration?: number;
    playCount?: number;
    clapCount?: number;
    commentCount?: number;
    pubDate?: string;
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

export default function SearchPage() {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [searching, setSearching] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(false);
    const [loadMoreKey, setLoadMoreKey] = useState<{ loadMoreKey: number; searchId: string } | null>(null);
    const router = useRouter();

    const formatDuration = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
        }
        return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
    };

    const formatPlayCount = (count: number) => {
        if (count >= 10000) {
            return `${(count / 10000).toFixed(1)}万`;
        }
        return count.toString();
    };

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

    useEffect(() => {
        const userData = getUserData();
        if (userData) {
            setUserData(userData);
        } else {
            router.push('/login');
        }
    }, [router]);

    const performSearch = useCallback(async (keyword: string, isLoadMore = false) => {
        if (!userData?.accessToken || !keyword.trim()) return;

        setSearching(true);
        setError(null);
        try {
            const searchParams: {
                keyword: string;
                type: string;
                loadMoreKey?: { loadMoreKey: number; searchId: string };
            } = {
                keyword: keyword.trim(),
                type: "ALL",
            };

            if (isLoadMore && loadMoreKey) {
                searchParams.loadMoreKey = loadMoreKey;
            }

            const response = await apiRequestWithRefresh('/api/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(searchParams),
            });

            const result = await response.json();

            if (result.success) {
                const newResults = result.data?.data || [];

                if (isLoadMore) {
                    setSearchResults(prev => [...prev, ...newResults]);
                } else {
                    setSearchResults(newResults);
                }

                setHasMore(!!result.data?.loadMoreKey);
                setLoadMoreKey(result.data?.loadMoreKey || null);
            } else {
                setError(result.message || '搜索失败');
            }
        } catch (err) {
            if (err instanceof Error && err.message.includes('Token刷新失败')) {
                clearUserData();
                router.push('/login');
                return;
            }
            setError('网络错误，请稍后重试');
            console.error('搜索错误:', err);
        } finally {
            setSearching(false);
        }
    }, [userData?.accessToken, loadMoreKey, router]);


    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchKeyword.trim()) {
            performSearch(searchKeyword);
        }
    };



    const handleLoadMore = () => {
        if (hasMore && loadMoreKey && searchKeyword.trim()) {
            performSearch(searchKeyword, true);
        }
    };

    const handleLogout = () => {
        clearUserData();
        router.push('/login');
    };

    if (!userData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">加载中...</p>
                </div>
            </div>
        );
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
                            <h1 className="text-xl font-semibold text-gray-900">搜索</h1>
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
                {/* 搜索表单 */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                    <form onSubmit={handleSearch} className="space-y-4">
                        <div className="flex space-x-4">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    value={searchKeyword}
                                    onChange={(e) => setSearchKeyword(e.target.value)}
                                    placeholder="搜索播客、剧集或用户..."
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    disabled={searching}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={searching || !searchKeyword.trim()}
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {searching ? (
                                    <div className="flex items-center space-x-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        <span>搜索中...</span>
                                    </div>
                                ) : (
                                    '搜索'
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* 错误提示 */}
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

                {/* 搜索结果 */}
                {searchResults.length > 0 && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">
                                搜索结果 ({searchResults.length})
                            </h2>
                            {hasMore && (
                                <button
                                    onClick={handleLoadMore}
                                    disabled={searching}
                                    className="text-blue-600 hover:text-blue-700 disabled:opacity-50"
                                >
                                    {searching ? '加载中...' : '加载更多'}
                                </button>
                            )}
                        </div>

                        <div className="space-y-4">
                            {searchResults.map((result, index) => (
                                <div
                                    key={index}
                                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
                                    onClick={() => {
                                        // 根据搜索结果类型打开相应链接
                                        if (result.eid) {
                                            window.open(`https://www.xiaoyuzhoufm.com/episode/${result.eid}`, '_blank');
                                        } else if (result.pid) {
                                            window.open(`https://www.xiaoyuzhoufm.com/podcast/${result.pid}`, '_blank');
                                        }
                                    }}
                                >
                                    <div className="flex items-start space-x-4">
                                        {/* 封面图片 */}
                                        {result.image?.largePicUrl ? (
                                            <Image
                                                src={result.image.largePicUrl}
                                                alt={result.title || '封面'}
                                                width={60}
                                                height={60}
                                                className="w-15 h-15 rounded-lg object-cover"
                                            />
                                        ) : (
                                            <div className="w-15 h-15 rounded-lg bg-gray-200 flex items-center justify-center">
                                                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                                </svg>
                                            </div>
                                        )}

                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900 mb-1">
                                                {result.title || '未知标题'}
                                            </h3>
                                            {result.description && (
                                                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                                    {result.description}
                                                </p>
                                            )}

                                            {/* 作者信息 */}
                                            {result.author && (
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <span className="text-sm text-gray-500">
                                                        {result.author}
                                                    </span>
                                                </div>
                                            )}

                                            {/* 播客信息 */}
                                            {result.podcast && (
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <span className="text-sm text-gray-700 font-medium">
                                                        {result.podcast.title}
                                                    </span>
                                                    <span className="text-sm text-gray-500">
                                                        {result.podcast.author}
                                                    </span>
                                                </div>
                                            )}

                                            {/* 播客嘉宾信息 */}
                                            {result.podcasters && result.podcasters.length > 0 && (
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <span className="text-sm text-gray-500">嘉宾：</span>
                                                    {result.podcasters.map((podcaster, idx) => (
                                                        <span key={idx} className="text-sm text-gray-600">
                                                            {podcaster.nickname}
                                                            {idx < result.podcasters!.length - 1 ? '、' : ''}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            {/* 统计信息 */}
                                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                {result.duration && (
                                                    <span>{formatDuration(result.duration)}</span>
                                                )}
                                                {result.playCount && (
                                                    <span>{formatPlayCount(result.playCount)} 播放</span>
                                                )}
                                                {result.clapCount && (
                                                    <span>{result.clapCount} 点赞</span>
                                                )}
                                                {result.commentCount && (
                                                    <span>{result.commentCount} 评论</span>
                                                )}
                                                {result.pubDate && (
                                                    <span>{formatDate(result.pubDate)}</span>
                                                )}
                                                {result.media?.size && (
                                                    <span>{Math.round(result.media.size / 1024 / 1024)}MB</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 无搜索结果 */}
                {searchResults.length === 0 && searching && (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">正在搜索...</p>
                    </div>
                )}

                {searchResults.length === 0 && !searching && searchKeyword && !error && (
                    <div className="text-center py-12">
                        <div className="mx-auto h-24 w-24 text-gray-300 mb-4">
                            <svg fill="currentColor" viewBox="0 0 24 24">
                                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">未找到相关结果</h3>
                        <p className="text-gray-500">尝试使用不同的关键词</p>
                    </div>
                )}
            </main>
        </div>
    );
}
