import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const XJikeAccessToken = req.headers.get("x-jike-access-token") || "";
        const XJikeRefreshToken = req.headers.get("x-jike-refresh-token") || "";

        if (!XJikeRefreshToken) {
            return NextResponse.json(
                { success: false, message: "缺少刷新令牌" },
                { status: 400 }
            );
        }

        const url = "https://api.xiaoyuzhoufm.com/app_auth_tokens.refresh"
        const headers = {
            "Host": "api.xiaoyuzhoufm.com",
            "User-Agent": "Xiaoyuzhou/2.57.1 (build:1576; iOS 17.4.1)",
            "Market": "AppStore",
            "App-BuildNo": "1576",
            "OS": "ios",
            "x-jike-access-token": XJikeAccessToken,
            "x-jike-refresh-token": XJikeRefreshToken,
            "Manufacturer": "Apple",
            "BundleID": "app.podcast.cosmos",
            "Connection": "keep-alive",
            "Accept-Language": "zh-Hant-HK;q=1.0, zh-Hans-CN;q=0.9",
            "Model": "iPhone14,2",
            "app-permissions": "4",
            "Accept": "*/*",
            "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
            "App-Version": "2.57.1",
            "WifiConnected": "true",
            "OS-Version": "17.4.1",
            "x-custom-xiaoyuzhou-app-dev": "",
        }

        const res = await fetch(url, {
            method: "POST",
            headers,
        });

        if (!res.ok) {
            const errorText = await res.text();
            console.error("小宇宙刷新token API错误:", res.status, errorText);
            console.error("响应头:", Object.fromEntries(res.headers.entries()));
            return NextResponse.json(
                {
                    success: false,
                    message: `刷新token失败: ${res.status}`,
                    error: errorText
                },
                { status: res.status }
            );
        }

        // 首先尝试从响应头中获取token（与登录API一致）
        let accessToken = res.headers.get("x-jike-access-token") || "";
        let refreshToken = res.headers.get("x-jike-refresh-token") || "";

        // 如果响应头中没有token，尝试从响应体中获取
        if (!accessToken || !refreshToken) {
            const refreshTokenResponse = await res.json();
            console.log("刷新token响应体:", refreshTokenResponse);

            // 尝试从响应中提取token
            if (refreshTokenResponse.data) {
                // 如果data字段存在
                accessToken = refreshTokenResponse.data["x-jike-access-token"] || refreshTokenResponse.data.accessToken || "";
                refreshToken = refreshTokenResponse.data["x-jike-refresh-token"] || refreshTokenResponse.data.refreshToken || "";
            } else if (refreshTokenResponse["x-jike-access-token"]) {
                // 如果token直接在根级别
                accessToken = refreshTokenResponse["x-jike-access-token"];
                refreshToken = refreshTokenResponse["x-jike-refresh-token"];
            }
        }

        if (!accessToken || !refreshToken) {
            console.error("刷新token响应格式错误 - 响应头:", {
                "x-jike-access-token": res.headers.get("x-jike-access-token"),
                "x-jike-refresh-token": res.headers.get("x-jike-refresh-token")
            });
            return NextResponse.json(
                { success: false, message: "刷新token响应格式错误" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "刷新token成功",
            accessToken: accessToken,
            refreshToken: refreshToken,
        });

    } catch (error) {
        console.error("RefreshToken API 服务端错误:", error);
        const errMsg = error instanceof Error ? error.message : "未知服务器错误";

        return NextResponse.json(
            { success: false, message: `刷新token失败：${errMsg}`, errorDetail: errMsg },
            { status: 500 }
        );
    }
}