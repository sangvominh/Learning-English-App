"use client";

import { useEffect, useRef, useState } from "react";
import {
  Headphones,
  Loader2,
  Mic,
  RotateCcw,
  Square,
  Turtle,
  Volume2,
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
  compact?: boolean;
}

export function PronunciationCoach({
  card,
  onEvaluated,
  compact = false,
}: PronunciationCoachProps) {
  const [status, setStatus] = useState<
    "idle" | "recording" | "analyzing" | "done" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [feedback, setFeedback] = useState<PronunciationFeedback | null>(null);
  const [assessMode, setAssessMode] = useState<string>("");
  const [childAudioUrl, setChildAudioUrl] = useState<string | null>(null);
  const [levels, setLevels] = useState<number[]>([18, 28, 42, 30, 20, 35, 22]);

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
      form.append("ipa", card.ipa);
      form.append("pronunciationTipVi", card.pronunciationTipVi);
      form.append("focusPhonemes", card.focusPhonemes.join(", "));
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
      playSfx(data.feedback.stars >= 2 ? "correct" : "tap");
      onEvaluated?.(data.feedback);
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Có lỗi khi gửi âm thanh."
      );
      setStatus("error");
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
    transcriptRef.current = "";

    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      setErrorMsg(
        "Trình duyệt đang chặn Micro (do truy cập qua HTTP thường thay vì HTTPS). Bố/mẹ xem hướng dẫn bật quyền Mic hoặc deploy HTTPS trong Quản trị nhé."
      );
      setStatus("error");
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
      correctionVi:
        "Hãy nghe lại giọng mẫu thêm một lần để nhớ âm đầu và âm cuối.",
      mouthTipVi: card.pronunciationTipVi,
      segments: card.text
        .split(/\s+/)
        .map((t) => ({ text: t, status: "good" as const })),
    };
    setFeedback(fallback);
    setStatus("done");
    setErrorMsg("");
    onEvaluated?.(fallback);
  };

  return (
    <div
      className={`rounded-2xl bg-white border border-slate-200 ${
        compact ? "p-3" : "p-3.5"
      }`}
    >
      {/* Audio controls */}
      <div className="flex items-center justify-center gap-2 mb-2.5">
        <button
          type="button"
          onClick={() => void playCardAudio(card, "normal")}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white py-2.5 px-3 font-bold text-xs"
        >
          <Volume2 className="w-4 h-4 shrink-0" />
          Nghe mẫu
        </button>
        <button
          type="button"
          onClick={() => void playCardAudio(card, "slow")}
          className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 py-2.5 px-3 font-bold text-xs"
        >
          <Turtle className="w-4 h-4 shrink-0" />
          Đọc chậm
        </button>
        {childAudioUrl && (
          <button
            type="button"
            onClick={playChildVoice}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-violet-100 hover:bg-violet-200 text-violet-900 py-2.5 px-3 font-bold text-xs"
          >
            <Headphones className="w-4 h-4 shrink-0" />
            Giọng con
          </button>
        )}
      </div>

      {/* Main Mic Button */}
      <div className="flex flex-col items-center">
        {status === "recording" ? (
          <button
            type="button"
            onClick={stopRecording}
            className="animate-mic-pulse w-full rounded-xl bg-orange-500 text-white py-3 px-4 flex items-center justify-center gap-2.5 font-bold text-sm"
          >
            <Square className="w-4 h-4 fill-current" />
            <span>Đang thu âm... (Bấm để dừng)</span>
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
            Đang phân tích phát âm...
          </div>
        ) : (
          <button
            type="button"
            onClick={startRecording}
            className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 flex items-center justify-center gap-2 font-bold text-sm"
          >
            <Mic className="w-4 h-4" />
            {feedback ? "Đọc lại" : "Bấm để đọc"}
          </button>
        )}
      </div>

      {/* Error Box */}
      {status === "error" && errorMsg && (
        <div className="mt-2.5 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800 space-y-2">
          <p className="font-semibold">{errorMsg}</p>
          <button
            type="button"
            onClick={handleSelfPracticePass}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-rose-200 px-3 py-1.5 font-bold text-rose-700 hover:bg-rose-100"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Đã tự đọc theo mẫu
          </button>
        </div>
      )}

      {/* Feedback Box */}
      {status === "done" && feedback && (
        <div className="mt-3 rounded-xl bg-slate-50 border border-slate-200 p-3 space-y-2 animate-pop-in">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-extrabold text-slate-700">
              Kết quả phát âm
            </span>
            <span className="rounded-lg bg-white px-2.5 py-0.5 text-xs font-extrabold text-emerald-800 border border-emerald-200">
              {feedback.score}/100
              {assessMode === "self-check" ? " • Tự luyện" : ""}
            </span>
          </div>

          {feedback.segments.length > 0 && (
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
          )}

          <p className="text-xs font-bold text-slate-800">
            Nhận xét: <span className="font-semibold">{feedback.praiseVi}</span>
          </p>
          <p className="text-xs font-semibold text-slate-700 leading-relaxed">
            <span className="font-bold">Cần sửa:</span> {feedback.correctionVi}
          </p>
          <p className="text-xs font-semibold text-amber-950 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-2 leading-relaxed">
            <span className="font-bold">Cách đặt miệng:</span>{" "}
            {feedback.mouthTipVi}
          </p>
        </div>
      )}
    </div>
  );
}
