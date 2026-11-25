"use client";

import { getLocalCurriculumOverride } from "./learner-db";
import { SEED_CURRICULUM } from "./seed-curriculum";
import type { CurriculumData, StorageMode } from "./types";

export async function fetchActiveCurriculum(): Promise<{
  curriculum: CurriculumData;
  source: StorageMode | "browser-local";
}> {
  let serverCurriculum: CurriculumData = SEED_CURRICULUM;
  let source: StorageMode | "browser-local" = "local-file";

  try {
    const res = await fetch("/api/curriculum", { cache: "no-store" });
    if (res.ok) {
      const json = (await res.json()) as {
        curriculum?: CurriculumData;
        source?: StorageMode;
      };
      if (json.curriculum) {
        serverCurriculum = json.curriculum;
        source = json.source ?? "local-file";
      }
    }
  } catch {
    // Offline fallback handled below
  }

  try {
    const localOverride = await getLocalCurriculumOverride();
    if (localOverride && localOverride.units?.length > 0) {
      const localTime = Date.parse(localOverride.updatedAt || "") || 0;
      const serverTime = Date.parse(serverCurriculum.updatedAt || "") || 0;
      if (localTime >= serverTime) {
        return { curriculum: localOverride, source: "browser-local" };
      }
    }
  } catch {
    // Ignore local override read error
  }

  return { curriculum: serverCurriculum, source };
}
