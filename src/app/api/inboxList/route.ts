import { NextRequest, NextResponse } from "next/server";

interface InboxListRequestBody {
    loadMoreKey?: {
        pubDate: string;
        id: string;
    };
}

interface InboxListParams {
    limit: string;
    loadMoreKey?: {
        pubDate: string;
        id: string;
    };
}

export async function POST(req: NextRequest) {
    try {
        const body: InboxListRequestBody = await req.json();
        const { loadMoreKey } = body;
        
        console.log('inboxList API接收到的完整请求体:', body);
        console.log('inboxList API提取的loadMoreKey:', loadMoreKey);

        // 获取访问令牌
        const accessToken = req.headers.get("x-jike-access-token");
        if (!accessToken) {
            return NextResponse.json(
                { success: false, message: "缺少访问令牌" },
                { status: 401 }
            );
        }

        // 构建请求参数
        const params: InboxListParams = {
            limit: "20",
        };

        // 添加分页参数
        if (loadMoreKey) {
            params.loadMoreKey = {
                pubDate: loadMoreKey.pubDate,
                id: loadMoreKey.id,
            };
            console.log('使用loadMoreKey进行分页加载:', loadMoreKey);
            console.log('构建的loadMoreKey参数:', params.loadMoreKey);
        } else {
            console.log('首次加载订阅更新列表');
        }
        
        console.log('发送到小宇宙API的完整请求体:', params);

        // 构建请求头
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
            "x-jike-device-id": "",
            "x-jike-device-properties": "",
        };

        // 发送请求到小宇宙API
        const url = "https://api.xiaoyuzhoufm.com/v1/inbox/list";
        const response = await fetch(url, {
            method: "POST",
            headers,
            body: JSON.stringify(params),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("小宇宙订阅更新列表API错误:", response.status, errorText);
            return NextResponse.json(
                {
                    success: false,
                    message: `获取订阅更新列表失败: ${response.status}`,
                    error: errorText
                },
                { status: response.status }
            );
        }

        const result = await response.json();

        console.log('小宇宙API返回数据:', {
            dataLength: result.data?.length || 0,
            loadMoreKey: result.loadMoreKey,
            hasMore: !!result.loadMoreKey
        });

        return NextResponse.json({
            success: true,
            message: "获取订阅更新列表成功",
            data: result,
        });

    } catch (error) {
        console.error("InboxList API 服务端错误:", error);
        const errMsg = error instanceof Error ? error.message : "未知服务器错误";

        return NextResponse.json(
            { success: false, message: `获取订阅更新列表失败：${errMsg}`, errorDetail: errMsg },
            { status: 500 }
        );
    }
}
