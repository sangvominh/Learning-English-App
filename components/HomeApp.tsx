"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Flame,
  Lock,
  Play,
  Repeat,
  Sparkles,
  Star,
} from "lucide-react";
import { fetchActiveCurriculum } from "@/lib/client-curriculum";
import { getAllProgress, getProfile } from "@/lib/learner-db";
import { flattenCards, SEED_CURRICULUM } from "@/lib/seed-curriculum";
import { getDueCards } from "@/lib/srs";
import type {
  CurriculumData,
  LearnerCardProgress,
  LearnerProfile,
  UnitColor,
} from "@/lib/types";
import { BottomNav } from "./BottomNav";
import { PinModal } from "./PinModal";

const UNIT_STYLE: Record<
  UnitColor,
  { header: string; pill: string; border: string }
> = {
  emerald: {
    header: "from-emerald-500 to-teal-500",
    pill: "bg-emerald-100 text-emerald-800",
    border: "border-emerald-200",
  },
  sky: {
    header: "from-sky-500 to-blue-500",
    pill: "bg-sky-100 text-sky-800",
    border: "border-sky-200",
  },
  amber: {
    header: "from-amber-400 to-orange-500",
    pill: "bg-amber-100 text-amber-900",
    border: "border-amber-200",
  },
  rose: {
    header: "from-rose-400 to-pink-500",
    pill: "bg-rose-100 text-rose-800",
    border: "border-rose-200",
  },
};

