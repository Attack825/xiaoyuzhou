"use client";
import { useEffect } from 'react';
import { getUserData, isTokenExpiringSoon, refreshAccessToken, updateUserTokens } from '@/utils/tokenManager';

export default function TokenProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // 检查token是否需要刷新
    const userData = getUserData();
    if (userData && isTokenExpiringSoon(userData.accessToken)) {
      refreshAccessToken(userData.refreshToken)
        .then(newTokens => {
          if (newTokens) {
            updateUserTokens(newTokens);
            console.log('Token自动刷新成功');
          }
        })
        .catch(error => {
          console.error('自动刷新token失败:', error);
        });
    }
  }, []);

  return <>{children}</>;
}
