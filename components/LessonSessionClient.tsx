"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, Volume2 } from "lucide-react";
import { playCardAudio, playSfx } from "@/lib/audio-player";
import { fetchActiveCurriculum } from "@/lib/client-curriculum";
import {
  getAllProgress,
  getProgressForCard,
  recordStudySession,
  saveCardProgress,
} from "@/lib/learner-db";
import {
  findLessonById,
  flattenCards,
  SEED_CURRICULUM,
} from "@/lib/seed-curriculum";
import { applyReviewOutcome } from "@/lib/srs";
import type {
  CurriculumData,
  ImplicitOutcome,
  Lesson,
  Unit,
} from "@/lib/types";
import { MiniGameArena } from "./MiniGameArena";
import { PronunciationCoach } from "./PronunciationCoach";

interface LessonSummaryItem {
  cardId: string;
  text: string;
  nextReviewVi: string;
}

export function LessonSessionClient({ lessonId }: { lessonId: string }) {
  const [curriculum, setCurriculum] = useState<CurriculumData>(SEED_CURRICULUM);
  const [loading, setLoading] = useState(true);
  const [stage, setStage] = useState<"learn" | "game" | "done">("learn");
  const [cardIndex, setCardIndex] = useState(0);
  const [summaryRows, setSummaryRows] = useState<LessonSummaryItem[]>([]);

  useEffect(() => {
    let active = true;
    fetchActiveCurriculum().then(({ curriculum: curr }) => {
      if (!active) return;
      setCurriculum(curr);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const found = useMemo<{ unit: Unit; lesson: Lesson } | null>(
    () => findLessonById(curriculum, lessonId),
    [curriculum, lessonId]
  );

  const allCards = useMemo(
    () => flattenCards(curriculum).map((x) => x.card),
    [curriculum]
  );

  const currentCard = found?.lesson.cards[cardIndex];

  useEffect(() => {
    if (stage === "learn" && currentCard) {
      const t = window.setTimeout(() => {
        void playCardAudio(currentCard, "normal");
      }, 250);
      return () => window.clearTimeout(t);
    }
  }, [stage, currentCard]);

  const recordOutcome = async (cardId: string, outcome: ImplicitOutcome) => {
    const existing = await getProgressForCard(cardId);
    const { progress } = applyReviewOutcome(existing, cardId, outcome);
    await saveCardProgress(progress);
  };

  const handleFinishAll = async (gameStars: number) => {
    if (!found) return;
    const progressMap = await getAllProgress();
    const rows: LessonSummaryItem[] = found.lesson.cards.map((c) => {
      const p = progressMap[c.id];
      let nextReviewVi = "Sau 1 ngày";
      if (p) {
        const diffDays = Math.max(
          1,
          Math.round(
            (new Date(p.fsrs.due).getTime() - Date.now()) /
              (24 * 60 * 60 * 1000)
          )
        );
        nextReviewVi = diffDays <= 1 ? "Sau 1 ngày" : `Sau ${diffDays} ngày`;
      }
      return { cardId: c.id, text: c.text, nextReviewVi };
    });

    setSummaryRows(rows);
    await recordStudySession({
      starsEarned: gameStars,
      lessonId: found.lesson.id,
      kind: "lesson",
      cardsCount: found.lesson.cards.length,
    });
    setStage("done");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="rounded-2xl bg-white p-6 text-center border border-slate-200">
          <p className="font-bold text-slate-600 text-sm">Đang tải bài học...</p>
        </div>
      </div>
    );
  }

  if (!found || found.lesson.cards.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-4">
        <h1 className="font-display text-lg font-extrabold text-slate-900">
          Không tìm thấy bài học này
        </h1>
        <Link
          href="/"
          className="rounded-xl bg-emerald-600 text-white px-5 py-2.5 font-bold text-sm"
        >
          Về danh sách bài
        </Link>
      </div>
    );
  }

  const { lesson } = found;
  const totalCards = lesson.cards.length;

  return (
    <div className="min-h-screen flex flex-col items-center bg-[#FFFBF2]">
      <div className="w-full max-w-md min-h-screen px-4 pt-4 pb-8 space-y-4">
        {/* Header */}
        <header className="flex items-center justify-between gap-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1 rounded-xl bg-white border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            Bài học
          </Link>
          <h1 className="font-display text-sm font-extrabold text-slate-900 truncate">
            {lesson.title}
          </h1>
          <span className="w-12 shrink-0" />
        </header>

        {/* Stage Indicator */}
        <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-bold">
          <div
            className={`rounded-xl py-1.5 ${
              stage === "learn"
                ? "bg-emerald-600 text-white"
                : "bg-emerald-100 text-emerald-800"
            }`}
          >
            1. Học & Đọc
          </div>
          <div
            className={`rounded-xl py-1.5 ${
              stage === "game"
                ? "bg-sky-600 text-white"
                : stage === "done"
                ? "bg-emerald-100 text-emerald-800"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            2. Luyện tập
          </div>
          <div
            className={`rounded-xl py-1.5 ${
              stage === "done"
                ? "bg-emerald-600 text-white"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            3. Hoàn thành
          </div>
        </div>

        {/* STAGE 1: FLASHCARD & PRONUNCIATION */}
        {stage === "learn" && currentCard && (
          <div className="space-y-3.5 animate-pop-in">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-1">
              <span>
                Thẻ {cardIndex + 1} / {totalCards}
              </span>
              <span className="rounded-lg bg-white border border-slate-200 px-2.5 py-0.5 text-slate-700">
                {currentCard.type === "phonics"
                  ? "Phonics"
                  : currentCard.type === "sentence"
                  ? "Câu ngắn"
                  : "Từ vựng"}
              </span>
            </div>

            <div className="rounded-2xl bg-white border border-slate-200 p-4 flex flex-col items-center text-center space-y-2.5">
              <button
                type="button"
                onClick={() => void playCardAudio(currentCard, "normal")}
                className="relative rounded-2xl bg-amber-50/60 p-2.5 active:scale-95 transition"
                title="Chạm để nghe"
              >
                <img
                  src={currentCard.imageUrl}
                  alt={currentCard.meaningVi}
                  className="w-32 h-32 object-contain"
                />
                <span className="absolute bottom-1.5 right-1.5 w-7 h-7 rounded-full bg-sky-600 text-white flex items-center justify-center">
                  <Volume2 className="w-3.5 h-3.5" />
                </span>
              </button>

              <div className="space-y-1">
                <h2 className="font-display text-3xl font-extrabold text-slate-900 tracking-wide">
                  {currentCard.text}
                </h2>
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  {currentCard.ipa && (
                    <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                      {currentCard.ipa}
                    </span>
                  )}
                  {currentCard.phonicsBreakdown && (
                    <span className="rounded-lg bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-xs font-bold text-emerald-800">
                      {currentCard.phonicsBreakdown}
                    </span>
                  )}
                </div>
                <p className="text-sm font-bold text-emerald-800 pt-0.5">
                  {currentCard.meaningVi}
                </p>
              </div>
            </div>

            <PronunciationCoach
              key={currentCard.id}
              card={currentCard}
              onEvaluated={(fb) => {
                void recordOutcome(currentCard.id, {
                  kind: "speaking",
                  speakingScore: fb.score,
                  mistakeNoteVi: fb.stars < 3 ? fb.correctionVi : undefined,
                });
              }}
            />

            <div className="flex items-center gap-2.5 pt-1">
              {cardIndex > 0 && (
                <button
                  type="button"
                  onClick={() => setCardIndex((i) => i - 1)}
                  className="rounded-xl bg-white border border-slate-200 px-4 py-3 font-bold text-sm text-slate-700"
                >
                  ← Thẻ trước
                </button>
              )}
              <button
                type="button"
                onClick={async () => {
                  playSfx("tap");
                  const existing = await getProgressForCard(currentCard.id);
                  if (!existing) {
                    await recordOutcome(currentCard.id, {
                      kind: "game",
                      attempts: 2,
                    });
                  }
                  if (cardIndex + 1 < totalCards) {
                    setCardIndex((i) => i + 1);
                  } else {
                    setStage("game");
                  }
                }}
                className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 font-extrabold text-sm flex items-center justify-center gap-2"
              >
                {cardIndex + 1 < totalCards ? (
                  <>
                    Thẻ tiếp theo <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Vào luyện tập <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STAGE 2: MINI-GAMES */}
        {stage === "game" && (
          <MiniGameArena
            cards={lesson.cards}
            distractorPool={allCards}
            onCardResult={(cid, outcome) => recordOutcome(cid, outcome)}
            onComplete={({ starsEarned }) => {
              void handleFinishAll(starsEarned);
            }}
          />
        )}

        {/* STAGE 3: COMPLETION + SRS SCHEDULE */}
        {stage === "done" && (
          <div className="rounded-2xl bg-white border border-slate-200 p-5 space-y-4 animate-pop-in">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-7 h-7 text-emerald-600 shrink-0" />
              <div>
                <h2 className="font-display text-lg font-extrabold text-slate-900">
                  Hoàn thành bài học
                </h2>
                <p className="text-xs font-semibold text-slate-500">
                  Lịch ôn tập SRS đã tự động cập nhật theo kết quả của bé
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 space-y-1.5">
              {summaryRows.map((row) => (
                <div
                  key={row.cardId}
                  className="flex items-center justify-between text-xs bg-white rounded-lg px-3 py-2 border border-slate-100"
                >
                  <span className="font-extrabold text-slate-800">
                    {row.text}
                  </span>
                  <span className="font-bold text-emerald-700">
                    {row.nextReviewVi}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  setStage("learn");
                  setCardIndex(0);
                }}
                className="flex-1 rounded-xl bg-slate-100 text-slate-700 py-3 font-bold text-sm"
              >
                Học lại
              </button>
              <Link
                href="/"
                className="flex-1 rounded-xl bg-emerald-600 text-white py-3 font-bold text-sm flex items-center justify-center"
              >
                Về danh sách bài
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
