"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Award, CalendarClock, Repeat, Sparkles } from "lucide-react";
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
  const [finishedResult, setFinishedResult] = useState<{
    starsEarned: number;
    count: number;
  } | null>(null);

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
    setFinishedResult(null);
    setActiveCards(shuffled.slice(0, 5));
  };

  return (
    <div className="min-h-screen flex flex-col items-center">
      <div className="w-full max-w-md min-h-screen pb-28 px-4 pt-4 space-y-4">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-extrabold text-slate-900">
              Ôn tập thông minh SRS
            </h1>
            <p className="text-xs font-bold text-slate-500">
              Thuật toán FSRS tự nhắc đúng lúc con sắp quên
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center">
            <Repeat className="w-6 h-6" />
          </div>
        </header>

        {loading ? (
          <div className="rounded-3xl bg-white p-6 text-center border-2 border-amber-100">
            <p className="font-bold text-slate-500">Đang kiểm tra lịch ôn...</p>
          </div>
        ) : finishedResult ? (
          <div className="rounded-3xl bg-white border-2 border-emerald-200 p-6 text-center space-y-4 animate-pop-in">
            <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-500 flex items-center justify-center mx-auto">
              <Award className="w-10 h-10" />
            </div>
            <h2 className="font-display text-xl font-extrabold text-slate-900">
              Ôn xong {finishedResult.count} thẻ rồi! 🌟
            </h2>
            <p className="text-sm font-bold text-emerald-700">
              Con nhận được +{finishedResult.starsEarned} ngôi sao và trí nhớ đã
              được kéo dài thêm!
            </p>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setFinishedResult(null);
                  setActiveCards(null);
                  void reloadState();
                }}
                className="flex-1 rounded-2xl bg-slate-100 text-slate-700 py-3 font-extrabold text-sm"
              >
                Xem lịch ôn
              </button>
              <Link
                href="/"
                className="btn-chunky flex-1 rounded-2xl bg-emerald-500 text-white py-3 font-extrabold text-sm shadow-[0_4px_0_#059669] flex items-center justify-center"
              >
                Học bài mới
              </Link>
            </div>
          </div>
        ) : activeCards ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-orange-700">
                Đang ôn {activeCards.length} thẻ
              </span>
              <button
                type="button"
                onClick={() => setActiveCards(null)}
                className="text-xs font-bold text-slate-500 hover:underline"
              >
                Thoát phiên ôn
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
                setFinishedResult({
                  starsEarned,
                  count: activeCards.length,
                });
                setActiveCards(null);
                void reloadState();
              }}
            />
          </div>
        ) : dueCards.length > 0 ? (
          <div className="rounded-3xl bg-white border-2 border-orange-200 p-5 space-y-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center text-2xl font-extrabold shrink-0">
                {dueCards.length}
              </div>
              <div>
                <h2 className="font-display text-lg font-extrabold text-slate-900">
                  Thẻ cần ôn ngay hôm nay
                </h2>
                <p className="text-xs font-semibold text-slate-500">
                  Gồm các âm và từ đã đến hạn ôn hoặc bé đọc còn ngập ngừng.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {dueCards.map((c) => (
                <span
                  key={c.id}
                  className="rounded-xl bg-amber-50 border border-amber-200 px-3 py-1.5 text-xs font-extrabold text-slate-800"
                >
                  {c.text}
                </span>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setActiveCards(dueCards)}
              className="btn-chunky w-full rounded-2xl bg-orange-500 hover:bg-orange-600 text-white py-3.5 font-extrabold text-base shadow-[0_4px_0_#C2410C]"
            >
              Bắt đầu ôn ngay! 🚀
            </button>
          </div>
        ) : (
          <div className="rounded-3xl bg-white border-2 border-emerald-100 p-6 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CalendarClock className="w-9 h-9" />
            </div>
            <div className="space-y-1">
              <h2 className="font-display text-xl font-extrabold text-slate-900">
                Chưa có thẻ nào bị quên! 🎉
              </h2>
              <p className="text-xs font-semibold text-slate-500">
                {nextUpcomingText
                  ? `Đợt ôn tập tiếp theo dự kiến: ${nextUpcomingText}.`
                  : "Bé hãy học xong Bài 1 ở trang chủ để hệ thống bắt đầu xếp lịch ôn thông minh nhé."}
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={handleStartFreePractice}
                className="btn-chunky w-full rounded-2xl bg-amber-400 hover:bg-amber-500 text-amber-950 py-3 font-extrabold text-sm shadow-[0_4px_0_#D97706] flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Ôn tập tự do (5 thẻ ngẫu nhiên)
              </button>
              <Link
                href="/"
                className="block w-full rounded-2xl bg-emerald-50 text-emerald-800 py-3 font-extrabold text-sm"
              >
                Quay lại học bài mới
              </Link>
            </div>
          </div>
        )}
      </div>

      <BottomNav active="review" dueCount={dueCards.length} />
    </div>
  );
}
