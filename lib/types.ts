export type CardType = "phonics" | "word" | "sentence";

export type LessonTrack =
  | "daily_talk"
  | "vocab_use"
  | "mixed"
  | "phonics"
  | "vocab_sentence";

export type UnitColor = "emerald" | "sky" | "amber" | "rose";

export interface LearningCard {
  id: string;
  type: CardType;
  text: string;
  spokenText?: string;
  meaningVi: string;
  ipa?: string;
  phonicsBreakdown?: string;
  imageUrl: string;
  audioNormalUrl?: string;
  audioSlowUrl?: string;
  pronunciationTipVi: string;
  focusPhonemes?: string[];
  exampleEn?: string;
  exampleVi?: string;
}

export interface Lesson {
  id: string;
  title: string;
  subtitleVi: string;
  track: LessonTrack;
  emoji: string;
  cards: LearningCard[];
}

export interface Unit {
  id: string;
  title: string;
  descriptionVi: string;
  color: UnitColor;
  emoji: string;
  lessons: Lesson[];
}

export interface CurriculumData {
  version: number;
  updatedAt: string;
  units: Unit[];
}

export interface PronunciationSegment {
  text: string;
  status: "good" | "almost" | "fix";
}

export interface PronunciationFeedback {
  score: number;
  stars: 1 | 2 | 3;
  heardText: string;
  praiseVi: string;
  correctionVi: string;
  mouthTipVi: string;
  segments: PronunciationSegment[];
}

export type StorageMode = "supabase" | "local-file" | "readonly-seed";

export interface SystemStatus {
  storageMode: StorageMode;
  hasGeminiKey: boolean;
  isUsingDefaultPin: boolean;
  hasSupabase: boolean;
}

export interface SerializedFSRSCard {
  due: string;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  learning_steps: number;
  reps: number;
  lapses: number;
  state: number;
  last_review?: string;
}

export interface LearnerCardProgress {
  cardId: string;
  fsrs: SerializedFSRSCard;
  attempts: number;
  correctCount: number;
  lastSpeakingScore?: number;
  lastMistakeNoteVi?: string;
  updatedAt: string;
}

export interface StudyActivityLog {
  id: string;
  lessonId?: string;
  dateIso: string;
  kind: "lesson" | "review" | "game";
  starsEarned: number;
  cardsCount: number;
}

export interface LearnerProfile {
  streakDays: number;
  lastStudyDate: string | null;
  totalStars: number;
  completedLessonIds: string[];
  recentLogs: StudyActivityLog[];
}

export interface ImplicitOutcome {
  kind: "speaking" | "game";
  speakingScore?: number;
  attempts?: number;
  usedHint?: boolean;
  mistakeNoteVi?: string;
}
