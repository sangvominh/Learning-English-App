"use client";

import type {
  CurriculumData,
  LearnerCardProgress,
  LearnerProfile,
  StudyActivityLog,
} from "./types";

const DB_NAME = "sunnybee-learner-db";
const DB_VERSION = 1;
const STORE_PROGRESS = "progress";
const STORE_META = "meta";
const KEY_PROFILE = "learner-profile";
const KEY_LOCAL_CURRICULUM = "local-curriculum-override";

const DEFAULT_PROFILE: LearnerProfile = {
  streakDays: 0,
  lastStudyDate: null,
  totalStars: 0,
  completedLessonIds: [],
  recentLogs: [],
};

function getTodayDateStr(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getYesterdayDateStr(): string {
  const dt = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const d = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function openLearnerDb(): Promise<IDBDatabase | null> {
  if (typeof window === "undefined" || !("indexedDB" in window)) {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_PROGRESS)) {
          db.createObjectStore(STORE_PROGRESS, { keyPath: "cardId" });
        }
        if (!db.objectStoreNames.contains(STORE_META)) {
          db.createObjectStore(STORE_META);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

// LocalStorage fallback helpers
function lsGet<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function lsSet(key: string, val: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(val));
  } catch {
    // Ignore storage quota errors
  }
}

export async function getAllProgress(): Promise<
  Record<string, LearnerCardProgress>
> {
  const db = await openLearnerDb();
  if (!db) {
    return lsGet<Record<string, LearnerCardProgress>>("sb_progress", {});
  }
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_PROGRESS, "readonly");
      const store = tx.objectStore(STORE_PROGRESS);
      const req = store.getAll();
      req.onsuccess = () => {
        const map: Record<string, LearnerCardProgress> = {};
        for (const item of (req.result as LearnerCardProgress[]) ?? []) {
          map[item.cardId] = item;
        }
        resolve(map);
      };
      req.onerror = () => resolve({});
    } catch {
      resolve({});
    }
  });
}

export async function getProgressForCard(
  cardId: string
): Promise<LearnerCardProgress | undefined> {
  const db = await openLearnerDb();
  if (!db) {
    const map = lsGet<Record<string, LearnerCardProgress>>("sb_progress", {});
    return map[cardId];
  }
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_PROGRESS, "readonly");
      const req = tx.objectStore(STORE_PROGRESS).get(cardId);
      req.onsuccess = () =>
        resolve(req.result as LearnerCardProgress | undefined);
      req.onerror = () => resolve(undefined);
    } catch {
      resolve(undefined);
    }
  });
}

export async function saveCardProgress(
  progress: LearnerCardProgress
): Promise<void> {
  const db = await openLearnerDb();
  if (!db) {
    const map = lsGet<Record<string, LearnerCardProgress>>("sb_progress", {});
    map[progress.cardId] = progress;
    lsSet("sb_progress", map);
    return;
  }
  await new Promise<void>((resolve) => {
    try {
      const tx = db.transaction(STORE_PROGRESS, "readwrite");
      tx.objectStore(STORE_PROGRESS).put(progress);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

async function getMeta<T>(key: string, fallback: T): Promise<T> {
  const db = await openLearnerDb();
  if (!db) return lsGet<T>(`sb_${key}`, fallback);
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_META, "readonly");
      const req = tx.objectStore(STORE_META).get(key);
      req.onsuccess = () =>
        resolve(req.result !== undefined ? (req.result as T) : fallback);
      req.onerror = () => resolve(fallback);
    } catch {
      resolve(fallback);
    }
  });
}

async function setMeta(key: string, value: unknown): Promise<void> {
  const db = await openLearnerDb();
  if (!db) {
    lsSet(`sb_${key}`, value);
    return;
  }
  await new Promise<void>((resolve) => {
    try {
      const tx = db.transaction(STORE_META, "readwrite");
      if (value === null || value === undefined) {
        tx.objectStore(STORE_META).delete(key);
      } else {
        tx.objectStore(STORE_META).put(value, key);
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

export async function getProfile(): Promise<LearnerProfile> {
  return getMeta<LearnerProfile>(KEY_PROFILE, DEFAULT_PROFILE);
}

export async function recordStudySession(input: {
  starsEarned: number;
  lessonId?: string;
  kind: StudyActivityLog["kind"];
  cardsCount: number;
}): Promise<LearnerProfile> {
  const profile = await getProfile();
  const today = getTodayDateStr();
  const yesterday = getYesterdayDateStr();

  let streakDays = profile.streakDays;
  if (profile.lastStudyDate === today) {
    streakDays = Math.max(1, streakDays);
  } else if (profile.lastStudyDate === yesterday) {
    streakDays = streakDays + 1;
  } else {
    streakDays = 1;
  }

  const completedSet = new Set(profile.completedLessonIds);
  if (input.lessonId) {
    completedSet.add(input.lessonId);
  }

  const newLog: StudyActivityLog = {
    id: `${Date.now()}`,
    lessonId: input.lessonId,
    dateIso: new Date().toISOString(),
    kind: input.kind,
    starsEarned: input.starsEarned,
    cardsCount: input.cardsCount,
  };

  const nextProfile: LearnerProfile = {
    streakDays,
    lastStudyDate: today,
    totalStars: profile.totalStars + input.starsEarned,
    completedLessonIds: Array.from(completedSet),
    recentLogs: [newLog, ...profile.recentLogs].slice(0, 30),
  };

  await setMeta(KEY_PROFILE, nextProfile);
  return nextProfile;
}

export async function resetAllLearnerData(): Promise<void> {
  const db = await openLearnerDb();
  if (!db) {
    window.localStorage.removeItem("sb_progress");
    window.localStorage.removeItem(`sb_${KEY_PROFILE}`);
    return;
  }
  await new Promise<void>((resolve) => {
    try {
      const tx = db.transaction([STORE_PROGRESS, STORE_META], "readwrite");
      tx.objectStore(STORE_PROGRESS).clear();
      tx.objectStore(STORE_META).delete(KEY_PROFILE);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

export async function exportLearnerSnapshot(): Promise<{
  exportedAt: string;
  profile: LearnerProfile;
  progress: Record<string, LearnerCardProgress>;
}> {
  const [profile, progress] = await Promise.all([
    getProfile(),
    getAllProgress(),
  ]);
  return {
    exportedAt: new Date().toISOString(),
    profile,
    progress,
  };
}

export async function getLocalCurriculumOverride(): Promise<CurriculumData | null> {
  return getMeta<CurriculumData | null>(KEY_LOCAL_CURRICULUM, null);
}

export async function saveLocalCurriculumOverride(
  data: CurriculumData
): Promise<void> {
  await setMeta(KEY_LOCAL_CURRICULUM, data);
}

export async function clearLocalCurriculumOverride(): Promise<void> {
  await setMeta(KEY_LOCAL_CURRICULUM, null);
}
