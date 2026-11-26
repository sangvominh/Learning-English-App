"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Headphones,
  Loader2,
  Mic,
  RotateCcw,
  Square,
  Turtle,
  Volume2,
  X,
} from "lucide-react";
import { playCardAudio, playSfx } from "@/lib/audio-player";
import type { LearningCard, PronunciationFeedback } from "@/lib/types";

interface SpeechRecognitionAlternativeLike {
  transcript: string;
}

interface SpeechRecognitionResultLike {
  0: SpeechRecognitionAlternativeLike;
}

interface SpeechRecognitionEventLike extends Event {
  results: ArrayLike<SpeechRecognitionResultLike>;
}

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((ev: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
}

interface PronunciationCoachProps {
  card: LearningCard;
  onEvaluated?: (feedback: PronunciationFeedback) => void;
  onNextCard?: () => void;
  nextLabel?: string;
}

export function PronunciationCoach({
  card,
  onEvaluated,
  onNextCard,
  nextLabel = "Thẻ tiếp theo",
}: PronunciationCoachProps) {
  const [status, setStatus] = useState<
    "idle" | "recording" | "analyzing" | "done" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [feedback, setFeedback] = useState<PronunciationFeedback | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [assessMode, setAssessMode] = useState<string>("");
  const [childAudioUrl, setChildAudioUrl] = useState<string | null>(null);
  const [levels, setLevels] = useState<number[]>([20, 35, 50, 32, 24, 40, 26]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<number | null>(null);
  const animRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const transcriptRef = useRef<string>("");

  const cleanupRecording = () => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (animRef.current) {
      window.cancelAnimationFrame(animRef.current);
      animRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      cleanupRecording();
    };
  }, []);

  useEffect(() => {
    return () => {
      if (childAudioUrl) URL.revokeObjectURL(childAudioUrl);
    };
  }, [childAudioUrl]);

  const submitRecording = async (blob: Blob, mimeType: string) => {
    setStatus("analyzing");
    try {
      const form = new FormData();
      const ext = mimeType.includes("mp4") ? "m4a" : "webm";
      form.append("audio", blob, `kid-voice.${ext}`);
      form.append("targetText", card.text);
      form.append("cardType", card.type);
      form.append("ipa", card.ipa ?? "");
      form.append("pronunciationTipVi", card.pronunciationTipVi);
      form.append("focusPhonemes", (card.focusPhonemes ?? []).join(", "));
      form.append("transcriptHint", transcriptRef.current);

      const res = await fetch("/api/pronunciation/assess", {
        method: "POST",
        body: form,
      });

      const data = (await res.json()) as {
        mode?: string;
        feedback?: PronunciationFeedback;
        error?: string;
      };

      if (!res.ok || !data.feedback) {
        throw new Error(data.error || "Không chấm được phát âm.");
      }

      setFeedback(data.feedback);
      setAssessMode(data.mode || "");
      setStatus("done");
      setSheetOpen(true);
      playSfx(data.feedback.stars >= 2 ? "correct" : "tap");
      onEvaluated?.(data.feedback);
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Có lỗi khi gửi âm thanh."
      );
      setStatus("error");
      setSheetOpen(true);
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
    cleanupRecording();
  };

  const startRecording = async () => {
    setErrorMsg("");
    setFeedback(null);
    setSheetOpen(false);
    transcriptRef.current = "";

    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      setErrorMsg(
        "Trình duyệt đang chặn Micro (do truy cập qua HTTP thường thay vì HTTPS). Bố/mẹ hãy dùng link HTTPS trên Vercel để bật Micro."
      );
      setStatus("error");
      setSheetOpen(true);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      streamRef.current = stream;

      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (Ctx) {
        const ctx = new Ctx();
        audioCtxRef.current = ctx;
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 32;
        source.connect(analyser);
        analyserRef.current = analyser;
        const dataArr = new Uint8Array(analyser.frequencyBinCount);

        const tick = () => {
          if (!analyserRef.current) return;
          analyserRef.current.getByteFrequencyData(dataArr);
          const nextBars = Array.from({ length: 7 }, (_, idx) => {
            const val = dataArr[idx % dataArr.length] ?? 0;
            return Math.max(16, Math.min(100, Math.round((val / 255) * 100)));
          });
          setLevels(nextBars);
          animRef.current = window.requestAnimationFrame(tick);
        };
        animRef.current = window.requestAnimationFrame(tick);
      }

      const SpeechRec =
        (
          window as unknown as {
            SpeechRecognition?: new () => SpeechRecognitionLike;
            webkitSpeechRecognition?: new () => SpeechRecognitionLike;
          }
        ).SpeechRecognition ||
        (
          window as unknown as {
            webkitSpeechRecognition?: new () => SpeechRecognitionLike;
          }
        ).webkitSpeechRecognition;
      if (SpeechRec) {
        try {
          const rec = new SpeechRec();
          rec.lang = "en-US";
          rec.interimResults = false;
          rec.maxAlternatives = 1;
          rec.onresult = (ev) => {
            const text = ev.results?.[0]?.[0]?.transcript;
            if (text) transcriptRef.current = text;
          };
          rec.onerror = () => {};
          rec.start();
          recognitionRef.current = rec;
        } catch {
          // ignore if unavailable
        }
      }

      const preferredMime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/mp4")
        ? "audio/mp4"
        : "";

      const recorder = preferredMime
        ? new MediaRecorder(stream, { mimeType: preferredMime })
        : new MediaRecorder(stream);

      chunksRef.current = [];
      recorder.ondataavailable = (ev) => {
        if (ev.data.size > 0) chunksRef.current.push(ev.data);
      };
      recorder.onstop = () => {
        const mime = recorder.mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type: mime });
        const url = URL.createObjectURL(blob);
        setChildAudioUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return url;
        });
        void submitRecording(blob, mime);
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setStatus("recording");

      timerRef.current = window.setTimeout(() => {
        stopRecording();
      }, 5500);
    } catch {
      cleanupRecording();
      setErrorMsg(
        "Chưa mở được Micro. Hãy bấm 'Cho phép' Micro hoặc kiểm tra quyền trình duyệt."
      );
      setStatus("error");
      setSheetOpen(true);
    }
  };

  const playChildVoice = () => {
    if (!childAudioUrl) return;
    const audio = new Audio(childAudioUrl);
    audio.play().catch(() => {});
  };

  const handleSelfPracticePass = () => {
    const fallback: PronunciationFeedback = {
      score: 80,
      stars: 2,
      heardText: card.text,
      praiseVi: "Đã ghi nhận lượt đọc theo mẫu.",
      correctionVi: "Hãy nghe lại giọng mẫu thêm một lần để nhớ cách nói tự nhiên.",
      mouthTipVi: card.pronunciationTipVi,
      segments: card.text
        .split(/\s+/)
        .map((t) => ({ text: t, status: "good" as const })),
    };
    setFeedback(fallback);
    setStatus("done");
    setErrorMsg("");
    setSheetOpen(true);
    onEvaluated?.(fallback);
  };

  return (
    <>
      {/* Fixed Compact Control Dock (never expands vertically) */}
      <div className="rounded-2xl bg-white border border-slate-200 p-2.5 space-y-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void playCardAudio(card, "normal")}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white py-2 px-2.5 font-bold text-xs"
          >
            <Volume2 className="w-4 h-4 shrink-0" />
            Nghe mẫu
          </button>
          <button
            type="button"
            onClick={() => void playCardAudio(card, "slow")}
            className="flex items-center justify-center gap-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 py-2 px-3 font-bold text-xs"
          >
            <Turtle className="w-4 h-4 shrink-0" />
            Chậm
          </button>
          {childAudioUrl && (
            <button
              type="button"
              onClick={playChildVoice}
              className="flex items-center justify-center gap-1 rounded-xl bg-violet-100 hover:bg-violet-200 text-violet-900 py-2 px-2.5 font-bold text-xs"
            >
              <Headphones className="w-3.5 h-3.5 shrink-0" />
              Giọng con
            </button>
          )}
          {feedback && (
            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              className={`rounded-xl border px-2.5 py-2 text-xs font-extrabold shrink-0 ${
                feedback.score >= 80
                  ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                  : feedback.score >= 60
                  ? "bg-amber-50 border-amber-300 text-amber-800"
                  : "bg-orange-50 border-orange-300 text-orange-800"
              }`}
            >
              {feedback.score}/100
            </button>
          )}
        </div>

        {status === "recording" ? (
          <button
            type="button"
            onClick={stopRecording}
            className="animate-mic-pulse w-full rounded-xl bg-orange-500 text-white py-3 px-4 flex items-center justify-center gap-2.5 font-extrabold text-sm"
          >
            <Square className="w-4 h-4 fill-current" />
            <span>Đang nghe... Bấm để dừng</span>
            <span className="flex items-end gap-1 h-4">
              {levels.map((lv, i) => (
                <span
                  key={i}
                  style={{ height: `${lv}%` }}
                  className="w-1 bg-white rounded-full transition-all duration-75"
                />
              ))}
            </span>
          </button>
        ) : status === "analyzing" ? (
          <div className="w-full rounded-xl bg-slate-50 border border-slate-200 py-3 px-4 flex items-center justify-center gap-2 text-slate-700 font-bold text-xs">
            <Loader2 className="w-4 h-4 animate-spin" />
            Đang nghe và nhận xét...
          </div>
        ) : (
          <button
            type="button"
            onClick={startRecording}
            className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 flex items-center justify-center gap-2 font-extrabold text-sm"
          >
            <Mic className="w-4 h-4" />
            {feedback ? "Đọc lại" : "Bấm để đọc theo"}
          </button>
        )}
      </div>

      {/* Bottom Sheet Overlay for Feedback / Error */}
      {sheetOpen && (status === "error" || feedback) && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/45 backdrop-blur-[1px] flex items-end justify-center"
          onClick={() => setSheetOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-t-3xl bg-white p-5 pb-safe shadow-2xl space-y-3.5 animate-pop-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-display text-base font-extrabold text-slate-900">
                {status === "error" ? "Chưa thu âm được" : "Nhận xét phát âm"}
              </h3>
              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                aria-label="Đóng"
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {status === "error" && errorMsg ? (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl p-3 leading-relaxed">
                  {errorMsg}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSelfPracticePass}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 text-white py-2.5 text-xs font-extrabold"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Đã tự đọc theo mẫu
                  </button>
                  <button
                    type="button"
                    onClick={() => setSheetOpen(false)}
                    className="rounded-xl bg-slate-100 text-slate-700 px-4 py-2.5 text-xs font-bold"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            ) : feedback ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-1.5">
                    {feedback.segments.map((seg, i) => {
                      const badgeClass =
                        seg.status === "good"
                          ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                          : seg.status === "almost"
                          ? "bg-amber-100 text-amber-900 border-amber-300"
                          : "bg-orange-100 text-orange-900 border-orange-300";
                      return (
                        <span
                          key={`${seg.text}-${i}`}
                          className={`rounded-lg border px-2 py-0.5 text-xs font-extrabold ${badgeClass}`}
                        >
                          {seg.text}
                        </span>
                      );
                    })}
                  </div>
                  <span
                    className={`rounded-xl px-2.5 py-1 text-xs font-extrabold border shrink-0 ${
                      feedback.score >= 80
                        ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                        : feedback.score >= 60
                        ? "bg-amber-50 text-amber-800 border-amber-300"
                        : "bg-orange-50 text-orange-800 border-orange-300"
                    }`}
                  >
                    {feedback.score}/100
                    {assessMode === "self-check" ? " • Tự luyện" : ""}
                  </span>
                </div>

                <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 space-y-1.5 text-xs leading-relaxed">
                  <p className="font-bold text-slate-900">
                    {feedback.praiseVi}
                  </p>
                  <p className="font-semibold text-slate-700">
                    <span className="font-bold">Gợi ý:</span>{" "}
                    {feedback.correctionVi}
                  </p>
                  {feedback.mouthTipVi && (
                    <p className="font-semibold text-amber-900 pt-0.5">
                      <span className="font-bold">Mẹo nói:</span>{" "}
                      {feedback.mouthTipVi}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void playCardAudio(card, "normal")}
                    className="rounded-xl bg-sky-50 border border-sky-200 text-sky-800 px-3 py-2.5 text-xs font-bold inline-flex items-center gap-1"
                  >
                    <Volume2 className="w-3.5 h-3.5" /> Mẫu
                  </button>
                  {childAudioUrl && (
                    <button
                      type="button"
                      onClick={playChildVoice}
                      className="rounded-xl bg-violet-50 border border-violet-200 text-violet-800 px-3 py-2.5 text-xs font-bold inline-flex items-center gap-1"
                    >
                      <Headphones className="w-3.5 h-3.5" /> Giọng con
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setSheetOpen(false);
                      void startRecording();
                    }}
                    className="rounded-xl bg-slate-100 text-slate-800 px-3 py-2.5 text-xs font-bold"
                  >
                    Đọc lại
                  </button>
                  {onNextCard ? (
                    <button
                      type="button"
                      onClick={() => {
                        setSheetOpen(false);
                        onNextCard();
                      }}
                      className="flex-1 rounded-xl bg-emerald-600 text-white py-2.5 px-3 text-xs font-extrabold inline-flex items-center justify-center gap-1"
                    >
                      {nextLabel}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setSheetOpen(false)}
                      className="flex-1 rounded-xl bg-emerald-600 text-white py-2.5 px-3 text-xs font-extrabold"
                    >
                      Xong
                    </button>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </>
  );
}
