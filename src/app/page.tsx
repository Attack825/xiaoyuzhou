"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

export default function Home() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      try {
        const parsed = JSON.parse(storedUserData);
        setUserData(parsed);
      } catch (e) {
        console.error('解析用户数据失败:', e);
        localStorage.removeItem('userData');
      }
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userData');
    setUserData(null);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* 头部导航 */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">小宇宙收藏管理</h1>
            </div>
            
            {userData && (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <img
                    src={userData.avatar.small || userData.avatar.original}
                    alt={userData.nickname}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {userData.nickname}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  退出登录
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            欢迎使用小宇宙收藏管理
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            管理您在小宇宙平台收藏的播客剧集，随时随地查看您的收藏内容
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* 登录卡片 */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <div className="p-8">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-6">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">账号登录</h3>
              <p className="text-gray-600 mb-6">
                使用手机号登录小宇宙账号，获取您的收藏列表
              </p>
              <Link
                href="/login"
                className="inline-flex items-center justify-center w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
              >
                立即登录
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          {/* 收藏列表卡片 */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <div className="p-8">
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg mb-6">
                <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">收藏列表</h3>
              <p className="text-gray-600 mb-6">
                查看和管理您收藏的播客剧集，支持播放和取消收藏
              </p>
              {userData ? (
                <Link
                  href="/favoriteList"
                  className="inline-flex items-center justify-center w-full px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200"
                >
                  查看收藏
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ) : (
                <button
                  disabled
                  className="inline-flex items-center justify-center w-full px-6 py-3 bg-gray-300 text-gray-500 font-medium rounded-lg cursor-not-allowed"
                >
                  请先登录
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 功能特点 */}
        <div className="mt-16 grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">安全可靠</h4>
            <p className="text-gray-600">使用官方API，数据安全有保障</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">快速访问</h4>
            <p className="text-gray-600">一键获取收藏列表，操作简单便捷</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg mx-auto mb-4">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">收藏管理</h4>
            <p className="text-gray-600">轻松管理您的播客收藏内容</p>
          </div>
        </div>
      </main>

      {/* 页脚 */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500">
            <p>&copy; 2024 小宇宙收藏管理. 基于小宇宙官方API开发.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
