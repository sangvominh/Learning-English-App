"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BarChart3,
  BookOpenCheck,
  Lock,
  Settings,
} from "lucide-react";
import { fetchActiveCurriculum } from "@/lib/client-curriculum";
import { SEED_CURRICULUM } from "@/lib/seed-curriculum";
import type { CurriculumData } from "@/lib/types";
import { PinModal } from "../PinModal";
import { CurriculumEditor } from "./CurriculumEditor";
import { ParentInsights } from "./ParentInsights";
import { SystemSettings } from "./SystemSettings";

const emptySubscribe = () => () => {};

export function AdminPortalClient() {
  const router = useRouter();
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const [manualPin, setManualPin] = useState<string | null>(null);
  const [lockedOut, setLockedOut] = useState(false);
  const [tab, setTab] = useState<"content" | "insights" | "settings">(
    "content"
  );
  const [curriculum, setCurriculum] = useState<CurriculumData>(SEED_CURRICULUM);

  useEffect(() => {
    let active = true;
    fetchActiveCurriculum().then(({ curriculum: curr }) => {
      if (active) setCurriculum(curr);
    });
    return () => {
      active = false;
    };
  }, []);

  if (!isClient) {
    return null;
  }

  let storedPin: string | null = null;
  if (!lockedOut) {
    try {
      storedPin = window.sessionStorage.getItem("sb_admin_pin");
    } catch {
      storedPin = null;
    }
  }
  const adminPin = manualPin ?? storedPin;

  if (!adminPin) {
    return (
      <div className="min-h-screen bg-[#FFFBF2] flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-3 mb-4">
          <p className="text-4xl">🔐</p>
          <h1 className="font-display text-2xl font-extrabold text-slate-900">
            Trang Quản Trị Phụ Huynh
          </h1>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs font-extrabold text-emerald-700 hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Quay lại giao diện bé học
          </Link>
        </div>
        <PinModal
          open={true}
          onClose={() => router.push("/")}
          onSuccess={(pin) => {
            try {
              window.sessionStorage.setItem("sb_admin_pin", pin);
            } catch {
              // ignore
            }
            setLockedOut(false);
            setManualPin(pin);
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 py-3">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 text-emerald-800 px-3 py-2 text-xs font-extrabold hover:bg-emerald-100"
            >
              <ArrowLeft className="w-4 h-4" /> Về giao diện bé học
            </Link>
            <div>
              <h1 className="font-display text-lg font-extrabold text-slate-900 leading-tight">
                Quản Trị SunnyBee
              </h1>
              <p className="text-[11px] font-semibold text-slate-500">
                Thiết kế bài học, tạo âm thanh & theo dõi tiến độ của bé
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              try {
                window.sessionStorage.removeItem("sb_admin_pin");
              } catch {
                // ignore
              }
              setManualPin(null);
              setLockedOut(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-extrabold text-slate-600 hover:bg-slate-100"
          >
            <Lock className="w-3.5 h-3.5" /> Khóa lại
          </button>
        </div>

        {/* Tabs */}
        <div className="max-w-6xl mx-auto mt-3 flex gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setTab("content")}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-extrabold shrink-0 ${
              tab === "content"
                ? "bg-emerald-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <BookOpenCheck className="w-4 h-4" />
            Nội dung bài học
          </button>
          <button
            type="button"
            onClick={() => setTab("insights")}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-extrabold shrink-0 ${
              tab === "insights"
                ? "bg-emerald-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Quan sát bé học
          </button>
          <button
            type="button"
            onClick={() => setTab("settings")}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-extrabold shrink-0 ${
              tab === "settings"
                ? "bg-emerald-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Settings className="w-4 h-4" />
            Hệ thống & Cài đặt
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 pb-12">
        {tab === "content" && (
          <CurriculumEditor
            curriculum={curriculum}
            adminPin={adminPin}
            onChange={setCurriculum}
          />
        )}
        {tab === "insights" && <ParentInsights curriculum={curriculum} />}
        {tab === "settings" && <SystemSettings />}
      </main>
    </div>
  );
}
