import { NextRequest, NextResponse } from "next/server";

interface XiaoyuzhouSearchRequestBody {
    pid?: string;
    type: string;
    keyword: string;
    loadMoreKey?: {
        loadMoreKey: number;
        searchId: string;
    };
}

interface SearchParams {
    limit: string;
    sourcePageName: string;
    type: string;
    currentPageName: string;
    keyword: string;
    pid?: string;
    loadMoreKey?: {
        loadMoreKey: number;
        searchId: string;
    };
}

export async function POST(req: NextRequest) {
    try {
        const body: XiaoyuzhouSearchRequestBody = await req.json();
        const { pid, type, keyword, loadMoreKey } = body;

        const accessToken = req.headers.get("x-jike-access-token");
        if (!accessToken) {
            return NextResponse.json(
                { success: false, message: "缺少访问令牌" },
                { status: 401 }
            );
        }

        if (!keyword || !type) {
            return NextResponse.json(
                { success: false, message: "关键词和类型不能为空" },
                { status: 400 }
            );
        }

        const params: SearchParams = {
            limit: "20",
            sourcePageName: "4",
            type: type.toUpperCase(),
            currentPageName: "4",
            keyword: keyword,
        };

        if (loadMoreKey) {
            params.loadMoreKey = {
                loadMoreKey: loadMoreKey.loadMoreKey,
                searchId: loadMoreKey.searchId,
            };
        }

        if (pid) {
            params.pid = pid;
        }

        const now = new Date();
        const isoTime = now.toISOString();
        const headers = {
            Host: "api.xiaoyuzhoufm.com",
            "User-Agent": "Xiaoyuzhou/2.57.1 (build:1576; iOS 17.4.1)",
            Market: "AppStore",
            "App-BuildNo": "1576",
            OS: "ios",
            "x-jike-access-token": accessToken,
            Manufacturer: "Apple",
            BundleID: "app.podcast.cosmos",
            Connection: "keep-alive",
            "abtest-info": '{"old_user_discovery_feed":"enable"}',
            "Accept-Language": "zh-Hant-HK;q=1.0, zh-Hans-CN;q=0.9",
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
        };

        const url = "https://api.xiaoyuzhoufm.com/v1/search/create";
        const response = await fetch(url, {
            method: "POST",
            headers,
            body: JSON.stringify(params),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("小宇宙搜索API错误:", response.status, errorText);
            return NextResponse.json(
                {
                    success: false,
                    message: `搜索失败: ${response.status}`,
                    error: errorText
                },
                { status: response.status }
            );
        }

        const result = await response.json();

        return NextResponse.json({
            success: true,
            message: "搜索成功",
            data: result,
        });

    } catch (error) {
        console.error("Search API 服务端错误:", error);
        const errMsg = error instanceof Error ? error.message : "未知服务器错误";

        return NextResponse.json(
            { success: false, message: `搜索失败：${errMsg}`, errorDetail: errMsg },
            { status: 500 }
        );
    }
}

// 获取搜索预设
export async function GET(req: NextRequest) {
    try {
        const accessToken = req.headers.get("x-jike-access-token");
        if (!accessToken) {
            return NextResponse.json(
                { success: false, message: "缺少访问令牌" },
                { status: 401 }
            );
        }

        const now = new Date();
        const isoTime = now.toISOString();
        const headers = {
            Host: "api.xiaoyuzhoufm.com",
            "User-Agent": "Xiaoyuzhou/2.57.1 (build:1576; iOS 17.4.1)",
            Market: "AppStore",
            "App-BuildNo": "1576",
            OS: "ios",
            "x-jike-access-token": accessToken,
            Manufacturer: "Apple",
            BundleID: "app.podcast.cosmos",
            Connection: "keep-alive",
            "Accept-Language": "zh-Hant-HK;q=1.0, zh-Hans-CN;q=0.9",
            Model: "iPhone14,2",
            "app-permissions": "4",
            Accept: "*/*",
            "App-Version": "2.57.1",
            WifiConnected: "true",
            "OS-Version": "17.4.1",
            "x-custom-xiaoyuzhou-app-dev": "",
            "Local-Time": isoTime,
            Timezone: "Asia/Shanghai",
        };

        const url = "https://api.xiaoyuzhoufm.com/v1/search/get-preset";
        const response = await fetch(url, {
            method: "GET",
            headers,
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("小宇宙搜索预设API错误:", response.status, errorText);
            return NextResponse.json(
                {
                    success: false,
                    message: `获取搜索预设失败: ${response.status}`,
                    error: errorText
                },
                { status: response.status }
            );
        }

        const result = await response.json();

        return NextResponse.json({
            success: true,
            message: "获取搜索预设成功",
            data: result,
        });

    } catch (error) {
        console.error("Search Preset API 服务端错误:", error);
        const errMsg = error instanceof Error ? error.message : "未知服务器错误";

        return NextResponse.json(
            { success: false, message: `获取搜索预设失败：${errMsg}`, errorDetail: errMsg },
            { status: 500 }
        );
    }
}
