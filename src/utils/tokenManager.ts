interface TokenResponse {
    accessToken: string;
    refreshToken: string;
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

// 刷新token
export async function refreshAccessToken(refreshToken: string): Promise<TokenResponse | null> {
    try {
        const response = await fetch('/api/refreshToken', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-jike-access-token': '', // 可以为空，因为refreshToken在header中
                'x-jike-refresh-token': refreshToken,
            },
        });

        const result = await response.json();

        if (response.ok && result.success) {
            return {
                accessToken: result.accessToken,
                refreshToken: result.refreshToken,
            };
        } else {
            console.error('刷新token失败:', result.message || response.status);
            if (result.response) {
                console.error('API响应详情:', result.response);
            }
            return null;
        }
    } catch (error) {
        console.error('刷新token错误:', error);
        return null;
    }
}

// 更新本地存储的用户数据
export function updateUserTokens(newTokens: TokenResponse): void {
    try {
        const storedUserData = localStorage.getItem('userData');
        if (storedUserData) {
            const userData: UserData = JSON.parse(storedUserData);
            userData.accessToken = newTokens.accessToken;
            userData.refreshToken = newTokens.refreshToken;
            localStorage.setItem('userData', JSON.stringify(userData));
        }
    } catch (error) {
        console.error('更新用户token失败:', error);
    }
}

// 检查token是否即将过期（可选，用于主动刷新）
export function isTokenExpiringSoon(accessToken: string): boolean {
    try {
        // JWT token的payload部分包含过期时间
        const payload = accessToken.split('.')[1];
        const decoded = JSON.parse(atob(payload));
        const exp = decoded.exp * 1000; // 转换为毫秒
        const now = Date.now();
        const timeUntilExpiry = exp - now;

        // 如果token在5分钟内过期，认为即将过期
        return timeUntilExpiry < 5 * 60 * 1000;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
        // 如果无法解析token，保守起见认为需要刷新
        return true;
    }
}

// 带自动刷新的API请求
export async function apiRequestWithRefresh(
    url: string,
    options: RequestInit = {}
): Promise<Response> {
    const userData = getUserData();
    if (!userData) {
        throw new Error('用户未登录');
    }

    // 添加accessToken到headers
    const headers = {
        ...options.headers,
        'x-jike-access-token': userData.accessToken,
    };

    let response = await fetch(url, {
        ...options,
        headers,
    });

    // 如果返回401，尝试刷新token
    if (response.status === 401) {
        const newTokens = await refreshAccessToken(userData.refreshToken);

        if (newTokens) {
            // 更新本地存储
            updateUserTokens(newTokens);

            // 使用新token重试请求
            const newHeaders = {
                ...options.headers,
                'x-jike-access-token': newTokens.accessToken,
            };

            response = await fetch(url, {
                ...options,
                headers: newHeaders,
            });
        } else {
            // 刷新失败，清除用户数据
            localStorage.removeItem('userData');
            throw new Error('Token刷新失败，请重新登录');
        }
    }

    return response;
}

// 获取用户数据
export function getUserData(): UserData | null {
    try {
        const storedUserData = localStorage.getItem('userData');
        if (storedUserData) {
            return JSON.parse(storedUserData);
        }
        return null;
    } catch (error) {
        console.error('获取用户数据失败:', error);
        return null;
    }
}

// 清除用户数据
export function clearUserData(): void {
    localStorage.removeItem('userData');
}
