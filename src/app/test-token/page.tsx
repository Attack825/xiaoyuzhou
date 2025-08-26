"use client";
import { useState } from "react";
import { getUserData, refreshAccessToken, updateUserTokens } from '@/utils/tokenManager';

export default function TestTokenPage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testRefreshToken = async () => {
    setLoading(true);
    setResult('');

    try {
      const userData = getUserData();
      if (!userData) {
        setResult('错误：用户未登录');
        return;
      }

      setResult('正在刷新token...');
      
      const newTokens = await refreshAccessToken(userData.refreshToken);
      
      if (newTokens) {
        updateUserTokens(newTokens);
        setResult(`✅ Token刷新成功！\n新的accessToken: ${newTokens.accessToken.substring(0, 20)}...\n新的refreshToken: ${newTokens.refreshToken.substring(0, 20)}...`);
      } else {
        setResult('❌ Token刷新失败\n请检查浏览器控制台获取详细错误信息');
      }
    } catch (error) {
      setResult(`❌ 错误：${error instanceof Error ? error.message : '未知错误'}\n请检查浏览器控制台获取详细错误信息`);
    } finally {
      setLoading(false);
    }
  };

  const checkUserData = () => {
    const userData = getUserData();
    if (userData) {
      setResult(`当前用户数据：\n用户ID: ${userData.userId}\n昵称: ${userData.nickname}\nAccessToken: ${userData.accessToken.substring(0, 20)}...\nRefreshToken: ${userData.refreshToken.substring(0, 20)}...`);
    } else {
      setResult('用户未登录');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Token刷新测试</h1>
        
        <div className="space-y-4 mb-8">
          <button
            onClick={checkUserData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            检查当前用户数据
          </button>
          
          <button
            onClick={testRefreshToken}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {loading ? '刷新中...' : '测试刷新Token'}
          </button>
        </div>

        {result && (
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">结果：</h2>
            <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 p-4 rounded border">
              {result}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
