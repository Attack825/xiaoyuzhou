import { NextRequest, NextResponse } from "next/server";

interface LoginRequestParams {
  mobilePhoneNumber: string;
  verifyCode: string;
  areaCode: string;
}

interface XiaoyuzhouAvatar {
  picture: {
    picUrl: string;
    largePicUrl: string;
    middlePicUrl: string;
    smallPicUrl: string;
    thumbnailUrl: string;
    format: string;
    width: number;
    height: number;
  };
}

interface XiaoyuzhouUser {
  type: "USER";
  uid: string;
  avatar: XiaoyuzhouAvatar;
  nickname: string;
  isNicknameSet: boolean;
  bio: string;
  gender: "MALE" | "FEMALE" | string;
  isCancelled: boolean;
  ipLoc: string;
  birthYear?: number;
  industry?: string;
  wechatUserInfo?: {
    nickName: string;
  };
  phoneNumber: {
    mobilePhoneNumber: string;
    areaCode: string;
  };
  phoneNumberNeeded: boolean;
  isBlockedByViewer: boolean;
  isInvited: boolean;
  userCanDebug: boolean;
}

interface XiaoyuzhouLoginResponse {
  data: {
    isSignUp: boolean;
    showNewbieGuide: boolean;
    newbieGuideFeatureGroup: string;
    subscriptionGuideFeatureGroup: string;
    user: XiaoyuzhouUser;
  };

  message?: string;
  code?: number;
}

export async function POST(req: NextRequest) {
  try {
    const { phone, code, region } = await req.json();
    if (!phone || !code) {
      return NextResponse.json(
        { success: false, message: "手机号和验证码不能为空" },
        { status: 400 }
      );
    }

    const requestParams: LoginRequestParams = {
      mobilePhoneNumber: phone,
      verifyCode: code,
      areaCode: region?.trim() || "+86",
    };

    const url = "https://api.xiaoyuzhoufm.com/v1/auth/loginOrSignUpWithSMS";
    const headers = {
      Host: "api.xiaoyuzhoufm.com",
      "App-BuildNo": "1576",
      OS: "ios",
      Manufacturer: "Apple",
      BundleID: "app.podcast.cosmos",
      "abtest-info": '{"old_user_discovery_feed":"enable"}',
      "Accept-Language": "zh-Hant-HK;q=1.0, zh-Hans-CN;q=0.9",
      Model: "iPhone14,2",
      "app-permissions": "4",
      Accept: "*/*",
      "Content-Type": "application/json",
      "App-Version": "2.57.1",
      WifiConnected: "true",
      "OS-Version": "17.4.1",
    };

    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(requestParams),
    });

    const accessToken = res.headers.get("x-jike-access-token") || "";
    const refreshToken = res.headers.get("x-jike-refresh-token") || "";
    if (!accessToken || !refreshToken) {
      throw new Error(
        "登录成功，但未获取到令牌（accessToken/refreshToken缺失）"
      );
    }

    let xiaoyuzhouRes: XiaoyuzhouLoginResponse;
    try {
      const rawData = await res.json();

      if (!rawData?.data || !rawData.data.user) {
        throw new Error("小宇宙API返回数据格式异常，缺失核心用户信息");
      }
      xiaoyuzhouRes = rawData as XiaoyuzhouLoginResponse;
    } catch (jsonErr) {
      const errMsg =
        jsonErr instanceof Error
          ? jsonErr.message
          : "小宇宙API响应解析失败（非JSON格式）";
      throw new Error(`响应处理错误：${errMsg}`);
    }

    const { data: xiaoyuzhouData } = xiaoyuzhouRes;
    const user = xiaoyuzhouData.user;
    const optimizedData = {
      accessToken: accessToken,
      refreshToken: refreshToken,

      userId: user.uid,
      nickname: user.nickname,
      bio: user.bio,
      gender: user.gender,
      ipLoc: user.ipLoc,
      birthYear: user.birthYear || "",
      industry: user.industry || "",
      isNewUser: xiaoyuzhouData.isSignUp,
      needNewbieGuide: xiaoyuzhouData.showNewbieGuide,

      maskedPhone: user.phoneNumber.mobilePhoneNumber,
      areaCode: user.phoneNumber.areaCode,

      wechatNickname: user.wechatUserInfo?.nickName || "",

      avatar: {
        original: user.avatar.picture.picUrl,
        large: user.avatar.picture.largePicUrl,
        middle: user.avatar.picture.middlePicUrl,
        small: user.avatar.picture.smallPicUrl,
        thumbnail: user.avatar.picture.thumbnailUrl,
        size: {
          width: user.avatar.picture.width,
          height: user.avatar.picture.height,
        },
      },

      originalData: xiaoyuzhouRes,
    };

    return NextResponse.json({
      success: true,
      message: xiaoyuzhouRes.message || "登录成功",
      data: optimizedData,
    });
  } catch (error) {
    console.error("Login API 服务端错误:", error);
    const errMsg = error instanceof Error ? error.message : "未知服务器错误";

    let status = 500;
    if (
      errMsg.includes("令牌缺失") ||
      errMsg.includes("数据格式异常") ||
      errMsg.includes("解析失败")
    ) {
      status = 400;
    }

    return NextResponse.json(
      { success: false, message: `登录失败：${errMsg}`, errorDetail: errMsg },
      { status }
    );
  }
}
