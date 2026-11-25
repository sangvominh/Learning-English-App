"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Copy, ShieldAlert, Smartphone } from "lucide-react";
import type { SystemStatus } from "@/lib/types";

const ENV_TEMPLATE = `GEMINI_API_KEY=your_gemini_api_key
ADMIN_PIN=1234
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=`;

export function SystemSettings() {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/status", { cache: "no-store" })
      .then((r) => r.json())
      .then((data: SystemStatus) => setStatus(data))
      .catch(() => {});
  }, []);

  const copyEnv = () => {
    navigator.clipboard.writeText(ENV_TEMPLATE).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    });
  };

  return (
    <div className="space-y-4">
      {/* Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-1">
          <p className="text-xs font-bold text-slate-500">Lưu trữ bài học</p>
          <p className="font-display text-lg font-extrabold text-slate-900 flex items-center gap-1.5">
            {status?.storageMode === "readonly-seed" ? (
              <ShieldAlert className="w-5 h-5 text-amber-500" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            )}
            {status?.storageMode === "supabase"
              ? "Supabase Cloud"
              : status?.storageMode === "readonly-seed"
              ? "Vercel (chưa gắn Supabase)"
              : "File cục bộ (data/curriculum.json)"}
          </p>
          <p className="text-xs text-slate-600">
            {status?.storageMode === "supabase"
              ? "Đã kết nối Cloud — soạn trên PC, điện thoại nhận bài ngay."
              : status?.storageMode === "readonly-seed"
              ? "App đang dùng bộ bài mẫu. Chỉnh sửa trong /admin sẽ lưu tạm trên trình duyệt này cho đến khi bạn thêm 3 biến Supabase vào Vercel Environment Variables."
              : "Đang lưu trên máy chạy server. Thêm Supabase khi muốn đồng bộ Cloud trên Vercel."}
          </p>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-1">
          <p className="text-xs font-bold text-slate-500">
            Gemini AI (Chấm âm & TTS)
          </p>
          <p className="font-display text-lg font-extrabold text-slate-900 flex items-center gap-1.5">
            {status?.hasGeminiKey ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            ) : (
              <ShieldAlert className="w-5 h-5 text-amber-500" />
            )}
            {status?.hasGeminiKey ? "Đã bật Gemini AI" : "Chưa gắn API Key"}
          </p>
          <p className="text-xs text-slate-600">
            {status?.hasGeminiKey
              ? "Sẵn sàng nghe chấm phát âm chi tiết và tạo audio TTS."
              : "App vẫn tự đọc bằng trình duyệt và cho bé tự so sánh giọng."}
          </p>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-1">
          <p className="text-xs font-bold text-slate-500">Bảo mật trang Quản trị</p>
          <p className="font-display text-lg font-extrabold text-slate-900 flex items-center gap-1.5">
            {status?.isUsingDefaultPin ? (
              <ShieldAlert className="w-5 h-5 text-amber-500" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            )}
            {status?.isUsingDefaultPin ? "Đang dùng PIN 1234" : "Đã đổi PIN riêng"}
          </p>
          <p className="text-xs text-slate-600">
            Đổi biến <code>ADMIN_PIN</code> trong <code>.env.local</code> khi
            cần.
          </p>
        </div>
      </div>

      {/* Android Mic & HTTPS Guide */}
      <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-2.5">
        <h2 className="font-display text-base font-extrabold text-slate-900 flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-emerald-600" />
          Lưu ý quan trọng để Micro & Cài app PWA chạy mượt trên Android
        </h2>
        <ul className="list-disc pl-5 text-xs text-slate-700 space-y-1.5 leading-relaxed">
          <li>
            <strong>Khi test nhanh qua Wi-Fi nội bộ (HTTP):</strong> Chrome
            Android mặc định chỉ cho bật Micro qua HTTPS. Để test ngay trên LAN,
            mở Chrome trên điện thoại → vào{" "}
            <code>chrome://flags/#unsafely-treat-insecure-origin-as-secure</code>{" "}
            → bật <strong>Enabled</strong> và điền địa chỉ LAN (VD:{" "}
            <code>http://192.168.x.x:3000</code>) → Relaunch.
          </li>
          <li>
            <strong>Khi dùng hằng ngày (khuyên dùng):</strong> Deploy miễn phí
            lên <strong>Vercel</strong> (có sẵn HTTPS tự động), lúc đó bé chỉ
            cần mở link trên Chrome Android → bấm{" "}
            <strong>Thêm vào màn hình chính</strong> là cài thành app và bật
            Micro ngay lập tức không cần chỉnh gì.
          </li>
          <li>
            <strong>Đồng bộ Cloud giữa máy tính & điện thoại:</strong> Tạo
            project miễn phí trên Supabase, chạy file{" "}
            <code>supabase/schema.sql</code> rồi điền 3 biến Supabase vào{" "}
            <code>.env.local</code> hoặc Vercel Environment Variables.
          </li>
        </ul>
      </div>

      {/* .env.local snippet */}
      <div className="rounded-2xl bg-slate-900 text-slate-100 p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-emerald-400">
            Mẫu file .env.local
          </span>
          <button
            type="button"
            onClick={copyEnv}
            className="inline-flex items-center gap-1 rounded-lg bg-slate-800 hover:bg-slate-700 px-2.5 py-1 text-xs font-bold"
          >
            <Copy className="w-3.5 h-3.5" />
            {copied ? "Đã chép!" : "Chép mẫu"}
          </button>
        </div>
        <pre className="text-xs font-mono overflow-x-auto leading-relaxed">
          {ENV_TEMPLATE}
        </pre>
      </div>
    </div>
  );
}
