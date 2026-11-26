"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, ChevronRight } from "lucide-react";
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
  const [trackFilter, setTrackFilter] = useState<
    "all" | "phonics" | "vocab_sentence"
  >("all");
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

  const nextLesson = useMemo(() => {
    const firstPending = allLessons.find(
      (l) => !profile.completedLessonIds.includes(l.id)
    );
    return firstPending ?? allLessons[0] ?? null;
  }, [allLessons, profile.completedLessonIds]);

  const filteredLessons = useMemo(() => {
    return allLessons
      .map((lesson, idx) => ({ lesson, order: idx + 1 }))
      .filter(({ lesson }) => {
        if (trackFilter === "all") return true;
        if (trackFilter === "phonics") return lesson.track === "phonics";
        return lesson.track === "vocab_sentence" || lesson.track === "mixed";
      });
  }, [allLessons, trackFilter]);

  const phonicsCount = useMemo(
    () => allLessons.filter((l) => l.track === "phonics").length,
    [allLessons]
  );
  const vocabCount = allLessons.length - phonicsCount;

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
      <div className="w-full max-w-md min-h-screen pb-24 px-4 pt-4 space-y-4">
        {/* Minimal Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-xl font-extrabold text-slate-900">
              Học Tiếng Anh
            </h1>
            <p className="text-xs font-semibold text-slate-500">
              Lớp 3 cơ bản • {allLessons.length} bài học
            </p>
          </div>
          <button
            type="button"
            onClick={() => setPinOpen(true)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 active:scale-95"
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

        {/* Quick Resume / Next Lesson Hero */}
        {nextLesson && (
          <section className="rounded-2xl bg-white border border-emerald-200 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="rounded-lg bg-emerald-50 text-emerald-800 px-2.5 py-0.5 text-[11px] font-extrabold">
                {profile.completedLessonIds.length > 0
                  ? "Tiếp tục học"
                  : "Bắt đầu từ bài đầu"}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                {nextLesson.cards.length} thẻ
              </span>
            </div>

            <div>
              <h2 className="font-display text-lg font-extrabold text-slate-900 leading-snug">
                {nextLesson.title}
              </h2>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">
                {nextLesson.subtitleVi}
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {nextLesson.cards.map((c) => (
                <span
                  key={c.id}
                  className="rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700"
                >
                  {c.text}
                </span>
              ))}
            </div>

            <Link
              href={`/lesson/${nextLesson.id}`}
              className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 font-extrabold text-sm flex items-center justify-center gap-2 active:scale-[0.99] transition"
            >
              Học ngay
              <ArrowRight className="w-4 h-4" />
            </Link>
          </section>
        )}

        {/* Track Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
          <button
            type="button"
            onClick={() => setTrackFilter("all")}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold border shrink-0 transition ${
              trackFilter === "all"
                ? "bg-slate-900 border-slate-900 text-white"
                : "bg-white border-slate-200 text-slate-600"
            }`}
          >
            Tất cả ({allLessons.length})
          </button>
          <button
            type="button"
            onClick={() => setTrackFilter("phonics")}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold border shrink-0 transition ${
              trackFilter === "phonics"
                ? "bg-slate-900 border-slate-900 text-white"
                : "bg-white border-slate-200 text-slate-600"
            }`}
          >
            Ghép âm ({phonicsCount})
          </button>
          <button
            type="button"
            onClick={() => setTrackFilter("vocab_sentence")}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold border shrink-0 transition ${
              trackFilter === "vocab_sentence"
                ? "bg-slate-900 border-slate-900 text-white"
                : "bg-white border-slate-200 text-slate-600"
            }`}
          >
            Từ &amp; Câu ({vocabCount})
          </button>
        </div>

        {/* Clean Flat Lesson List */}
        <section className="space-y-2.5">
          {filteredLessons.map(({ lesson, order }) => {
            const isDone = profile.completedLessonIds.includes(lesson.id);
            const learnedCards = lesson.cards.filter(
              (c) => (progressMap[c.id]?.attempts ?? 0) > 0
            ).length;
            const trackLabel =
              lesson.track === "phonics"
                ? "Ghép âm"
                : lesson.track === "vocab_sentence"
                ? "Từ & Câu"
                : "Tổng hợp";
            const pct =
              lesson.cards.length > 0
                ? Math.round((learnedCards / lesson.cards.length) * 100)
                : 0;

            return (
              <Link
                key={lesson.id}
                href={`/lesson/${lesson.id}`}
                className="block rounded-2xl border border-slate-200 bg-white hover:border-emerald-300 active:scale-[0.99] p-3.5 transition space-y-2.5"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-extrabold shrink-0 ${
                        isDone
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {isDone ? (
                        <Check className="w-4 h-4 stroke-[2.5]" />
                      ) : (
                        order
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-extrabold text-slate-900 truncate">
                        {lesson.title}
                      </h3>
                      <p className="text-xs font-semibold text-slate-500 truncate mt-0.5">
                        {trackLabel} • {learnedCards}/{lesson.cards.length} thẻ
                        {isDone ? " • Đã hoàn thành" : ""}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
                </div>

                {/* Word preview chips */}
                <div className="flex flex-wrap gap-1.5 pl-12">
                  {lesson.cards.map((c) => {
                    const cardStudied = (progressMap[c.id]?.attempts ?? 0) > 0;
                    return (
                      <span
                        key={c.id}
                        className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${
                          cardStudied
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : "bg-slate-50 text-slate-600 border border-slate-200"
                        }`}
                      >
                        {c.text}
                      </span>
                    );
                  })}
                </div>

                {learnedCards > 0 && !isDone && (
                  <div className="pl-12">
                    <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )}
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
