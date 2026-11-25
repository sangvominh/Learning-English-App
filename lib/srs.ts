import {
  createEmptyCard,
  fsrs,
  Rating,
  State,
  type Card,
  type Grade,
} from "ts-fsrs";
import type {
  ImplicitOutcome,
  LearnerCardProgress,
  LearningCard,
  SerializedFSRSCard,
} from "./types";

const scheduler = fsrs({
  request_retention: 0.9,
  enable_short_term: false,
  enable_fuzz: false,
});

export function serializeCard(card: Card): SerializedFSRSCard {
  return {
    due: card.due instanceof Date ? card.due.toISOString() : String(card.due),
    stability: card.stability,
    difficulty: card.difficulty,
    elapsed_days: 0,
    scheduled_days: card.scheduled_days,
    learning_steps: card.learning_steps,
    reps: card.reps,
    lapses: card.lapses,
    state: Number(card.state),
    last_review: card.last_review
      ? card.last_review instanceof Date
        ? card.last_review.toISOString()
        : String(card.last_review)
      : undefined,
  };
}

export function deserializeCard(serialized: SerializedFSRSCard): Card {
  return {
    due: new Date(serialized.due),
    stability: serialized.stability,
    difficulty: serialized.difficulty,
    scheduled_days: serialized.scheduled_days,
    learning_steps: serialized.learning_steps ?? 0,
    reps: serialized.reps,
    lapses: serialized.lapses,
    state: serialized.state as State,
    last_review: serialized.last_review
      ? new Date(serialized.last_review)
      : undefined,
  };
}

export function createInitialProgress(
  cardId: string,
  now = new Date()
): LearnerCardProgress {
  const empty = createEmptyCard(now);
  return {
    cardId,
    fsrs: serializeCard(empty),
    attempts: 0,
    correctCount: 0,
    updatedAt: now.toISOString(),
  };
}

export function mapOutcomeToRating(outcome: ImplicitOutcome): Grade {
  if (outcome.kind === "speaking") {
    const score = outcome.speakingScore ?? 75;
    if (score >= 90) return Rating.Easy;
    if (score >= 70) return Rating.Good;
    if (score >= 50) return Rating.Hard;
    return Rating.Again;
  }

  const attempts = outcome.attempts ?? 1;
  if (attempts === 1 && !outcome.usedHint) return Rating.Easy;
  if (attempts === 1) return Rating.Good;
  if (attempts === 2) return Rating.Hard;
  return Rating.Again;
}

export function formatIntervalVi(dueIso: string, now = new Date()): string {
  const due = new Date(dueIso).getTime();
  const diffMs = due - now.getTime();
  if (diffMs <= 60 * 60 * 1000) return "Ôn lại ngay hôm nay";
  const days = Math.max(1, Math.round(diffMs / (24 * 60 * 60 * 1000)));
  if (days === 1) return "Sau 1 ngày";
  return `Sau ${days} ngày`;
}

export function applyReviewOutcome(
  existing: LearnerCardProgress | undefined,
  cardId: string,
  outcome: ImplicitOutcome,
  now = new Date()
): { progress: LearnerCardProgress; nextIntervalLabelVi: string } {
  const base = existing ?? createInitialProgress(cardId, now);
  const currentCard = deserializeCard(base.fsrs);
  const grade = mapOutcomeToRating(outcome);
  const nextResult = scheduler.next(currentCard, now, grade);

  const passed =
    outcome.kind === "speaking"
      ? (outcome.speakingScore ?? 0) >= 65
      : (outcome.attempts ?? 1) <= 2;

  const updated: LearnerCardProgress = {
    cardId,
    fsrs: serializeCard(nextResult.card),
    attempts: base.attempts + 1,
    correctCount: base.correctCount + (passed ? 1 : 0),
    lastSpeakingScore:
      outcome.kind === "speaking"
        ? outcome.speakingScore ?? base.lastSpeakingScore
        : base.lastSpeakingScore,
    lastMistakeNoteVi: outcome.mistakeNoteVi ?? base.lastMistakeNoteVi,
    updatedAt: now.toISOString(),
  };

  return {
    progress: updated,
    nextIntervalLabelVi: formatIntervalVi(updated.fsrs.due, now),
  };
}

export function isCardDue(
  progress: LearnerCardProgress | undefined,
  now = new Date()
): boolean {
  if (!progress || progress.attempts === 0) return false;
  return new Date(progress.fsrs.due).getTime() <= now.getTime();
}

export function getDueCards(
  allCards: LearningCard[],
  progressMap: Record<string, LearnerCardProgress>,
  now = new Date(),
  limit = 12
): LearningCard[] {
  const duePairs = allCards
    .map((card) => ({ card, progress: progressMap[card.id] }))
    .filter(({ progress }) => isCardDue(progress, now));

  duePairs.sort((a, b) => {
    const dueA = new Date(a.progress!.fsrs.due).getTime();
    const dueB = new Date(b.progress!.fsrs.due).getTime();
    return dueA - dueB;
  });

  return duePairs.slice(0, limit).map((p) => p.card);
}

export function computeMasteryLevel(
  progress: LearnerCardProgress | undefined
): "new" | "learning" | "review" | "mastered" {
  if (!progress || progress.attempts === 0) return "new";
  if (
    progress.fsrs.state === Number(State.Review) &&
    progress.fsrs.stability >= 6 &&
    (progress.lastSpeakingScore === undefined || progress.lastSpeakingScore >= 80)
  ) {
    return "mastered";
  }
  if (progress.fsrs.state === Number(State.Review)) {
    return "review";
  }
  return "learning";
}