export function HomeApp() {
  const router = useRouter();
  const [curriculum, setCurriculum] = useState<CurriculumData>(SEED_CURRICULUM);
  const [progressMap, setProgressMap] = useState<
    Record<string, LearnerCardProgress>
  >({});
  const [profile, setProfile] = useState<LearnerProfile>({
    streakDays: 0,
    lastStudyDate: null,
    totalStars: 0,
    completedLessonIds: [],
    recentLogs: [],
  });
  const [nowMs, setNowMs] = useState<number | null>(null);
  const [pinOpen, setPinOpen] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([fetchActiveCurriculum(), getAllProgress(), getProfile()]).then(
      ([currRes, prog, prof]) => {
        if (!active) return;
        setCurriculum(currRes.curriculum);
        setProgressMap(prog);
        setProfile(prof);
        setNowMs(Date.now());
      }
    );
    return () => {
      active = false;
    };
  }, []);

  const allCards = useMemo(
    () => flattenCards(curriculum).map((x) => x.card),
    [curriculum]
  );

  const dueCards = useMemo(
    () =>
      nowMs !== null ? getDueCards(allCards, progressMap, new Date(nowMs)) : [],
    [allCards, progressMap, nowMs]
  );

  const handlePinSuccess = (pin: string) => {
    try {
      window.sessionStorage.setItem("sb_admin_pin", pin);
    } catch {
      // ignore
    }
    setPinOpen(false);
    router.push("/admin");
  };

  return (
    <div className="min-h-screen flex flex-col items-center">
      <div className="w-full max-w-md min-h-screen pb-28 px-4 pt-4 space-y-5">
        {/* Top Bar */}
        <header className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-2xl shadow-sm shrink-0">
              🐝
            </div>
            <div className="min-w-0">
              <h1 className="font-display text-xl font-extrabold text-slate-900 leading-tight truncate">
                SunnyBee
              </h1>
              <p className="text-xs font-bold text-emerald-700 truncate">
                Tiếng Anh Lớp 3 • Chậm mà Chắc
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <div
              title="Chuỗi ngày học"
              className="flex items-center gap-1 rounded-full bg-orange-100 text-orange-800 px-2.5 py-1 text-xs font-extrabold"
            >
              <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
              {profile.streakDays}
            </div>
            <div
              title="Tổng số sao"
              className="flex items-center gap-1 rounded-full bg-amber-100 text-amber-900 px-2.5 py-1 text-xs font-extrabold"
            >
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
              {profile.totalStars}
            </div>
            <button
              type="button"
              onClick={() => setPinOpen(true)}
              aria-label="Vào trang quản trị phụ huynh"
              className="flex items-center gap-1 rounded-full bg-white border border-slate-200 px-2.5 py-1 text-xs font-extrabold text-slate-600 hover:bg-slate-50 active:scale-95"
            >
              <Lock className="w-3.5 h-3.5" />
              Phụ huynh
            </button>
          </div>
        </header>

        {/* Smart SRS Banner */}
        <section className="rounded-3xl bg-white border-2 border-amber-200 p-4 shadow-sm">
          {dueCards.length > 0 ? (
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 text-orange-800 px-2.5 py-0.5 text-[11px] font-extrabold">
                  <Repeat className="w-3 h-3" />
                  Ôn tập thông minh SRS
                </div>
                <p className="font-display text-lg font-extrabold text-slate-900 leading-snug">
                  Có {dueCards.length} thẻ đến giờ ôn!
                </p>
                <p className="text-xs font-semibold text-slate-500">
                  Ôn 2 phút để nhớ sâu âm và từ cũ nhé.
                </p>
              </div>
              <Link
                href="/review"
                className="btn-chunky shrink-0 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white px-4 py-3 font-extrabold text-sm shadow-[0_4px_0_#C2410C]"
              >
                Ôn ngay
              </Link>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-0.5 text-[11px] font-extrabold">
                  <Sparkles className="w-3 h-3" />
                  Sẵn sàng khám phá
                </div>
                <p className="font-display text-base font-extrabold text-slate-900 leading-snug">
                  {Object.keys(progressMap).length > 0
                    ? "Tuyệt vời! Hôm nay con đã ôn xong hết rồi."
                    : "Bắt đầu Chặng 1 ngay nhé!"}
                </p>
                <p className="text-xs font-semibold text-slate-500">
                  Mỗi ngày 1 bài học ngắn: Nghe → Nói → Chơi game.
                </p>
              </div>
              <Link
                href="/review"
                className="shrink-0 rounded-2xl bg-amber-100 text-amber-900 px-3 py-2.5 text-xs font-extrabold hover:bg-amber-200"
              >
                Ôn tự do
              </Link>
            </div>
          )}
        </section>

        {/* Units & Lessons */}
        <section className="space-y-5">
          {curriculum.units.map((unit) => {
            const style = UNIT_STYLE[unit.color] ?? UNIT_STYLE.emerald;
            const unitCards = unit.lessons.flatMap((l) => l.cards);
            const learnedCount = unitCards.filter(
              (c) => (progressMap[c.id]?.attempts ?? 0) > 0
            ).length;
            const pct =
              unitCards.length > 0
                ? Math.round((learnedCount / unitCards.length) * 100)
                : 0;

            return (
              <div
                key={unit.id}
                className={`rounded-3xl bg-white border-2 ${style.border} overflow-hidden shadow-sm`}
              >
                <div
                  className={`bg-gradient-to-r ${style.header} p-4 text-white`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-3xl leading-none">{unit.emoji}</span>
                      <div>
                        <h2 className="font-display text-lg font-extrabold leading-tight">
                          {unit.title}
                        </h2>
                        <p className="text-xs text-white/90 font-semibold mt-0.5">
                          {unit.descriptionVi}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex-1 h-2 rounded-full bg-white/30 overflow-hidden">
                      <div
                        className="h-full bg-white rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-extrabold">
                      {learnedCount}/{unitCards.length} thẻ
                    </span>
                  </div>
                </div>

                <div className="p-3 space-y-2.5">
                  {unit.lessons.map((lesson) => {
                    const isDone = profile.completedLessonIds.includes(
                      lesson.id
                    );
                    const trackLabel =
                      lesson.track === "phonics"
                        ? "🔤 Ghép âm"
                        : lesson.track === "vocab_sentence"
                        ? "🗣️ Từ & Câu"
                        : "✨ Tổng hợp";

                    return (
                      <Link
                        key={lesson.id}
                        href={`/lesson/${lesson.id}`}
                        className="flex items-center justify-between gap-3 rounded-2xl border-2 border-slate-100 bg-amber-50/30 hover:bg-amber-50 active:scale-[0.99] p-3 transition"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-12 h-12 rounded-2xl bg-white border border-amber-100 flex items-center justify-center text-2xl shrink-0 shadow-xs">
                            {lesson.emoji}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${style.pill}`}
                              >
                                {trackLabel}
                              </span>
                              <span className="text-[11px] font-bold text-slate-400">
                                {lesson.cards.length} thẻ
                              </span>
                            </div>
                            <h3 className="font-display text-base font-extrabold text-slate-900 truncate mt-0.5">
                              {lesson.title}
                            </h3>
                            <p className="text-xs font-semibold text-slate-500 truncate">
                              {lesson.subtitleVi}
                            </p>
                          </div>
                        </div>

                        <div className="shrink-0">
                          {isDone ? (
                            <span className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                              <CheckCircle2 className="w-6 h-6" />
                            </span>
                          ) : (
                            <span className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-[0_3px_0_#059669]">
                              <Play className="w-5 h-5 fill-current ml-0.5" />
                            </span>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </section>
      </div>

      <BottomNav active="learn" dueCount={dueCards.length} />

      <PinModal
        open={pinOpen}
        onClose={() => setPinOpen(false)}
        onSuccess={handlePinSuccess}
      />
    </div>
  );
}
