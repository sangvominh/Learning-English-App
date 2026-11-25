"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ChevronRight } from "lucide-react";
import { fetchActiveCurriculum } from "@/lib/client-curriculum";
import { getAllProgress, getProfile } from "@/lib/learner-db";
import { flattenCards, SEED_CURRICULUM } from "@/lib/seed-curriculum";
import { getDueCards } from "@/lib/srs";
import type {
  CurriculumData,
  LearnerCardProgress,
  LearnerProfile,
} from "@/lib/types";
import { BottomNav } from "./BottomNav";
import { PinModal } from "./PinModal";

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

  const allLessons = useMemo(
    () => curriculum.units.flatMap((u) => u.lessons),
    [curriculum]
  );

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
      <div className="w-full max-w-md min-h-screen pb-24 px-4 pt-5 space-y-4">
        {/* Minimal Header */}
        <header className="flex items-center justify-between">
          <h1 className="font-display text-xl font-extrabold text-slate-900">
            Học Tiếng Anh
          </h1>
          <button
            type="button"
            onClick={() => setPinOpen(true)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 active:scale-95"
          >
            Quản trị
          </button>
        </header>

        {/* SRS Review Banner — shown only when cards are due */}
        {dueCards.length > 0 && (
          <section className="rounded-2xl bg-orange-50 border border-orange-200 p-3.5 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-extrabold text-slate-900">
                Cần ôn {dueCards.length} thẻ hôm nay
              </p>
              <p className="text-xs font-semibold text-slate-600">
                Ôn lại đúng lúc để nhớ lâu hơn
              </p>
            </div>
            <Link
              href="/review"
              className="shrink-0 rounded-xl bg-orange-500 hover:bg-orange-600 text-white px-3.5 py-2 text-xs font-extrabold"
            >
              Ôn ngay
            </Link>
          </section>
        )}

        {/* Flat Lesson List */}
        <section className="space-y-2.5">
          {allLessons.map((lesson, idx) => {
            const isDone = profile.completedLessonIds.includes(lesson.id);
            const trackLabel =
              lesson.track === "phonics"
                ? "Ghép âm"
                : lesson.track === "vocab_sentence"
                ? "Từ & Câu"
                : "Tổng hợp";

            return (
              <Link
                key={lesson.id}
                href={`/lesson/${lesson.id}`}
                className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white hover:border-emerald-300 active:scale-[0.99] p-3.5 transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-extrabold shrink-0 ${
                      isDone
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {isDone ? <Check className="w-4 h-4 stroke-[2.5]" /> : idx + 1}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-sm font-extrabold text-slate-900 truncate">
                      {lesson.title}
                    </h2>
                    <p className="text-xs font-semibold text-slate-500 truncate mt-0.5">
                      {trackLabel} • {lesson.cards.length} thẻ
                      {isDone ? " • Đã học" : ""}
                    </p>
                  </div>
                </div>

                <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
              </Link>
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
