import type { PronunciationFeedback } from "@/lib/types";

const GEMINI_ASSESS_MODEL = "gemini-2.5-flash";

function normalizeWords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s']/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function buildHeuristicFeedback(params: {
  targetText: string;
  cardType: string;
  pronunciationTipVi: string;
  transcriptHint: string;
}): { mode: "browser-fallback" | "self-check"; feedback: PronunciationFeedback } {
  const { targetText, cardType, pronunciationTipVi, transcriptHint } = params;
  const targetWords = normalizeWords(targetText);
  const heardWords = normalizeWords(transcriptHint);

  if (!transcriptHint.trim()) {
    return {
      mode: "self-check",
      feedback: {
        score: 75,
        stars: 2,
        heardText: "(Chưa bật AI chấm âm)",
        praiseVi: "Hoan hô con đã mạnh dạn thu âm! Hãy bấm nghe lại giọng con so với giọng mẫu nhé.",
        correctionVi:
          "Hiện máy chưa gắn GEMINI_API_KEY nên chưa nghe chi tiết từng âm. Con hãy nghe 'Giọng mẫu' rồi đối chiếu với 'Giọng con' xem âm cuối đã bật rõ chưa.",
        mouthTipVi: pronunciationTipVi,
        segments: targetWords.map((w) => ({ text: w, status: "almost" as const })),
      },
    };
  }

  let matched = 0;
  const segments = targetWords.map((word) => {
    const exact = heardWords.includes(word);
    if (exact) {
      matched += 1;
      return { text: word, status: "good" as const };
    }
    const close = heardWords.some(
      (hw) =>
        hw.startsWith(word.slice(0, 2)) ||
        word.startsWith(hw.slice(0, 2)) ||
        (cardType === "phonics" && hw.includes(word))
    );
    if (close) {
      matched += 0.6;
      return { text: word, status: "almost" as const };
    }
    return { text: word, status: "fix" as const };
  });

  const ratio = targetWords.length > 0 ? matched / targetWords.length : 0.7;
  const score = Math.max(45, Math.min(98, Math.round(ratio * 95)));
  const stars: 1 | 2 | 3 = score >= 85 ? 3 : score >= 65 ? 2 : 1;

  return {
    mode: "browser-fallback",
    feedback: {
      score,
      stars,
      heardText: transcriptHint,
      praiseVi:
        stars === 3
          ? "Tuyệt vời! Con đọc rất rõ và chuẩn nhịp rồi đó!"
          : stars === 2
          ? "Khá lắm! Con đã đọc gần đúng rồi, thử bật rõ hơn một chút nữa nhé."
          : "Cố lên nào! Con đã dám nói to rồi, mình nghe lại giọng mẫu và thử lần nữa nhé.",
      correctionVi:
        stars === 3
          ? "Giọng con nghe rất tự nhiên. Hãy giữ phong độ này cho thẻ tiếp theo nhé!"
          : `Máy nghe được "${transcriptHint}". Con chú ý đọc chậm lại một chút để rõ âm đầu và âm cuối của "${targetText}".`,
      mouthTipVi: pronunciationTipVi,
      segments,
    },
  };
}

