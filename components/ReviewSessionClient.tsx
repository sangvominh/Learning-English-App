"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { fetchActiveCurriculum } from "@/lib/client-curriculum";
import {
  getAllProgress,
  getProgressForCard,
  recordStudySession,
  saveCardProgress,
} from "@/lib/learner-db";
import { flattenCards, SEED_CURRICULUM } from "@/lib/seed-curriculum";
import {
  applyReviewOutcome,
  formatIntervalVi,
  getDueCards,
} from "@/lib/srs";
import type {
  CurriculumData,
  ImplicitOutcome,
  LearnerCardProgress,
  LearningCard,
} from "@/lib/types";
import { BottomNav } from "./BottomNav";
import { MiniGameArena } from "./MiniGameArena";

export function ReviewSessionClient() {
  const [curriculum, setCurriculum] = useState<CurriculumData>(SEED_CURRICULUM);
  const [progressMap, setProgressMap] = useState<
    Record<string, LearnerCardProgress>
  >({});
  const [loading, setLoading] = useState(true);
  const [nowMs, setNowMs] = useState<number | null>(null);
  const [activeCards, setActiveCards] = useState<LearningCard[] | null>(null);
  const [finishedCount, setFinishedCount] = useState<number | null>(null);

  const reloadState = async () => {
    const [currRes, prog] = await Promise.all([
      fetchActiveCurriculum(),
      getAllProgress(),
    ]);
    setCurriculum(currRes.curriculum);
    setProgressMap(prog);
    setNowMs(Date.now());
    setLoading(false);
  };

  useEffect(() => {
    let active = true;
    Promise.all([fetchActiveCurriculum(), getAllProgress()]).then(
      ([currRes, prog]) => {
        if (!active) return;
        setCurriculum(currRes.curriculum);
        setProgressMap(prog);
        setNowMs(Date.now());
        setLoading(false);
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
      nowMs !== null
        ? getDueCards(allCards, progressMap, new Date(nowMs), 10)
        : [],
    [allCards, progressMap, nowMs]
  );

  const nextUpcomingText = useMemo(() => {
    if (nowMs === null) return null;
    const entries = Object.values(progressMap).filter((p) => p.attempts > 0);
    if (entries.length === 0) return null;
    entries.sort(
      (a, b) => new Date(a.fsrs.due).getTime() - new Date(b.fsrs.due).getTime()
    );
    return formatIntervalVi(entries[0].fsrs.due, new Date(nowMs));
  }, [progressMap, nowMs]);

  const handleCardResult = async (cardId: string, outcome: ImplicitOutcome) => {
    const existing = await getProgressForCard(cardId);
    const { progress } = applyReviewOutcome(existing, cardId, outcome);
    await saveCardProgress(progress);
  };

  const handleStartFreePractice = () => {
    const learnedCards = allCards.filter(
      (c) => (progressMap[c.id]?.attempts ?? 0) > 0
    );
    const sourcePool = learnedCards.length > 0 ? learnedCards : allCards;
    const shuffled = [...sourcePool].sort(() => Math.random() - 0.5);
    setFinishedCount(null);
    setActiveCards(shuffled.slice(0, 5));
  };

  return (
    <div className="min-h-screen flex flex-col items-center">
      <div className="w-full max-w-md min-h-screen pb-24 px-4 pt-5 space-y-4">
        <header>
          <h1 className="font-display text-xl font-extrabold text-slate-900">
            Ôn tập SRS
          </h1>
          <p className="text-xs font-semibold text-slate-500">
            Lịch ôn lặp lại ngắt quãng tự động theo kết quả học
          </p>
        </header>

        {loading ? (
          <div className="rounded-2xl bg-white p-5 text-center border border-slate-200">
            <p className="font-semibold text-slate-500 text-sm">
              Đang kiểm tra lịch ôn...
            </p>
          </div>
        ) : finishedCount !== null ? (
          <div className="rounded-2xl bg-white border border-slate-200 p-5 space-y-4 animate-pop-in">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              <div>
                <h2 className="font-display text-lg font-extrabold text-slate-900">
                  Đã ôn xong {finishedCount} thẻ
                </h2>
                <p className="text-xs font-semibold text-slate-500">
                  Lịch ôn FSRS đã được cập nhật.
                </p>
              </div>
            </div>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setFinishedCount(null);
                  setActiveCards(null);
                  void reloadState();
                }}
                className="flex-1 rounded-xl bg-slate-100 text-slate-700 py-3 font-bold text-sm"
              >
                Xem lịch ôn
              </button>
              <Link
                href="/"
                className="flex-1 rounded-xl bg-emerald-600 text-white py-3 font-bold text-sm flex items-center justify-center"
              >
                Về bài học
              </Link>
            </div>
          </div>
        ) : activeCards ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">
                Đang ôn {activeCards.length} thẻ
              </span>
              <button
                type="button"
                onClick={() => setActiveCards(null)}
                className="text-xs font-bold text-slate-500 hover:underline"
              >
                Thoát
              </button>
            </div>
            <MiniGameArena
              cards={activeCards}
              distractorPool={allCards}
              onCardResult={handleCardResult}
              onComplete={async ({ starsEarned }) => {
                await recordStudySession({
                  starsEarned,
                  kind: "review",
                  cardsCount: activeCards.length,
                });
                setFinishedCount(activeCards.length);
                setActiveCards(null);
                void reloadState();
              }}
            />
          </div>
        ) : dueCards.length > 0 ? (
          <div className="rounded-2xl bg-white border border-orange-200 p-4 space-y-3.5">
            <div>
              <h2 className="font-display text-base font-extrabold text-slate-900">
                Cần ôn {dueCards.length} thẻ hôm nay
              </h2>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">
                Các thẻ đã đến hạn ôn hoặc cần luyện thêm.
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {dueCards.map((c) => (
                <span
                  key={c.id}
                  className="rounded-lg bg-slate-50 border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-800"
                >
                  {c.text}
                </span>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setActiveCards(dueCards)}
              className="w-full rounded-xl bg-orange-500 hover:bg-orange-600 text-white py-3 font-extrabold text-sm"
            >
              Bắt đầu ôn
            </button>
          </div>
        ) : (
          <div className="rounded-2xl bg-white border border-slate-200 p-5 space-y-4">
            <div className="space-y-1">
              <h2 className="font-display text-base font-extrabold text-slate-900">
                Chưa có thẻ đến hạn ôn
              </h2>
              <p className="text-xs font-semibold text-slate-500">
                {nextUpcomingText
                  ? `Đợt ôn tập tiếp theo dự kiến: ${nextUpcomingText}.`
                  : "Hoàn thành một bài học ở tab Bài học để hệ thống bắt đầu xếp lịch ôn."}
              </p>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={handleStartFreePractice}
                className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-3 font-bold text-sm"
              >
                Ôn ngẫu nhiên 5 thẻ
              </button>
              <Link
                href="/"
                className="block w-full text-center rounded-xl bg-slate-100 text-slate-700 py-3 font-bold text-sm"
              >
                Quay lại bài học
              </Link>
            </div>
          </div>
        )}
      </div>

      <BottomNav active="review" dueCount={dueCards.length} />
    </div>
  );
}
