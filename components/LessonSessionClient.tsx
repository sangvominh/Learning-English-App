"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  CheckCircle2,
  Gamepad2,
  Sparkles,
  Volume2,
} from "lucide-react";
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
  const [sessionStars, setSessionStars] = useState(0);
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
    const totalStars = sessionStars + gameStars + 3; // +3 bonus stars for finishing lesson
    setSessionStars(totalStars);

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
      starsEarned: totalStars,
      lessonId: found.lesson.id,
      kind: "lesson",
      cardsCount: found.lesson.cards.length,
    });
    setStage("done");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="rounded-3xl bg-white p-6 text-center shadow-sm border-2 border-amber-100">
          <p className="text-3xl mb-2">🐝</p>
          <p className="font-bold text-slate-600">Đang chuẩn bị bài học...</p>
        </div>
      </div>
    );
  }

  if (!found || found.lesson.cards.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-4">
        <p className="text-4xl">🔍</p>
        <h1 className="font-display text-xl font-extrabold text-slate-900">
          Chưa tìm thấy bài học này
        </h1>
        <Link
          href="/"
          className="rounded-2xl bg-emerald-500 text-white px-5 py-3 font-extrabold text-sm"
        >
          Về trang chủ
        </Link>
      </div>
    );
  }

  const { unit, lesson } = found;
  const totalCards = lesson.cards.length;

  return (
    <div className="min-h-screen flex flex-col items-center bg-[#FFFBF2]">
      <div className="w-full max-w-md min-h-screen px-4 pt-4 pb-8 space-y-4">
        {/* Header */}
        <header className="flex items-center justify-between gap-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1 rounded-2xl bg-white border border-slate-200 px-3 py-2 text-xs font-extrabold text-slate-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Trang chủ
          </Link>
          <div className="text-center min-w-0">
            <p className="text-[11px] font-extrabold text-emerald-700 truncate">
              {unit.title}
            </p>
            <h1 className="font-display text-base font-extrabold text-slate-900 truncate">
              {lesson.title}
            </h1>
          </div>
          <div className="rounded-full bg-amber-100 text-amber-900 px-3 py-1.5 text-xs font-extrabold shrink-0">
            ⭐ +{sessionStars}
          </div>
        </header>

        {/* Stage Indicator */}
        <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-extrabold">
          <div
            className={`rounded-xl py-1.5 ${
              stage === "learn"
                ? "bg-emerald-500 text-white"
                : "bg-emerald-100 text-emerald-800"
            }`}
          >
            1. Học & Nói
          </div>
          <div
            className={`rounded-xl py-1.5 ${
              stage === "game"
                ? "bg-sky-500 text-white"
                : stage === "done"
                ? "bg-emerald-100 text-emerald-800"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            2. Chơi ôn bài
          </div>
          <div
            className={`rounded-xl py-1.5 ${
              stage === "done"
                ? "bg-amber-400 text-amber-950"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            3. Nhận sao
          </div>
        </div>

        {/* STAGE 1: FLASHCARD & PRONUNCIATION */}
        {stage === "learn" && currentCard && (
          <div className="space-y-4 animate-pop-in">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-1">
              <span>
                Thẻ {cardIndex + 1} / {totalCards}
              </span>
              <span className="rounded-full bg-white border border-amber-200 px-2.5 py-0.5 text-amber-900 font-extrabold">
                {currentCard.type === "phonics"
                  ? "🔤 Âm Phonics"
                  : currentCard.type === "sentence"
                  ? "💬 Câu ngắn"
                  : "📖 Từ vựng"}
              </span>
            </div>

            {/* Card hero */}
            <div className="rounded-3xl bg-white border-2 border-emerald-100 p-5 shadow-sm flex flex-col items-center text-center space-y-3">
              <button
                type="button"
                onClick={() => void playCardAudio(currentCard, "normal")}
                className="group relative rounded-3xl bg-amber-50/70 p-3 active:scale-95 transition"
                title="Chạm vào hình để nghe"
              >
                <img
                  src={currentCard.imageUrl}
                  alt={currentCard.meaningVi}
                  className="w-36 h-36 object-contain"
                />
                <span className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-sky-500 text-white flex items-center justify-center shadow">
                  <Volume2 className="w-4 h-4" />
                </span>
              </button>

              <div className="space-y-1">
                <h2 className="font-display text-4xl font-extrabold text-slate-900 tracking-wide">
                  {currentCard.text}
                </h2>
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  {currentCard.ipa && (
                    <span className="rounded-xl bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600">
                      {currentCard.ipa}
                    </span>
                  )}
                  {currentCard.phonicsBreakdown && (
                    <span className="rounded-xl bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-extrabold text-emerald-800">
                      {currentCard.phonicsBreakdown}
                    </span>
                  )}
                </div>
                <p className="text-base font-extrabold text-emerald-700 pt-1">
                  {currentCard.meaningVi}
                </p>
              </div>
            </div>

            {/* Pronunciation Coach */}
            <PronunciationCoach
              key={currentCard.id}
              card={currentCard}
              onEvaluated={(fb) => {
                setSessionStars((s) => s + fb.stars);
                void recordOutcome(currentCard.id, {
                  kind: "speaking",
                  speakingScore: fb.score,
                  mistakeNoteVi: fb.stars < 3 ? fb.correctionVi : undefined,
                });
              }}
            />

            {/* Navigation */}
            <div className="flex items-center gap-3 pt-1">
              {cardIndex > 0 && (
                <button
                  type="button"
                  onClick={() => setCardIndex((i) => i - 1)}
                  className="rounded-2xl bg-white border-2 border-slate-200 px-4 py-3 font-extrabold text-sm text-slate-700"
                >
                  ← Thẻ trước
                </button>
              )}
              <button
                type="button"
                onClick={async () => {
                  playSfx("tap");
                  // Ensure card is initialized in SRS even if child only listened
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
                className="btn-chunky flex-1 rounded-2xl bg-amber-400 hover:bg-amber-500 text-amber-950 py-3.5 px-5 font-extrabold text-base flex items-center justify-center gap-2 shadow-[0_4px_0_#D97706]"
              >
                {cardIndex + 1 < totalCards ? (
                  <>
                    Thẻ tiếp theo <ArrowRight className="w-5 h-5" />
                  </>
                ) : (
                  <>
                    <Gamepad2 className="w-5 h-5" /> Vào trò chơi ôn bài!
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

        {/* STAGE 3: CELEBRATION + SRS SCHEDULE */}
        {stage === "done" && (
          <div className="rounded-3xl bg-white border-2 border-amber-200 p-5 shadow-sm text-center space-y-4 animate-pop-in">
            <div className="w-20 h-20 rounded-3xl bg-amber-100 text-amber-500 flex items-center justify-center mx-auto">
              <Award className="w-12 h-12" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-extrabold text-slate-900">
                Hoan hô! Hoàn thành bài học! 🎉
              </h2>
              <p className="text-sm font-bold text-emerald-700 mt-1">
                Con vừa nhận được +{sessionStars} ngôi sao ⭐
              </p>
            </div>

            <div className="rounded-2xl bg-amber-50/70 border border-amber-100 p-3.5 text-left space-y-2">
              <p className="text-xs font-extrabold text-amber-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                Lịch ôn tập khoa học (SRS) đã tự xếp cho con:
              </p>
              <div className="space-y-1.5">
                {summaryRows.map((row) => (
                  <div
                    key={row.cardId}
                    className="flex items-center justify-between text-xs bg-white rounded-xl px-3 py-2 border border-amber-100"
                  >
                    <span className="font-extrabold text-slate-800 inline-flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      {row.text}
                    </span>
                    <span className="font-bold text-emerald-700">
                      {row.nextReviewVi}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setStage("learn");
                  setCardIndex(0);
                }}
                className="flex-1 rounded-2xl bg-slate-100 text-slate-700 py-3 font-extrabold text-sm"
              >
                Học lại bài này
              </button>
              <Link
                href="/"
                className="btn-chunky flex-1 rounded-2xl bg-emerald-500 text-white py-3 font-extrabold text-sm shadow-[0_4px_0_#059669] flex items-center justify-center"
              >
                Về trang chủ
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
