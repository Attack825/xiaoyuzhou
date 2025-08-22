import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { phone, region } = await req.json();

    const url = "https://api.xiaoyuzhoufm.com/v1/auth/sendCode";
    const headers = {
      Host: "api.xiaoyuzhoufm.com",
      "User-Agent": "Xiaoyuzhou/2.57.1 (build:1576; iOS 17.4.1)",
      Market: "AppStore",
      "App-BuildNo": "1576",
      OS: "ios",
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
      "Accept-Encoding": "br;q=1.0, gzip;q=0.9, deflate;q=0.8",
      WifiConnected: "true",
      "OS-Version": "17.4.1",
      "x-custom-xiaoyuzhou-app-dev": "",
    };

    const body = JSON.stringify({
      mobilePhoneNumber: phone,
      areaCode: region || "+86",
    });

    const res = await fetch(url, {
      method: "POST",
      headers,
      body,
    });

    if (res.ok) {
      return NextResponse.json({
        success: true,
        message: "验证码已成功发送",
      });
    }

    const errorResult = await res.json().catch(() => ({}));
    return NextResponse.json(
      {
        success: false,
        message: errorResult.message || "验证码发送失败",
        originalStatus: res.status,
        originalError: errorResult,
      },
      { status: res.status }
    );
  } catch (error) {
    console.error("SendCode API error:", error);
    return NextResponse.json(
      { success: false, message: "服务器错误，发送验证码失败" },
      { status: 500 }
    );
  }
}
