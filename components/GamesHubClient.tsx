"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  ChevronRight,
  Layers,
  Mic,
  Puzzle,
  Volume2,
} from "lucide-react";
import { fetchActiveCurriculum } from "@/lib/client-curriculum";
import {
  getAllProgress,
  getProgressForCard,
  recordStudySession,
  saveCardProgress,
} from "@/lib/learner-db";
import { flattenCards, SEED_CURRICULUM } from "@/lib/seed-curriculum";
import { applyReviewOutcome, getDueCards } from "@/lib/srs";
import type {
  CurriculumData,
  ImplicitOutcome,
  LearnerCardProgress,
  LearningCard,
} from "@/lib/types";
import { BottomNav } from "./BottomNav";
import { MiniGameArena, type MiniGameMode } from "./MiniGameArena";

const PRACTICE_MODES: Array<{
  id: MiniGameMode;
  title: string;
  desc: string;
  icon: typeof Volume2;
}> = [
  {
    id: "listen_pick",
    title: "Nghe & Chọn hình",
    desc: "Luyện nghe âm chuẩn và chọn đúng hình minh họa.",
    icon: Volume2,
  },
  {
    id: "tile_build",
    title: "Xếp chữ / Ghép câu",
    desc: "Chạm ghép các chữ cái hoặc từ theo đúng thứ tự.",
    icon: Puzzle,
  },
  {
    id: "memory_match",
    title: "Ghép cặp Hình – Chữ",
    desc: "Lật thẻ tìm cặp hình ảnh và chữ tiếng Anh tương ứng.",
    icon: Layers,
  },
  {
    id: "speak_flash",
    title: "Nhìn hình & Đọc to",
    desc: "Luyện phản xạ nói tiếng Anh và chấm phát âm.",
    icon: Mic,
  },
];

export function GamesHubClient() {
  const [curriculum, setCurriculum] = useState<CurriculumData>(SEED_CURRICULUM);
  const [progressMap, setProgressMap] = useState<
    Record<string, LearnerCardProgress>
  >({});
  const [scope, setScope] = useState<"all" | "learned">("all");
  const [lessonFilterId, setLessonFilterId] = useState<string>("all");
  const [activeMode, setActiveMode] = useState<MiniGameMode | null>(null);
  const [gameCards, setGameCards] = useState<LearningCard[]>([]);
  const [finishedDone, setFinishedDone] = useState(false);
  const [nowMs, setNowMs] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([fetchActiveCurriculum(), getAllProgress()]).then(
      ([currRes, prog]) => {
        setCurriculum(currRes.curriculum);
        setProgressMap(prog);
        setNowMs(Date.now());
      }
    );
  }, []);

  const allLessons = useMemo(
    () => curriculum.units.flatMap((u) => u.lessons),
    [curriculum]
  );

  const allCards = useMemo(
    () => flattenCards(curriculum).map((x) => x.card),
    [curriculum]
  );

  const dueCount = useMemo(
    () =>
      nowMs !== null
        ? getDueCards(allCards, progressMap, new Date(nowMs)).length
        : 0,
    [allCards, progressMap, nowMs]
  );

  const startPracticeMode = (modeId: MiniGameMode) => {
    let pool = allCards;
    if (lessonFilterId !== "all") {
      const targetLesson = allLessons.find((l) => l.id === lessonFilterId);
      if (targetLesson && targetLesson.cards.length > 0) {
        pool = targetLesson.cards;
      }
    } else if (scope === "learned") {
      const learnedPool = allCards.filter(
        (c) => (progressMap[c.id]?.attempts ?? 0) > 0
      );
      if (learnedPool.length > 0) pool = learnedPool;
    }

    const picked = [...pool].sort(() => Math.random() - 0.5).slice(0, 5);
    setGameCards(picked);
    setFinishedDone(false);
    setActiveMode(modeId);
  };

  const handleCardResult = async (cardId: string, outcome: ImplicitOutcome) => {
    const existing = await getProgressForCard(cardId);
    const { progress } = applyReviewOutcome(existing, cardId, outcome);
    await saveCardProgress(progress);
  };

  return (
    <div className="min-h-screen flex flex-col items-center">
      <div className="w-full max-w-md min-h-screen pb-24 px-4 pt-5 space-y-4">
        <header>
          <h1 className="font-display text-xl font-extrabold text-slate-900">
            Luyện tập
          </h1>
          <p className="text-xs font-semibold text-slate-500">
            Chọn dạng bài tập để ôn nghe, nhớ chữ và phát âm
          </p>
        </header>

        {finishedDone ? (
          <div className="rounded-2xl bg-white border border-slate-200 p-5 space-y-4 animate-pop-in">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              <div>
                <h2 className="font-display text-base font-extrabold text-slate-900">
                  Hoàn thành lượt luyện tập
                </h2>
                <p className="text-xs font-semibold text-slate-500">
                  Kết quả đã được cập nhật vào lịch ôn SRS.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setFinishedDone(false);
                setActiveMode(null);
              }}
              className="w-full rounded-xl bg-emerald-600 text-white py-3 font-bold text-sm"
            >
              Chọn bài tập khác
            </button>
          </div>
        ) : activeMode ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">
                {PRACTICE_MODES.find((m) => m.id === activeMode)?.title}
              </span>
              <button
                type="button"
                onClick={() => setActiveMode(null)}
                className="text-xs font-bold text-slate-500 hover:underline"
              >
                ← Đổi bài tập
              </button>
            </div>
            <MiniGameArena
              cards={gameCards}
              distractorPool={allCards}
              preferredModes={[activeMode]}
              onCardResult={handleCardResult}
              onComplete={async ({ starsEarned }) => {
                await recordStudySession({
                  starsEarned,
                  kind: "game",
                  cardsCount: gameCards.length,
                });
                setFinishedDone(true);
                setActiveMode(null);
              }}
            />
          </div>
        ) : (
          <>
            <div className="rounded-2xl bg-white border border-slate-200 p-3 space-y-2.5">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setScope("all");
                    setLessonFilterId("all");
                  }}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold border ${
                    scope === "all" && lessonFilterId === "all"
                      ? "bg-slate-900 border-slate-900 text-white"
                      : "bg-white border-slate-200 text-slate-600"
                  }`}
                >
                  Tất cả thẻ
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setScope("learned");
                    setLessonFilterId("all");
                  }}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold border ${
                    scope === "learned" && lessonFilterId === "all"
                      ? "bg-slate-900 border-slate-900 text-white"
                      : "bg-white border-slate-200 text-slate-600"
                  }`}
                >
                  Thẻ đã học
                </button>
              </div>

              <select
                aria-label="Chọn bài học để luyện tập"
                value={lessonFilterId}
                onChange={(e) => setLessonFilterId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700"
              >
                <option value="all">Theo phạm vi: Tất cả bài ({allCards.length} thẻ)</option>
                {allLessons.map((l, idx) => (
                  <option key={l.id} value={l.id}>
                    Bài {idx + 1}: {l.title} ({l.cards.length} thẻ)
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2.5">
              {PRACTICE_MODES.map((mode) => {
                const Icon = mode.icon;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => startPracticeMode(mode.id)}
                    className="w-full rounded-2xl border border-slate-200 bg-white hover:border-emerald-300 p-3.5 text-left flex items-center gap-3 active:scale-[0.99] transition"
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-sm font-extrabold text-slate-900">
                        {mode.title}
                      </h2>
                      <p className="text-xs font-semibold text-slate-500">
                        {mode.desc}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      <BottomNav active="games" dueCount={dueCount} />
    </div>
  );
}
