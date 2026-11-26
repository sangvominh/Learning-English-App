"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, Volume2 } from "lucide-react";
import { playCardAudio, playSfx, playText } from "@/lib/audio-player";
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

  const breakdownParts = useMemo(() => {
    if (!currentCard?.phonicsBreakdown) return [];
    return currentCard.phonicsBreakdown
      .split(/\s*[|\-]\s*/)
      .map((s) => s.trim())
      .filter(Boolean);
  }, [currentCard]);

  useEffect(() => {
    if (stage === "learn" && currentCard) {
      const t = window.setTimeout(() => {
        void playCardAudio(currentCard, "normal");
      }, 220);
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

  const ensureCurrentCardTracked = async () => {
    if (!currentCard) return;
    const existing = await getProgressForCard(currentCard.id);
    if (!existing) {
      await recordOutcome(currentCard.id, { kind: "game", attempts: 2 });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-[#F8F7F4]">
      <div
        className={`w-full max-w-md min-h-screen px-4 pt-3 space-y-3.5 ${
          stage === "learn" ? "pb-24" : "pb-8"
        }`}
      >
        {/* Compact Top Header */}
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
          {stage === "learn" ? (
            <button
              type="button"
              onClick={async () => {
                await ensureCurrentCardTracked();
                setStage("game");
              }}
              className="rounded-xl bg-white border border-slate-200 px-2.5 py-1.5 text-xs font-bold text-sky-700 hover:bg-sky-50 shrink-0"
            >
              Luyện tập
            </button>
          ) : (
            <span className="w-14 shrink-0" />
          )}
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
            1. Học &amp; Đọc
          </div>
          <div
            className={`rounded-xl py-1.5 ${
              stage === "game"
                ? "bg-sky-600 text-white"
                : stage === "done"
                ? "bg-emerald-100 text-emerald-800"
                : "bg-slate-200/70 text-slate-500"
            }`}
          >
            2. Luyện tập
          </div>
          <div
            className={`rounded-xl py-1.5 ${
              stage === "done"
                ? "bg-emerald-600 text-white"
                : "bg-slate-200/70 text-slate-500"
            }`}
          >
            3. Hoàn thành
          </div>
        </div>

        {/* STAGE 1: FLASHCARD & PRONUNCIATION */}
        {stage === "learn" && currentCard && (
          <div className="space-y-3 animate-pop-in">
            {/* Tappable Card Step Bar */}
            <div className="flex items-center gap-1.5">
              {lesson.cards.map((c, idx) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCardIndex(idx)}
                  aria-label={`Chuyển đến thẻ ${idx + 1}: ${c.text}`}
                  className={`h-2 flex-1 rounded-full transition-all ${
                    idx === cardIndex
                      ? "bg-emerald-600"
                      : idx < cardIndex
                      ? "bg-emerald-300"
                      : "bg-slate-200"
                  }`}
                />
              ))}
              <span className="text-[11px] font-bold text-slate-500 pl-1 shrink-0">
                {cardIndex + 1}/{totalCards}
              </span>
            </div>

            {/* Main Knowledge Card */}
            <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="rounded-lg bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-700">
                  {currentCard.type === "phonics"
                    ? "Phonics"
                    : currentCard.type === "sentence"
                    ? "Câu ngắn"
                    : "Từ vựng"}
                </span>
                {currentCard.ipa && (
                  <span className="rounded-lg bg-slate-50 border border-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-600">
                    {currentCard.ipa}
                  </span>
                )}
              </div>

              <div className="flex flex-col items-center text-center space-y-2">
                <button
                  type="button"
                  onClick={() => void playCardAudio(currentCard, "normal")}
                  className="relative rounded-2xl bg-slate-50 border border-slate-100 p-2 active:scale-95 transition"
                  title="Chạm để nghe"
                >
                  <img
                    src={currentCard.imageUrl}
                    alt={currentCard.meaningVi}
                    className="w-28 h-28 object-contain"
                  />
                  <span className="absolute bottom-1.5 right-1.5 w-7 h-7 rounded-full bg-sky-600 text-white flex items-center justify-center shadow-xs">
                    <Volume2 className="w-3.5 h-3.5" />
                  </span>
                </button>

                <h2 className="font-display text-3xl font-extrabold text-slate-900 tracking-wide">
                  {currentCard.text}
                </h2>

                <p className="text-sm font-extrabold text-emerald-800">
                  {currentCard.meaningVi}
                </p>

                {/* Tappable phonics breakdown chips */}
                {breakdownParts.length > 0 && (
                  <div className="flex flex-wrap items-center justify-center gap-1.5 pt-0.5">
                    {breakdownParts.map((part, idx) => (
                      <button
                        key={`${part}-${idx}`}
                        type="button"
                        onClick={() => {
                          if (currentCard.type === "sentence") {
                            void playText(part, "slow");
                          } else {
                            void playCardAudio(currentCard, "slow");
                          }
                        }}
                        className="rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold text-emerald-900"
                      >
                        {part}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Mouth / Pronunciation Guide visible BEFORE recording */}
              {currentCard.pronunciationTipVi && (
                <div className="rounded-xl bg-amber-50 border border-amber-200 px-3 py-2.5 text-xs text-amber-950 leading-relaxed">
                  <span className="font-extrabold">Cách đọc chuẩn: </span>
                  <span className="font-semibold">
                    {currentCard.pronunciationTipVi}
                  </span>
                </div>
              )}

              {/* Example sentence with 1-tap audio */}
              {currentCard.exampleEn && (
                <div className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 flex items-center justify-between gap-2.5">
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold text-slate-800">
                      Ví dụ: {currentCard.exampleEn}
                    </p>
                    {currentCard.exampleVi && (
                      <p className="text-[11px] font-semibold text-slate-500 mt-0.5">
                        {currentCard.exampleVi}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => void playText(currentCard.exampleEn!, "normal")}
                    aria-label="Nghe câu ví dụ"
                    className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-sky-700 flex items-center justify-center shrink-0 hover:bg-sky-50"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Pronunciation Coach */}
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

      {/* Sticky Bottom Thumb Navigation Bar during Learn stage */}
      {stage === "learn" && currentCard && (
        <div className="fixed bottom-0 left-0 right-0 z-30 flex justify-center pointer-events-none">
          <div className="w-full max-w-md bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2.5 pb-safe pointer-events-auto flex items-center gap-2.5">
            <button
              type="button"
              disabled={cardIndex === 0}
              onClick={() => setCardIndex((i) => Math.max(0, i - 1))}
              className="rounded-xl bg-slate-100 disabled:opacity-40 px-4 py-3 font-bold text-xs text-slate-700 shrink-0"
            >
              ← Trước
            </button>
            <button
              type="button"
              onClick={async () => {
                playSfx("tap");
                await ensureCurrentCardTracked();
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
    </div>
  );
}
