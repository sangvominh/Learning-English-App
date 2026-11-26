"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Volume2,
  X,
} from "lucide-react";
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
  const [tipOpen, setTipOpen] = useState(false);
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
      <div className="h-[100dvh] flex items-center justify-center p-6 bg-[#F8F7F4]">
        <div className="rounded-2xl bg-white p-6 text-center border border-slate-200">
          <p className="font-bold text-slate-600 text-sm">Đang tải bài học...</p>
        </div>
      </div>
    );
  }

  if (!found || found.lesson.cards.length === 0) {
    return (
      <div className="h-[100dvh] flex flex-col items-center justify-center p-6 text-center space-y-4 bg-[#F8F7F4]">
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

  const goNextCard = async () => {
    playSfx("tap");
    setTipOpen(false);
    await ensureCurrentCardTracked();
    if (cardIndex + 1 < totalCards) {
      setCardIndex((i) => i + 1);
    } else {
      setStage("game");
    }
  };

  return (
    <div className="h-[100dvh] w-full flex flex-col items-center bg-[#F8F7F4] overflow-hidden">
      <div className="w-full max-w-md h-full flex flex-col px-4 pt-2.5 pb-safe overflow-hidden">
        {/* Fixed Top Header */}
        <header className="shrink-0 space-y-2">
          <div className="flex items-center justify-between gap-2">
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
            ) : stage === "game" ? (
              <button
                type="button"
                onClick={() => setStage("learn")}
                className="rounded-xl bg-white border border-slate-200 px-2.5 py-1.5 text-xs font-bold text-slate-700 shrink-0"
              >
                Học thẻ
              </button>
            ) : (
              <span className="w-14 shrink-0" />
            )}
          </div>

          {stage === "learn" && (
            <div className="flex items-center gap-1">
              {lesson.cards.map((c, idx) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setTipOpen(false);
                    setCardIndex(idx);
                  }}
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
          )}
        </header>

        {/* STAGE 1: FIXED ZERO-SCROLL FLASHCARD */}
        {stage === "learn" && currentCard && (
          <>
            <main className="flex-1 min-h-0 flex flex-col justify-center py-2">
              <div className="rounded-2xl bg-white border border-slate-200 p-3.5 space-y-2.5 shadow-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-lg bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-700">
                    {currentCard.type === "sentence" ? "Mẫu câu" : "Từ vựng"}
                  </span>
                  {currentCard.pronunciationTipVi && (
                    <button
                      type="button"
                      onClick={() => setTipOpen(true)}
                      className="inline-flex items-center gap-1 rounded-lg bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[11px] font-bold text-amber-900"
                    >
                      <HelpCircle className="w-3 h-3" />
                      Mẹo đọc nhanh
                    </button>
                  )}
                </div>

                <div className="flex flex-col items-center text-center space-y-1.5">
                  <button
                    type="button"
                    onClick={() => void playCardAudio(currentCard, "normal")}
                    className="relative rounded-2xl bg-slate-50 border border-slate-100 p-2 active:scale-95 transition"
                    title="Chạm để nghe"
                  >
                    <img
                      src={currentCard.imageUrl}
                      alt={currentCard.meaningVi}
                      className="w-24 h-24 sm:w-28 sm:h-28 object-contain"
                    />
                    <span className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-sky-600 text-white flex items-center justify-center shadow-xs">
                      <Volume2 className="w-3 h-3" />
                    </span>
                  </button>

                  <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                    {currentCard.text}
                  </h2>

                  <p className="text-sm sm:text-base font-extrabold text-emerald-800">
                    {currentCard.meaningVi}
                  </p>
                </div>

                {currentCard.exampleEn && (
                  <div className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-extrabold text-slate-800 line-clamp-2 leading-snug">
                        {currentCard.exampleEn}
                      </p>
                      {currentCard.exampleVi && (
                        <p className="text-[11px] font-semibold text-slate-500 line-clamp-2 leading-snug">
                          {currentCard.exampleVi}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        void playText(currentCard.exampleEn!, "normal")
                      }
                      aria-label="Nghe câu ví dụ"
                      className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-sky-700 flex items-center justify-center shrink-0 hover:bg-sky-50"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </main>

            {/* Fixed Bottom Dock */}
            <footer className="shrink-0 space-y-2 pt-1">
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
                onNextCard={() => void goNextCard()}
                nextLabel={
                  cardIndex + 1 < totalCards ? "Thẻ tiếp theo" : "Vào luyện tập"
                }
              />

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={cardIndex === 0}
                  onClick={() => {
                    setTipOpen(false);
                    setCardIndex((i) => Math.max(0, i - 1));
                  }}
                  className="rounded-xl bg-white border border-slate-200 disabled:opacity-40 px-4 py-2.5 font-bold text-xs text-slate-700 shrink-0"
                >
                  ← Trước
                </button>
                <button
                  type="button"
                  onClick={() => void goNextCard()}
                  className="flex-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-white py-2.5 px-4 font-extrabold text-sm flex items-center justify-center gap-1.5"
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
            </footer>
          </>
        )}

        {/* STAGE 2: FIXED ZERO-SCROLL PRACTICE */}
        {stage === "game" && (
          <main className="flex-1 min-h-0 flex flex-col pt-2 overflow-hidden">
            <MiniGameArena
              cards={lesson.cards}
              distractorPool={allCards}
              onCardResult={(cid, outcome) => recordOutcome(cid, outcome)}
              onComplete={({ starsEarned }) => {
                void handleFinishAll(starsEarned);
              }}
            />
          </main>
        )}

        {/* STAGE 3: COMPLETION */}
        {stage === "done" && (
          <main className="flex-1 min-h-0 flex flex-col justify-center py-2 overflow-hidden">
            <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-3.5 animate-pop-in max-h-full flex flex-col">
              <div className="flex items-center gap-2.5 shrink-0">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                <div>
                  <h2 className="font-display text-base font-extrabold text-slate-900">
                    Hoàn thành bài học
                  </h2>
                  <p className="text-xs font-semibold text-slate-500">
                    Lịch ôn SRS đã cập nhật theo kết quả luyện tập
                  </p>
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 border border-slate-200 p-2.5 space-y-1.5 overflow-y-auto flex-1 min-h-0">
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

              <div className="flex gap-2.5 shrink-0">
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
          </main>
        )}
      </div>

      {/* Lightweight Speaking Tip Overlay */}
      {tipOpen && currentCard?.pronunciationTipVi && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/45 backdrop-blur-[1px] flex items-end justify-center"
          onClick={() => setTipOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-t-3xl bg-white p-5 pb-safe shadow-2xl space-y-3 animate-pop-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base font-extrabold text-slate-900">
                Mẹo nói: {currentCard.text}
              </h3>
              <button
                type="button"
                onClick={() => setTipOpen(false)}
                aria-label="Đóng"
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm font-semibold text-slate-700 leading-relaxed bg-amber-50 border border-amber-200 rounded-xl p-3">
              {currentCard.pronunciationTipVi}
            </p>
            <button
              type="button"
              onClick={() => setTipOpen(false)}
              className="w-full rounded-xl bg-slate-900 text-white py-2.5 text-xs font-extrabold"
            >
              Đã hiểu
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