export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json(
      { error: "Không đọc được dữ liệu âm thanh gửi lên." },
      { status: 400 }
    );
  }

  const audioFile = formData.get("audio");
  const targetText = String(formData.get("targetText") ?? "").trim();
  const cardType = String(formData.get("cardType") ?? "word");
  const pronunciationTipVi = String(
    formData.get("pronunciationTipVi") ??
      "Nói tự nhiên, rõ chữ đầu và chữ cuối."
  );
  const transcriptHint = String(formData.get("transcriptHint") ?? "");

  if (!targetText) {
    return Response.json(
      { error: "Thiếu từ hoặc câu mục tiêu." },
      { status: 400 }
    );
  }

  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey || !(audioFile instanceof Blob) || audioFile.size === 0) {
    return Response.json(
      buildHeuristicFeedback({
        targetText,
        cardType,
        pronunciationTipVi,
        transcriptHint,
      })
    );
  }

  try {
    const arrayBuffer = await audioFile.arrayBuffer();
    const base64Audio = Buffer.from(arrayBuffer).toString("base64");
    const rawMime = audioFile.type || "audio/webm";
    const mimeType = rawMime.split(";")[0] || "audio/webm";

    const prompt = [
      "Bạn là người hướng dẫn tiếng Anh gần gũi, dễ hiểu đang giúp một bé lớp 3 (8-9 tuổi, người Việt) nói tiếng Anh tự nhiên để dùng hằng ngày.",
      `Câu hoặc từ bé cần nói: "${targetText}" (${cardType}).`,
      `Gợi ý tham khảo: ${pronunciationTipVi}`,
      "",
      "Hãy nghe kỹ đoạn ghi âm của bé và nhận xét theo cách thật tự nhiên, thực tế:",
      "- TUYỆT ĐỐI KHÔNG dùng ký hiệu phiên âm quốc tế IPA (như /æ/, /θ/) hay thuật ngữ ngôn ngữ học (như 'âm vị', 'vòm họng', 'bật hơi vô thanh').",
      "- Tập trung vào việc người nghe có hiểu được bé nói gì không. Khen điểm bé nói rõ ràng, rồi chỉ 1 điểm đơn giản nhất để bé nói tự nhiên hơn bằng tiếng Việt đời thường (ví dụ: 'chữ cuối hơi nhỏ, con đọc rõ thêm chút nữa là người nước ngoài hiểu ngay').",
      "- Nếu bé chưa nói gì hoặc quá nhỏ/ồn, nhẹ nhàng nhắc bé đưa điện thoại gần miệng và nói to rõ hơn.",
      "- segments: tách mục tiêu thành từng từ và gán status 'good' (nghe rõ), 'almost' (gần rõ), hoặc 'fix' (cần nói rõ hơn).",
      "- score: 0..100, stars: 1, 2, hoặc 3.",
    ].join("\n");

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_ASSESS_MODEL}:generateContent?key=${encodeURIComponent(
        apiKey
      )}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType,
                    data: base64Audio,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.25,
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                score: { type: "INTEGER" },
                stars: { type: "INTEGER" },
                heardText: { type: "STRING" },
                praiseVi: { type: "STRING" },
                correctionVi: { type: "STRING" },
                mouthTipVi: { type: "STRING" },
                segments: {
                  type: "ARRAY",
                  items: {
                    type: "OBJECT",
                    properties: {
                      text: { type: "STRING" },
                      status: {
                        type: "STRING",
                        enum: ["good", "almost", "fix"],
                      },
                    },
                    required: ["text", "status"],
                  },
                },
              },
              required: [
                "score",
                "stars",
                "heardText",
                "praiseVi",
                "correctionVi",
                "mouthTipVi",
                "segments",
              ],
            },
          },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.warn("Gemini assess API error:", response.status, errText);
      const fallback = buildHeuristicFeedback({
        targetText,
        cardType,
        pronunciationTipVi,
        transcriptHint,
      });
      return Response.json({
        ...fallback,
        warning: "AI tạm bận, đã dùng chế độ kiểm tra nhanh.",
      });
    }

    const json = (await response.json()) as {
      candidates?: Array<{
        content?: { parts?: Array<{ text?: string }> };
      }>;
    };
    const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const parsed = JSON.parse(rawText) as PronunciationFeedback;

    const clampedScore = Math.max(
      0,
      Math.min(100, Math.round(Number(parsed.score) || 70))
    );
    const clampedStars: 1 | 2 | 3 =
      parsed.stars >= 3 || clampedScore >= 85
        ? 3
        : parsed.stars === 2 || clampedScore >= 60
        ? 2
        : 1;

    return Response.json({
      mode: "gemini",
      feedback: {
        score: clampedScore,
        stars: clampedStars,
        heardText: parsed.heardText || targetText,
        praiseVi: parsed.praiseVi || "Con làm tốt lắm!",
        correctionVi:
          parsed.correctionVi ||
          "Nghe lại giọng mẫu một lần nữa để giữ phát âm thật chuẩn nhé.",
        mouthTipVi: parsed.mouthTipVi || pronunciationTipVi,
        segments:
          Array.isArray(parsed.segments) && parsed.segments.length > 0
            ? parsed.segments
            : normalizeWords(targetText).map((w) => ({
                text: w,
                status: clampedStars === 3 ? "good" : "almost",
              })),
      } satisfies PronunciationFeedback,
    });
  } catch (err) {
    console.warn("Pronunciation assess exception:", err);
    return Response.json(
      buildHeuristicFeedback({
        targetText,
        cardType,
        pronunciationTipVi,
        transcriptHint,
      })
    );
  }
}
