import fs from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { SEED_CURRICULUM } from "./seed-curriculum";
import type { CurriculumData, StorageMode } from "./types";

const LOCAL_DATA_PATH = path.join(process.cwd(), "data", "curriculum.json");
const LOCAL_UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");
const SUPABASE_BUCKET = "learning-media";
const SUPABASE_ROW_ID = "main";

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  const key = serviceKey || anonKey;
  if (!url || !key) return null;
  return { url, key };
}

export function hasSupabaseConfigured(): boolean {
  return getSupabaseConfig() !== null;
}

export function getStorageMode(): StorageMode {
  if (hasSupabaseConfigured()) return "supabase";
  if (process.env.VERCEL) return "readonly-seed";
  return "local-file";
}

export function isValidCurriculumData(data: unknown): data is CurriculumData {
  if (!data || typeof data !== "object") return false;
  const candidate = data as Partial<CurriculumData>;
  if (!Array.isArray(candidate.units)) return false;
  for (const unit of candidate.units) {
    if (!unit || typeof unit !== "object" || !Array.isArray(unit.lessons)) {
      return false;
    }
    for (const lesson of unit.lessons) {
      if (!lesson || typeof lesson !== "object" || !Array.isArray(lesson.cards)) {
        return false;
      }
    }
  }
  return true;
}

export async function loadCurriculum(): Promise<{
  curriculum: CurriculumData;
  source: StorageMode;
}> {
  const sb = getSupabaseConfig();
  if (sb) {
    try {
      const client = createClient(sb.url, sb.key, {
        auth: { persistSession: false },
      });
      const { data, error } = await client
        .from("curriculum_store")
        .select("payload")
        .eq("id", SUPABASE_ROW_ID)
        .maybeSingle();

      if (!error && data?.payload && isValidCurriculumData(data.payload)) {
        return { curriculum: data.payload, source: "supabase" };
      }
    } catch (err) {
      console.warn("Supabase loadCurriculum fallback to local/seed:", err);
    }
  }

  try {
    const raw = await fs.readFile(LOCAL_DATA_PATH, "utf-8");
    const parsed = JSON.parse(raw) as unknown;
    if (isValidCurriculumData(parsed)) {
      return { curriculum: parsed, source: "local-file" };
    }
  } catch {
    // Local file does not exist yet — use starter curriculum
  }

  return { curriculum: SEED_CURRICULUM, source: getStorageMode() };
}

export async function saveCurriculum(data: CurriculumData): Promise<{
  ok: boolean;
  persistedTo: StorageMode;
  warning?: string;
  curriculum: CurriculumData;
}> {
  const stamped: CurriculumData = {
    ...data,
    version: typeof data.version === "number" ? data.version : 1,
    updatedAt: new Date().toISOString(),
  };

  const sb = getSupabaseConfig();
  if (sb) {
    const client = createClient(sb.url, sb.key, {
      auth: { persistSession: false },
    });
    const { error } = await client.from("curriculum_store").upsert(
      {
        id: SUPABASE_ROW_ID,
        payload: stamped,
        updated_at: stamped.updatedAt,
      },
      { onConflict: "id" }
    );
    if (!error) {
      return { ok: true, persistedTo: "supabase", curriculum: stamped };
    }
    console.warn("Supabase saveCurriculum error, falling back:", error.message);
  }

  try {
    await fs.mkdir(path.dirname(LOCAL_DATA_PATH), { recursive: true });
    await fs.writeFile(
      LOCAL_DATA_PATH,
      JSON.stringify(stamped, null, 2),
      "utf-8"
    );
    return { ok: true, persistedTo: "local-file", curriculum: stamped };
  } catch {
    return {
      ok: true,
      persistedTo: "readonly-seed",
      warning:
        "Máy chủ hiện ở chế độ chỉ đọc (chưa kết nối Supabase). Thay đổi đã được lưu tạm trên trình duyệt này.",
      curriculum: stamped,
    };
  }
}

export async function saveMediaFile(
  buffer: Buffer,
  filename: string,
  contentType: string
): Promise<{ url: string; persistedTo: StorageMode }> {
  const safeBase = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const uniqueName = `${Date.now()}-${safeBase}`;

  const sb = getSupabaseConfig();
  if (sb) {
    try {
      const client = createClient(sb.url, sb.key, {
        auth: { persistSession: false },
      });
      const objectPath = `media/${uniqueName}`;
      const { error } = await client.storage
        .from(SUPABASE_BUCKET)
        .upload(objectPath, buffer, {
          contentType,
          upsert: true,
        });
      if (!error) {
        const { data } = client.storage
          .from(SUPABASE_BUCKET)
          .getPublicUrl(objectPath);
        return { url: data.publicUrl, persistedTo: "supabase" };
      }
    } catch (err) {
      console.warn("Supabase upload failed, falling back to local:", err);
    }
  }

  try {
    await fs.mkdir(LOCAL_UPLOADS_DIR, { recursive: true });
    await fs.writeFile(path.join(LOCAL_UPLOADS_DIR, uniqueName), buffer);
    return { url: `/uploads/${uniqueName}`, persistedTo: "local-file" };
  } catch {
    const base64 = buffer.toString("base64");
    return {
      url: `data:${contentType};base64,${base64}`,
      persistedTo: "readonly-seed",
    };
  }
}
