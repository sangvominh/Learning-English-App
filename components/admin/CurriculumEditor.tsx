"use client";

import { useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  Download,
  Image as ImageIcon,
  Plus,
  RotateCcw,
  Save,
  Sparkles,
  Trash2,
  Turtle,
  Upload,
  Volume2,
} from "lucide-react";
import { playCardAudio } from "@/lib/audio-player";
import { BUILT_IN_ILLUSTRATIONS } from "@/lib/illustrations-catalog";
import {
  clearLocalCurriculumOverride,
  saveLocalCurriculumOverride,
} from "@/lib/learner-db";
import { SEED_CURRICULUM } from "@/lib/seed-curriculum";
import type {
  CardType,
  CurriculumData,
  LearningCard,
  Lesson,
  LessonTrack,
  Unit,
  UnitColor,
} from "@/lib/types";

interface CurriculumEditorProps {
  curriculum: CurriculumData;
  adminPin: string;
  onChange: (next: CurriculumData) => void;
}

function moveItem<T>(arr: T[], index: number, delta: -1 | 1): T[] {
  const target = index + delta;
  if (target < 0 || target >= arr.length) return arr;
  const copy = [...arr];
  [copy[index], copy[target]] = [copy[target], copy[index]];
  return copy;
}

export function CurriculumEditor({
  curriculum,
  adminPin,
  onChange,
}: CurriculumEditorProps) {
  const [unitIdx, setUnitIdx] = useState(0);
  const [lessonIdx, setLessonIdx] = useState(0);
  const [cardIdx, setCardIdx] = useState(0);
  const [saving, setSaving] = useState(false);
  const [ttsLoading, setTtsLoading] = useState<"normal" | "slow" | null>(null);
  const [uploadingKind, setUploadingKind] = useState<"image" | "audio" | null>(
    null
  );
  const [bannerMsg, setBannerMsg] = useState<{
    type: "ok" | "warn" | "err";
    text: string;
  } | null>(null);
  const [galleryOpen, setGalleryOpen] = useState(false);

  const importInputRef = useRef<HTMLInputElement | null>(null);
  const imgUploadRef = useRef<HTMLInputElement | null>(null);
  const audioNormalUploadRef = useRef<HTMLInputElement | null>(null);
  const audioSlowUploadRef = useRef<HTMLInputElement | null>(null);

  const units = curriculum.units;
  const safeUnitIdx = Math.min(unitIdx, Math.max(0, units.length - 1));
  const currentUnit: Unit | undefined = units[safeUnitIdx];
  const lessons = currentUnit?.lessons ?? [];
  const safeLessonIdx = Math.min(lessonIdx, Math.max(0, lessons.length - 1));
  const currentLesson: Lesson | undefined = lessons[safeLessonIdx];
  const cards = currentLesson?.cards ?? [];
  const safeCardIdx = Math.min(cardIdx, Math.max(0, cards.length - 1));
  const currentCard: LearningCard | undefined = cards[safeCardIdx];

  const updateUnit = (patch: Partial<Unit>) => {
    if (!currentUnit) return;
    const nextUnits = units.map((u, i) =>
      i === safeUnitIdx ? { ...u, ...patch } : u
    );
    onChange({ ...curriculum, units: nextUnits });
  };

  const updateLesson = (patch: Partial<Lesson>) => {
    if (!currentUnit || !currentLesson) return;
    const nextLessons = lessons.map((l, i) =>
      i === safeLessonIdx ? { ...l, ...patch } : l
    );
    updateUnit({ lessons: nextLessons });
  };

  const updateCard = (patch: Partial<LearningCard>) => {
    if (!currentLesson || !currentCard) return;
    const nextCards = cards.map((c, i) =>
      i === safeCardIdx ? { ...c, ...patch } : c
    );
    updateLesson({ cards: nextCards });
  };

  const handleAddUnit = () => {
    const newUnit: Unit = {
      id: `unit-${Date.now()}`,
      title: `Chặng ${units.length + 1}: Chủ đề mới`,
      descriptionVi: "Mô tả ngắn cho chặng học mới",
      color: "emerald",
      emoji: "🌟",
      lessons: [
        {
          id: `lesson-${Date.now()}`,
          title: "Bài học mới",
          subtitleVi: "Nghe, nói và chơi trò chơi",
          track: "mixed",
          emoji: "📘",
          cards: [
            {
              id: `card-${Date.now()}`,
              type: "word",
              text: "hello",
              meaningVi: "xin chào",
              ipa: "/həˈloʊ/",
              phonicsBreakdown: "hel - lo",
              imageUrl: "/illustrations/happy.svg",
              pronunciationTipVi: "Bật nhẹ hơi chữ H đầu từ, đọc rõ 'hơ-lâu'.",
              focusPhonemes: ["/h/"],
            },
          ],
        },
      ],
    };
    onChange({ ...curriculum, units: [...units, newUnit] });
    setUnitIdx(units.length);
    setLessonIdx(0);
    setCardIdx(0);
  };

  const handleAddLesson = () => {
    if (!currentUnit) return;
    const newLesson: Lesson = {
      id: `lesson-${Date.now()}`,
      title: `Bài ${lessons.length + 1}: Từ mới`,
      subtitleVi: "Luyện nghe và phát âm",
      track: "vocab_sentence",
      emoji: "✨",
      cards: [
        {
          id: `card-${Date.now()}`,
          type: "word",
          text: "star",
          meaningVi: "ngôi sao",
          ipa: "/stɑːr/",
          phonicsBreakdown: "st - ar",
          imageUrl: "/illustrations/star.svg",
          pronunciationTipVi: "Xì nhẹ âm /s/ trước khi đọc 'ta-r'.",
          focusPhonemes: ["/s/", "/t/"],
        },
      ],
    };
    updateUnit({ lessons: [...lessons, newLesson] });
    setLessonIdx(lessons.length);
    setCardIdx(0);
  };

  const handleAddCard = () => {
    if (!currentLesson) return;
    const newCard: LearningCard = {
      id: `card-${Date.now()}`,
      type: "word",
      text: "cat",
      meaningVi: "con mèo",
      ipa: "/kæt/",
      phonicsBreakdown: "c - a - t",
      imageUrl: "/illustrations/cat.svg",
      pronunciationTipVi: "Mở miệng âm /æ/ và bật nhẹ /t/ ở cuối từ.",
      focusPhonemes: ["/æ/", "/t/"],
    };
    updateLesson({ cards: [...cards, newCard] });
    setCardIdx(cards.length);
  };

  const handleSave = async () => {
    setSaving(true);
    setBannerMsg(null);
    const stamped: CurriculumData = {
      ...curriculum,
      updatedAt: new Date().toISOString(),
    };
    try {
      const res = await fetch("/api/curriculum", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-pin": adminPin,
        },
        body: JSON.stringify({ curriculum: stamped }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        persistedTo?: string;
        warning?: string;
        error?: string;
        curriculum?: CurriculumData;
      };
      if (!res.ok) {
        throw new Error(json.error || "Lưu thất bại.");
      }
      if (json.persistedTo === "readonly-seed") {
        await saveLocalCurriculumOverride(stamped);
        setBannerMsg({
          type: "warn",
          text:
            json.warning ||
            "Đã lưu tạm trên trình duyệt này. Kết nối Supabase để đồng bộ sang máy bé.",
        });
      } else {
        await clearLocalCurriculumOverride();
        if (json.curriculum) onChange(json.curriculum);
        setBannerMsg({
          type: "ok",
          text:
            json.persistedTo === "supabase"
              ? "Đã lưu lên Supabase Cloud! Điện thoại của bé sẽ nhận bài mới ngay."
              : "Đã lưu vào hệ thống cục bộ! Điện thoại cùng mạng LAN tải lại trang là thấy ngay.",
        });
      }
    } catch (err) {
      setBannerMsg({
        type: "err",
        text: err instanceof Error ? err.message : "Không thể lưu thay đổi.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateTts = async (speed: "normal" | "slow") => {
    if (!currentCard) return;
    setTtsLoading(speed);
    setBannerMsg(null);
    try {
      const res = await fetch("/api/admin/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-pin": adminPin,
        },
        body: JSON.stringify({
          text: currentCard.text,
          spokenText: currentCard.spokenText,
          speed,
          cardId: currentCard.id,
        }),
      });
      const json = (await res.json()) as { audioUrl?: string; error?: string };
      if (!res.ok || !json.audioUrl) {
        throw new Error(json.error || "Không tạo được giọng đọc.");
      }
      if (speed === "normal") {
        updateCard({ audioNormalUrl: json.audioUrl });
      } else {
        updateCard({ audioSlowUrl: json.audioUrl });
      }
      setBannerMsg({
        type: "ok",
        text: `Đã tạo xong giọng đọc ${
          speed === "normal" ? "chuẩn" : "chậm"
        }! Nhớ bấm 'Lưu thay đổi' nhé.`,
      });
    } catch (err) {
      setBannerMsg({
        type: "err",
        text: err instanceof Error ? err.message : "Lỗi tạo TTS.",
      });
    } finally {
      setTtsLoading(null);
    }
  };

  const handleUploadFile = async (
    file: File,
    kind: "image" | "audio",
    target?: "normal" | "slow"
  ) => {
    if (!currentCard) return;
    setUploadingKind(kind);
    setBannerMsg(null);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("kind", kind);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "x-admin-pin": adminPin },
        body: form,
      });
      const json = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !json.url) {
        throw new Error(json.error || "Tải tệp lên thất bại.");
      }
      if (kind === "image") {
        updateCard({ imageUrl: json.url });
      } else if (target === "slow") {
        updateCard({ audioSlowUrl: json.url });
      } else {
        updateCard({ audioNormalUrl: json.url });
      }
      setBannerMsg({
        type: "ok",
        text: "Đã tải tệp lên thành công! Nhớ bấm 'Lưu thay đổi' để áp dụng.",
      });
    } catch (err) {
      setBannerMsg({
        type: "err",
        text: err instanceof Error ? err.message : "Lỗi upload tệp.",
      });
    } finally {
      setUploadingKind(null);
    }
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(curriculum, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sunnybee-curriculum-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as CurriculumData;
      if (!Array.isArray(parsed.units)) {
        throw new Error("Tệp JSON không hợp lệ.");
      }
      onChange(parsed);
      setUnitIdx(0);
      setLessonIdx(0);
      setCardIdx(0);
      setBannerMsg({
        type: "ok",
        text: "Đã nhập bộ bài học từ JSON. Bấm 'Lưu thay đổi' để lưu lại.",
      });
    } catch (err) {
      setBannerMsg({
        type: "err",
        text: err instanceof Error ? err.message : "Không đọc được tệp JSON.",
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-white border border-slate-200 p-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportJson}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 px-3 py-2 text-xs font-extrabold text-slate-700"
          >
            <Download className="w-3.5 h-3.5" /> Xuất JSON
          </button>
          <button
            type="button"
            onClick={() => importInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 px-3 py-2 text-xs font-extrabold text-slate-700"
          >
            <Upload className="w-3.5 h-3.5" /> Nhập JSON
          </button>
          <input
            ref={importInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleImportJson(f);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => {
              if (
                window.confirm(
                  "Khôi phục lại 3 chặng bài mẫu ban đầu? (Nhớ bấm Lưu thay đổi sau đó)"
                )
              ) {
                onChange(SEED_CURRICULUM);
                setUnitIdx(0);
                setLessonIdx(0);
                setCardIdx(0);
              }
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 px-3 py-2 text-xs font-extrabold text-amber-800"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Khôi phục mẫu
          </button>
        </div>

        <button
          type="button"
          disabled={saving}
          onClick={() => void handleSave()}
          className="btn-chunky inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-extrabold shadow-sm disabled:opacity-60"
        >
          <Save className="w-4 h-4" />
          {saving ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
      </div>

      {bannerMsg && (
        <div
          className={`rounded-2xl border p-3 text-xs font-bold ${
            bannerMsg.type === "ok"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : bannerMsg.type === "warn"
              ? "bg-amber-50 border-amber-200 text-amber-900"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          {bannerMsg.text}
        </div>
      )}

      {/* 3-Column / Responsive Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Column 1: Units & Lessons selector */}
        <div className="lg:col-span-4 space-y-4">
          {/* Units List */}
          <div className="rounded-2xl bg-white border border-slate-200 p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-extrabold text-slate-900">
                1. Chặng học ({units.length})
              </h2>
              <button
                type="button"
                onClick={handleAddUnit}
                className="inline-flex items-center gap-1 rounded-xl bg-emerald-100 text-emerald-800 px-2.5 py-1 text-xs font-extrabold"
              >
                <Plus className="w-3.5 h-3.5" /> Thêm chặng
              </button>
            </div>
            <div className="space-y-1.5">
              {units.map((u, idx) => (
                <div
                  key={u.id}
                  className={`flex items-center gap-1 rounded-xl border p-2 cursor-pointer ${
                    idx === safeUnitIdx
                      ? "border-emerald-500 bg-emerald-50/70"
                      : "border-slate-100 hover:bg-slate-50"
                  }`}
                  onClick={() => {
                    setUnitIdx(idx);
                    setLessonIdx(0);
                    setCardIdx(0);
                  }}
                >
                  <span className="text-lg">{u.emoji}</span>
                  <span className="flex-1 text-xs font-extrabold text-slate-800 truncate">
                    {u.title}
                  </span>
                  <button
                    type="button"
                    aria-label="Lên"
                    onClick={(e) => {
                      e.stopPropagation();
                      onChange({
                        ...curriculum,
                        units: moveItem(units, idx, -1),
                      });
                    }}
                    className="p-1 text-slate-400 hover:text-slate-700"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    aria-label="Xuống"
                    onClick={(e) => {
                      e.stopPropagation();
                      onChange({
                        ...curriculum,
                        units: moveItem(units, idx, 1),
                      });
                    }}
                    className="p-1 text-slate-400 hover:text-slate-700"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  {units.length > 1 && (
                    <button
                      type="button"
                      aria-label="Xóa chặng"
                      onClick={(e) => {
                        e.stopPropagation();
                        onChange({
                          ...curriculum,
                          units: units.filter((_, i) => i !== idx),
                        });
                      }}
                      className="p-1 text-rose-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {currentUnit && (
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <div className="grid grid-cols-4 gap-2">
                  <input
                    value={currentUnit.emoji}
                    onChange={(e) => updateUnit({ emoji: e.target.value })}
                    className="rounded-xl border border-slate-200 px-2 py-1.5 text-center text-sm"
                    placeholder="🌱"
                  />
                  <input
                    value={currentUnit.title}
                    onChange={(e) => updateUnit({ title: e.target.value })}
                    className="col-span-3 rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs font-bold"
                    placeholder="Tên chặng"
                  />
                </div>
                <input
                  value={currentUnit.descriptionVi}
                  onChange={(e) => updateUnit({ descriptionVi: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs"
                  placeholder="Mô tả chặng"
                />
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-bold text-slate-500">Màu:</span>
                  {(["emerald", "sky", "amber", "rose"] as UnitColor[]).map(
                    (col) => (
                      <button
                        key={col}
                        type="button"
                        onClick={() => updateUnit({ color: col })}
                        className={`rounded-lg px-2 py-1 text-[11px] font-bold capitalize border ${
                          currentUnit.color === col
                            ? "border-slate-900 bg-slate-900 text-white"
                            : "border-slate-200 bg-slate-50 text-slate-600"
                        }`}
                      >
                        {col}
                      </button>
                    )
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Lessons List */}
          {currentUnit && (
            <div className="rounded-2xl bg-white border border-slate-200 p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-base font-extrabold text-slate-900">
                  2. Bài học ({lessons.length})
                </h2>
                <button
                  type="button"
                  onClick={handleAddLesson}
                  className="inline-flex items-center gap-1 rounded-xl bg-sky-100 text-sky-800 px-2.5 py-1 text-xs font-extrabold"
                >
                  <Plus className="w-3.5 h-3.5" /> Thêm bài
                </button>
              </div>
              <div className="space-y-1.5">
                {lessons.map((l, idx) => (
                  <div
                    key={l.id}
                    onClick={() => {
                      setLessonIdx(idx);
                      setCardIdx(0);
                    }}
                    className={`flex items-center gap-1.5 rounded-xl border p-2 cursor-pointer ${
                      idx === safeLessonIdx
                        ? "border-sky-500 bg-sky-50/70"
                        : "border-slate-100 hover:bg-slate-50"
                    }`}
                  >
                    <span className="text-base">{l.emoji}</span>
                    <span className="flex-1 text-xs font-extrabold text-slate-800 truncate">
                      {l.title}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateUnit({ lessons: moveItem(lessons, idx, -1) });
                      }}
                      className="p-1 text-slate-400 hover:text-slate-700"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateUnit({ lessons: moveItem(lessons, idx, 1) });
                      }}
                      className="p-1 text-slate-400 hover:text-slate-700"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    {lessons.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateUnit({
                            lessons: lessons.filter((_, i) => i !== idx),
                          });
                        }}
                        className="p-1 text-rose-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {currentLesson && (
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <div className="grid grid-cols-4 gap-2">
                    <input
                      value={currentLesson.emoji}
                      onChange={(e) => updateLesson({ emoji: e.target.value })}
                      className="rounded-xl border border-slate-200 px-2 py-1.5 text-center text-sm"
                    />
                    <input
                      value={currentLesson.title}
                      onChange={(e) => updateLesson({ title: e.target.value })}
                      className="col-span-3 rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs font-bold"
                    />
                  </div>
                  <input
                    value={currentLesson.subtitleVi}
                    onChange={(e) =>
                      updateLesson({ subtitleVi: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs"
                    placeholder="Phụ đề bài học"
                  />
                  <select
                    value={currentLesson.track}
                    onChange={(e) =>
                      updateLesson({ track: e.target.value as LessonTrack })
                    }
                    className="w-full rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs font-bold bg-white"
                  >
                    <option value="phonics">Nhánh: Ghép âm (Phonics)</option>
                    <option value="vocab_sentence">
                      Nhánh: Từ vựng & Câu ngắn
                    </option>
                    <option value="mixed">Nhánh: Tổng hợp</option>
                  </select>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Column 2 & 3: Cards List + Card Editor */}
        <div className="lg:col-span-8 space-y-4">
          {currentLesson && (
            <div className="rounded-2xl bg-white border border-slate-200 p-3.5 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h2 className="font-display text-base font-extrabold text-slate-900">
                  3. Thẻ học trong &ldquo;{currentLesson.title}&rdquo; (
                  {cards.length})
                </h2>
                <button
                  type="button"
                  onClick={handleAddCard}
                  className="inline-flex items-center gap-1 rounded-xl bg-amber-100 text-amber-900 px-3 py-1.5 text-xs font-extrabold"
                >
                  <Plus className="w-3.5 h-3.5" /> Thêm thẻ mới
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {cards.map((c, idx) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCardIdx(idx)}
                    className={`rounded-xl border px-3 py-1.5 text-xs font-extrabold flex items-center gap-1.5 ${
                      idx === safeCardIdx
                        ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                        : "border-slate-200 bg-slate-50 text-slate-700"
                    }`}
                  >
                    <span>{c.text}</span>
                    <span className="text-[10px] opacity-60">({c.type})</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentCard && (
            <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <h3 className="font-display text-base font-extrabold text-slate-900">
                  Chỉnh sửa thẻ: &ldquo;{currentCard.text}&rdquo;
                </h3>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      updateLesson({ cards: moveItem(cards, safeCardIdx, -1) })
                    }
                    className="rounded-lg bg-slate-100 p-1.5 text-slate-600"
                    title="Đưa lên trước"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      updateLesson({ cards: moveItem(cards, safeCardIdx, 1) })
                    }
                    className="rounded-lg bg-slate-100 p-1.5 text-slate-600"
                    title="Đưa ra sau"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  {cards.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        updateLesson({
                          cards: cards.filter((_, i) => i !== safeCardIdx),
                        });
                        setCardIdx(Math.max(0, safeCardIdx - 1));
                      }}
                      className="rounded-lg bg-rose-50 p-1.5 text-rose-600"
                      title="Xóa thẻ"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label className="space-y-1 text-xs">
                  <span className="font-extrabold text-slate-700">Loại thẻ</span>
                  <select
                    value={currentCard.type}
                    onChange={(e) =>
                      updateCard({ type: e.target.value as CardType })
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 font-bold bg-white"
                  >
                    <option value="phonics">Âm Phonics (chữ cái / âm)</option>
                    <option value="word">Từ vựng (Word)</option>
                    <option value="sentence">Câu ngắn (Sentence)</option>
                  </select>
                </label>

                <label className="space-y-1 text-xs">
                  <span className="font-extrabold text-slate-700">
                    Chữ tiếng Anh hiển thị
                  </span>
                  <input
                    value={currentCard.text}
                    onChange={(e) => updateCard({ text: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 font-bold"
                  />
                </label>

                <label className="space-y-1 text-xs">
                  <span className="font-extrabold text-slate-700">
                    Nghĩa tiếng Việt cho bé
                  </span>
                  <input
                    value={currentCard.meaningVi}
                    onChange={(e) => updateCard({ meaningVi: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2"
                  />
                </label>

                <label className="space-y-1 text-xs">
                  <span className="font-extrabold text-slate-700">
                    Phiên âm IPA & Tách vần
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      value={currentCard.ipa}
                      onChange={(e) => updateCard({ ipa: e.target.value })}
                      placeholder="/kæt/"
                      className="rounded-xl border border-slate-200 px-2.5 py-2"
                    />
                    <input
                      value={currentCard.phonicsBreakdown}
                      onChange={(e) =>
                        updateCard({ phonicsBreakdown: e.target.value })
                      }
                      placeholder="c - a - t"
                      className="rounded-xl border border-slate-200 px-2.5 py-2"
                    />
                  </div>
                </label>

                <label className="space-y-1 text-xs md:col-span-2">
                  <span className="font-extrabold text-slate-700">
                    Mẹo phát âm & Đặt miệng tiếng Việt
                  </span>
                  <textarea
                    rows={2}
                    value={currentCard.pronunciationTipVi}
                    onChange={(e) =>
                      updateCard({ pronunciationTipVi: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2"
                  />
                </label>

                <label className="space-y-1 text-xs">
                  <span className="font-extrabold text-slate-700">
                    Cách đọc TTS riêng (tùy chọn, VD: &ldquo;s... sun&rdquo;)
                  </span>
                  <input
                    value={currentCard.spokenText ?? ""}
                    onChange={(e) =>
                      updateCard({
                        spokenText: e.target.value || undefined,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2"
                  />
                </label>

                <label className="space-y-1 text-xs">
                  <span className="font-extrabold text-slate-700">
                    Âm trọng tâm (cách nhau bằng dấu phẩy)
                  </span>
                  <input
                    value={currentCard.focusPhonemes.join(", ")}
                    onChange={(e) =>
                      updateCard({
                        focusPhonemes: e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean),
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2"
                  />
                </label>
              </div>

              {/* Image Picker & Upload */}
              <div className="rounded-2xl bg-amber-50/60 border border-amber-100 p-3 space-y-2.5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs font-extrabold text-slate-800">
                    🖼️ Hình ảnh minh họa
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setGalleryOpen((v) => !v)}
                      className="inline-flex items-center gap-1 rounded-xl bg-white border border-amber-200 px-2.5 py-1.5 text-xs font-extrabold text-amber-900"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      {galleryOpen ? "Đóng kho hình" : "Chọn từ kho có sẵn"}
                    </button>
                    <button
                      type="button"
                      disabled={uploadingKind === "image"}
                      onClick={() => imgUploadRef.current?.click()}
                      className="inline-flex items-center gap-1 rounded-xl bg-white border border-slate-200 px-2.5 py-1.5 text-xs font-extrabold text-slate-700"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      {uploadingKind === "image" ? "Đang tải..." : "Tải ảnh lên"}
                    </button>
                    <input
                      ref={imgUploadRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) void handleUploadFile(f, "image");
                        e.target.value = "";
                      }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <img
                    src={currentCard.imageUrl}
                    alt={currentCard.meaningVi}
                    className="w-16 h-16 rounded-2xl bg-white border border-amber-200 object-contain p-1 shrink-0"
                  />
                  <input
                    value={currentCard.imageUrl}
                    onChange={(e) => updateCard({ imageUrl: e.target.value })}
                    placeholder="/illustrations/cat.svg hoặc https://..."
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs"
                  />
                </div>

                {galleryOpen && (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 pt-1 max-h-52 overflow-y-auto">
                    {BUILT_IN_ILLUSTRATIONS.map((item) => {
                      const active = currentCard.imageUrl === item.url;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            updateCard({ imageUrl: item.url });
                            setGalleryOpen(false);
                          }}
                          className={`rounded-xl border p-1.5 text-center bg-white hover:border-emerald-400 ${
                            active
                              ? "border-emerald-500 ring-2 ring-emerald-200"
                              : "border-slate-200"
                          }`}
                        >
                          <img
                            src={item.url}
                            alt={item.labelVi}
                            className="w-10 h-10 mx-auto object-contain"
                          />
                          <p className="text-[10px] font-bold text-slate-600 truncate mt-0.5">
                            {item.id}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Audio Studio */}
              <div className="rounded-2xl bg-sky-50/60 border border-sky-100 p-3 space-y-2.5">
                <p className="text-xs font-extrabold text-slate-800">
                  🔊 Âm thanh mẫu (AI TTS hoặc tự tải file MP3/WAV)
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Normal audio */}
                  <div className="rounded-xl bg-white border border-sky-100 p-2.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-sky-900">
                        Giọng chuẩn
                      </span>
                      <button
                        type="button"
                        onClick={() => void playCardAudio(currentCard, "normal")}
                        className="inline-flex items-center gap-1 text-xs font-extrabold text-sky-600 hover:underline"
                      >
                        <Volume2 className="w-3.5 h-3.5" /> Nghe thử
                      </button>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        disabled={ttsLoading !== null}
                        onClick={() => void handleGenerateTts("normal")}
                        className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg bg-sky-500 text-white py-1.5 px-2 text-[11px] font-extrabold disabled:opacity-60"
                      >
                        <Sparkles className="w-3 h-3" />
                        {ttsLoading === "normal"
                          ? "Đang tạo..."
                          : "Tạo bằng AI"}
                      </button>
                      <button
                        type="button"
                        onClick={() => audioNormalUploadRef.current?.click()}
                        className="inline-flex items-center gap-1 rounded-lg bg-slate-100 text-slate-700 py-1.5 px-2.5 text-[11px] font-extrabold"
                      >
                        <Upload className="w-3 h-3" /> Upload
                      </button>
                      <input
                        ref={audioNormalUploadRef}
                        type="file"
                        accept="audio/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) void handleUploadFile(f, "audio", "normal");
                          e.target.value = "";
                        }}
                      />
                    </div>
                    <p className="text-[10px] font-semibold text-slate-500 truncate">
                      {currentCard.audioNormalUrl
                        ? `✓ Đã có file: ${currentCard.audioNormalUrl}`
                        : "Mặc định: Giọng trình duyệt (hoạt động sẵn)"}
                    </p>
                  </div>

                  {/* Slow audio */}
                  <div className="rounded-xl bg-white border border-sky-100 p-2.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-amber-900">
                        Giọng đọc chậm
                      </span>
                      <button
                        type="button"
                        onClick={() => void playCardAudio(currentCard, "slow")}
                        className="inline-flex items-center gap-1 text-xs font-extrabold text-amber-700 hover:underline"
                      >
                        <Turtle className="w-3.5 h-3.5" /> Nghe thử
                      </button>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        disabled={ttsLoading !== null}
                        onClick={() => void handleGenerateTts("slow")}
                        className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg bg-amber-400 text-amber-950 py-1.5 px-2 text-[11px] font-extrabold disabled:opacity-60"
                      >
                        <Sparkles className="w-3 h-3" />
                        {ttsLoading === "slow" ? "Đang tạo..." : "Tạo chậm AI"}
                      </button>
                      <button
                        type="button"
                        onClick={() => audioSlowUploadRef.current?.click()}
                        className="inline-flex items-center gap-1 rounded-lg bg-slate-100 text-slate-700 py-1.5 px-2.5 text-[11px] font-extrabold"
                      >
                        <Upload className="w-3 h-3" /> Upload
                      </button>
                      <input
                        ref={audioSlowUploadRef}
                        type="file"
                        accept="audio/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) void handleUploadFile(f, "audio", "slow");
                          e.target.value = "";
                        }}
                      />
                    </div>
                    <p className="text-[10px] font-semibold text-slate-500 truncate">
                      {currentCard.audioSlowUrl
                        ? `✓ Đã có file: ${currentCard.audioSlowUrl}`
                        : "Mặc định: Tự động giảm tốc độ đọc"}
                    </p>
                  </div>
                </div>

                {currentCard.audioNormalUrl && (
                  <p className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                    <Check className="w-3.5 h-3.5" /> Đã sẵn sàng phát audio
                    chất lượng cao
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
