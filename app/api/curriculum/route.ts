import { connection } from "next/server";
import { verifyAdminPinHeader } from "@/lib/admin-auth";
import {
  isValidCurriculumData,
  loadCurriculum,
  saveCurriculum,
} from "@/lib/curriculum-store";

export async function GET() {
  await connection();
  const { curriculum, source } = await loadCurriculum();
  return Response.json(
    { curriculum, source },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function PUT(request: Request) {
  if (!verifyAdminPinHeader(request)) {
    return Response.json(
      { error: "Sai mã PIN phụ huynh." },
      { status: 401 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Dữ liệu JSON không hợp lệ." }, { status: 400 });
  }

  const candidate =
    body && typeof body === "object" && "curriculum" in body
      ? (body as { curriculum: unknown }).curriculum
      : body;

  if (!isValidCurriculumData(candidate)) {
    return Response.json(
      { error: "Cấu trúc bài học không đúng định dạng." },
      { status: 400 }
    );
  }

  const result = await saveCurriculum(candidate);
  return Response.json(result);
}
