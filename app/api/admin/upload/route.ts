import { verifyAdminPinHeader } from "@/lib/admin-auth";
import { saveMediaFile } from "@/lib/curriculum-store";

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5MB

export async function POST(request: Request) {
  if (!verifyAdminPinHeader(request)) {
    return Response.json(
      { error: "Sai mã PIN phụ huynh." },
      { status: 401 }
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: "Form dữ liệu không hợp lệ." }, { status: 400 });
  }

  const file = formData.get("file");
  const kind = String(formData.get("kind") ?? "image");

  if (!(file instanceof File) || file.size === 0) {
    return Response.json({ error: "Chưa chọn tệp để tải lên." }, { status: 400 });
  }

  if (file.size > MAX_FILE_BYTES) {
    return Response.json(
      { error: "Tệp quá lớn (tối đa 5MB)." },
      { status: 400 }
    );
  }

  const mime = file.type || "";
  if (kind === "image" && !mime.startsWith("image/")) {
    return Response.json(
      { error: "Vui lòng chọn tệp hình ảnh (PNG, JPG, WebP, SVG)." },
      { status: 400 }
    );
  }
  if (kind === "audio" && !mime.startsWith("audio/")) {
    return Response.json(
      { error: "Vui lòng chọn tệp âm thanh (MP3, WAV, M4A, OGG)." },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const saved = await saveMediaFile(buffer, file.name, mime);
  return Response.json({
    url: saved.url,
    persistedTo: saved.persistedTo,
  });
}
