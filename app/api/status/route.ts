import { connection } from "next/server";
import { isUsingDefaultPin } from "@/lib/admin-auth";
import { getStorageMode, hasSupabaseConfigured } from "@/lib/curriculum-store";
import type { SystemStatus } from "@/lib/types";

export async function GET() {
  await connection();
  const payload: SystemStatus = {
    storageMode: getStorageMode(),
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY?.trim()),
    isUsingDefaultPin: isUsingDefaultPin(),
    hasSupabase: hasSupabaseConfigured(),
  };
  return Response.json(payload, {
    headers: { "Cache-Control": "no-store" },
  });
}
