import { verifyAdminPinHeader } from "@/lib/admin-auth";
import { saveMediaFile } from "@/lib/curriculum-store";
import { pcm16ToWav } from "@/lib/wav";

const GEMINI_TTS_MODEL = "gemini-2.5-flash-preview-tts";

export async function POST(request: Request) {
  if (!verifyAdminPinHeader(request)) {
    return Response.json(
      { error: "Sai mã PIN phụ huynh." },
      { status: 401 }
    );
  }

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return Response.json(
      {
        error:
          "Chưa cấu hình GEMINI_API_KEY trong .env.local. App vẫn tự đọc bằng giọng trình duyệt, hoặc bạn có thể tải file MP3/WAV lên trực tiếp.",
      },
      { status: 400 }
    );
  }

  let body: {
    text?: string;
    spokenText?: string;
    speed?: "normal" | "slow";
    cardId?: string;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return Response.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 });
  }

  const target = (body.spokenText || body.text || "").trim();
  const speed = body.speed === "slow" ? "slow" : "normal";
  const cardId = (body.cardId || "card").replace(/[^a-zA-Z0-9_-]/g, "");

  if (!target) {
    return Response.json(
      { error: "Thiếu nội dung chữ tiếng Anh để tạo giọng đọc." },
      { status: 400 }
    );
  }

  const instruction =
    speed === "slow"
      ? `Speak clearly and very slowly for an 8-year-old beginner learning English, enunciating every ending sound gently: "${target}"`
      : `Speak warmly, naturally, and clearly for an 8-year-old English beginner: "${target}"`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_TTS_MODEL}:generateContent?key=${encodeURIComponent(
        apiKey
      )}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: instruction }],
            },
          ],
          generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: "Kore",
                },
              },
            },
          },
        }),
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      return Response.json(
        { error: `Gemini TTS trả về lỗi (${res.status}): ${errText.slice(0, 180)}` },
        { status: 502 }
      );
    }

    const data = (await res.json()) as {
      candidates?: Array<{
        content?: {
          parts?: Array<{
            inlineData?: { mimeType?: string; data?: string };
          }>;
        };
      }>;
    };

    const inline = data.candidates?.[0]?.content?.parts?.find(
      (p) => p.inlineData?.data
    )?.inlineData;

    if (!inline?.data) {
      return Response.json(
        { error: "Gemini không trả về dữ liệu âm thanh." },
        { status: 502 }
      );
    }

    const rawBuffer = Buffer.from(inline.data, "base64");
    const mime = (inline.mimeType || "audio/L16;rate=24000").toLowerCase();

    let finalBuffer: Buffer = rawBuffer;
    let finalMime = mime.split(";")[0] || "audio/wav";
    let ext = "wav";

    if (mime.includes("l16") || mime.includes("pcm")) {
      const rateMatch = mime.match(/rate=(\d+)/);
      const sampleRate = rateMatch ? Number(rateMatch[1]) : 24000;
      finalBuffer = pcm16ToWav(rawBuffer, sampleRate, 1);
      finalMime = "audio/wav";
      ext = "wav";
    } else if (mime.includes("mpeg") || mime.includes("mp3")) {
      ext = "mp3";
    } else if (mime.includes("ogg")) {
      ext = "ogg";
    }

    const saved = await saveMediaFile(
      finalBuffer,
      `${cardId}-${speed}.${ext}`,
      finalMime
    );

    return Response.json({
      audioUrl: saved.url,
      persistedTo: saved.persistedTo,
    });
  } catch (err) {
    return Response.json(
      {
        error:
          err instanceof Error
            ? `Lỗi tạo audio: ${err.message}`
            : "Không thể kết nối Gemini TTS.",
      },
      { status: 500 }
    );
  }
}
