"use client";

import { useEffect, useMemo, useState } from "react";
import { Award, Gamepad2, Mic, Puzzle, Sparkles, Volume2 } from "lucide-react";
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

const GAME_MODES: Array<{
  id: MiniGameMode;
  title: string;
  desc: string;
  badge: string;
  icon: typeof Volume2;
  color: string;
}> = [
  {
    id: "listen_pick",
    title: "Nghe & Chọn hình",
    desc: "Luyện tai nghe âm chuẩn rồi chạm vào bức tranh đúng.",
    badge: "Luyện nghe",
    icon: Volume2,
    color: "bg-sky-50 border-sky-200 text-sky-900",
  },
  {
    id: "tile_build",
    title: "Xếp chữ / Ghép câu",
    desc: "Chạm các mảnh chữ cái hoặc từ để ghép thành đáp án.",
    badge: "Nhớ mặt chữ",
    icon: Puzzle,
    color: "bg-amber-50 border-amber-200 text-amber-900",
  },
  {
    id: "memory_match",
    title: "Lật thẻ Ghép cặp",
    desc: "Tìm cặp Hình ảnh ↔ Chữ tiếng Anh giống nhau.",
    badge: "Trí nhớ",
    icon: Sparkles,
    color: "bg-violet-50 border-violet-200 text-violet-900",
  },
  {
    id: "speak_flash",
    title: "Nhìn hình & Đọc to",
    desc: "Phản xạ nhìn hình nói tiếng Anh và chấm phát âm.",
    badge: "Luyện nói",
    icon: Mic,
    color: "bg-emerald-50 border-emerald-200 text-emerald-900",
  },
];

export function GamesHubClient() {
  const [curriculum, setCurriculum] = useState<CurriculumData>(SEED_CURRICULUM);
  const [progressMap, setProgressMap] = useState<
    Record<string, LearnerCardProgress>
  >({});
  const [selectedUnitId, setSelectedUnitId] = useState<string>("all");
  const [activeMode, setActiveMode] = useState<MiniGameMode | null>(null);
  const [gameCards, setGameCards] = useState<LearningCard[]>([]);
  const [resultStars, setResultStars] = useState<number | null>(null);
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

  const startGameMode = (modeId: MiniGameMode) => {
    const pool =
      selectedUnitId === "all"
        ? allCards
        : curriculum.units
            .find((u) => u.id === selectedUnitId)
            ?.lessons.flatMap((l) => l.cards) ?? allCards;
    const picked = [...pool].sort(() => Math.random() - 0.5).slice(0, 5);
    setGameCards(picked);
    setResultStars(null);
    setActiveMode(modeId);
  };

  const handleCardResult = async (cardId: string, outcome: ImplicitOutcome) => {
    const existing = await getProgressForCard(cardId);
    const { progress } = applyReviewOutcome(existing, cardId, outcome);
    await saveCardProgress(progress);
  };

  return (
    <div className="min-h-screen flex flex-col items-center">
      <div className="w-full max-w-md min-h-screen pb-28 px-4 pt-4 space-y-4">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-extrabold text-slate-900">
              Khu Trò Chơi Ôn Bài
            </h1>
            <p className="text-xs font-bold text-slate-500">
              Chơi vui mà vẫn tích sao & cập nhật lịch ôn SRS
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center">
            <Gamepad2 className="w-6 h-6" />
          </div>
        </header>

        {resultStars !== null ? (
          <div className="rounded-3xl bg-white border-2 border-amber-200 p-6 text-center space-y-4 animate-pop-in">
            <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-500 flex items-center justify-center mx-auto">
              <Award className="w-10 h-10" />
            </div>
            <h2 className="font-display text-xl font-extrabold text-slate-900">
              Chơi xuất sắc! +{resultStars} ⭐
            </h2>
            <button
              type="button"
              onClick={() => {
                setResultStars(null);
                setActiveMode(null);
              }}
              className="btn-chunky w-full rounded-2xl bg-emerald-500 text-white py-3 font-extrabold text-sm shadow-[0_4px_0_#059669]"
            >
              Chọn trò chơi khác
            </button>
          </div>
        ) : activeMode ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-violet-700">
                {GAME_MODES.find((m) => m.id === activeMode)?.title}
              </span>
              <button
                type="button"
                onClick={() => setActiveMode(null)}
                className="text-xs font-bold text-slate-500 hover:underline"
              >
                ← Đổi trò khác
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
                setResultStars(starsEarned);
                setActiveMode(null);
              }}
            />
          </div>
        ) : (
          <>
            {/* Unit filter */}
            <div className="rounded-2xl bg-white border-2 border-amber-100 p-3 space-y-2">
              <p className="text-xs font-extrabold text-slate-600">
                Chọn chặng từ vựng để chơi:
              </p>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedUnitId("all")}
                  className={`rounded-xl px-3 py-1.5 text-xs font-extrabold ${
                    selectedUnitId === "all"
                      ? "bg-emerald-500 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  Tất cả chặng
                </button>
                {curriculum.units.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => setSelectedUnitId(u.id)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-extrabold ${
                      selectedUnitId === u.id
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {u.emoji} {u.title.split(":")[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* 4 Mini-game cards */}
            <div className="grid grid-cols-1 gap-3">
              {GAME_MODES.map((mode) => {
                const Icon = mode.icon;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => startGameMode(mode.id)}
                    className={`rounded-3xl border-2 p-4 text-left flex items-center gap-3.5 active:scale-[0.99] transition ${mode.color}`}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-xs shrink-0">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="inline-block rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-extrabold mb-0.5">
                        {mode.badge}
                      </span>
                      <h2 className="font-display text-lg font-extrabold leading-tight">
                        {mode.title}
                      </h2>
                      <p className="text-xs font-semibold opacity-80">
                        {mode.desc}
                      </p>
                    </div>
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
