"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [region, setRegion] = useState("+86");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const router = useRouter();

  const handleSendCode = async () => {
    setLoading(true);
    setMsg("");
    try {
      const res = await fetch("/api/sendCode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, region }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg("验证码已发送");
        setCodeSent(true);
      } else {
        setMsg(data.message || "发送失败");
      }
    } catch {
      setMsg("网络错误");
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code, region }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg("登录成功");
        // 保存用户数据到本地存储
        localStorage.setItem('userData', JSON.stringify(data.data));
        // 登录成功后跳转到首页
        router.push("/");
      } else {
        setMsg(data.message || "登录失败");
      }
    } catch {
      setMsg("网络错误");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            账号登录
          </h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 1. 区域码 + 手机号 行（保持不变） */}
            <div className="flex space-x-3">
              <div className="w-15">
                <input
                  placeholder="区域码"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                />
              </div>
              <div className="flex-1">
                <input
                  placeholder="手机号"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  type="tel"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                />
              </div>
            </div>

            {/* 2. 核心修改：验证码输入框 + 获取验证码按钮 同行 */}
            <div className="flex space-x-3 items-center">
              {/* 验证码输入框：占满剩余空间 */}
              <div className="flex-1">
                <input
                  placeholder="验证码"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  disabled={!codeSent}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 disabled:bg-gray-50 disabled:border-gray-200"
                />
              </div>

              {/* 获取验证码按钮：固定宽度，与输入框垂直对齐 */}
              <button
                type="button"
                onClick={handleSendCode}
                disabled={loading || !phone || !region}
                className="w-25 py-2 px-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-1.5 h-3.5 w-3.5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    发送中
                  </>
                ) : (
                  "获取验证码"
                )}
              </button>
            </div>

            {/* 3. 登录按钮（保持不变） */}
            <button
              type="submit"
              disabled={loading || !codeSent || !code}
              className="w-full py-2.5 px-4 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              登录
            </button>

            {/* 4. 消息提示（保持不变） */}
            {msg && (
              <div
                className={`text-center text-sm ${
                  msg.includes("成功") ? "text-green-600" : "text-red-600"
                }`}
              >
                {msg}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
