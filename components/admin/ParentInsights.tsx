"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Download, Trash2 } from "lucide-react";
import {
  exportLearnerSnapshot,
  getAllProgress,
  resetAllLearnerData,
} from "@/lib/learner-db";
import { flattenCards } from "@/lib/seed-curriculum";
import { computeMasteryLevel, formatIntervalVi, isCardDue } from "@/lib/srs";
import type { CurriculumData, LearnerCardProgress } from "@/lib/types";

export function ParentInsights({
  curriculum,
}: {
  curriculum: CurriculumData;
}) {
  const [progressMap, setProgressMap] = useState<
    Record<string, LearnerCardProgress>
  >({});
  const [nowMs, setNowMs] = useState<number | null>(null);

  const loadStats = async () => {
    const prog = await getAllProgress();
    setProgressMap(prog);
    setNowMs(Date.now());
  };

  useEffect(() => {
    let active = true;
    getAllProgress().then((prog) => {
      if (!active) return;
      setProgressMap(prog);
      setNowMs(Date.now());
    });
    return () => {
      active = false;
    };
  }, []);

  const allCards = useMemo(() => flattenCards(curriculum), [curriculum]);

  const stats = useMemo(() => {
    const entries = Object.values(progressMap).filter((p) => p.attempts > 0);
    const nowDate = nowMs !== null ? new Date(nowMs) : null;
    const dueNow = nowDate
      ? entries.filter((p) => isCardDue(p, nowDate)).length
      : 0;
    const spoken = entries.filter((p) => p.lastSpeakingScore !== undefined);
    const avgScore =
      spoken.length > 0
        ? Math.round(
            spoken.reduce((sum, p) => sum + (p.lastSpeakingScore ?? 0), 0) /
              spoken.length
          )
        : null;

    const weakCards = allCards
      .map(({ card }) => ({
        card,
        progress: progressMap[card.id],
      }))
      .filter(
        ({ progress }) =>
          progress &&
          progress.attempts > 0 &&
          ((progress.lastSpeakingScore !== undefined &&
            progress.lastSpeakingScore < 75) ||
            progress.fsrs.lapses > 0 ||
            Boolean(progress.lastMistakeNoteVi))
      )
      .slice(0, 6);

    return {
      studiedCount: entries.length,
      dueNow,
      avgScore,
      weakCards,
    };
  }, [allCards, progressMap, nowMs]);

  const handleExportProgress = async () => {
    const snapshot = await exportLearnerSnapshot();
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sunnybee-progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = async () => {
    if (
      window.confirm(
        "Xóa toàn bộ tiến độ và lịch ôn SRS trên thiết bị này?"
      )
    ) {
      await resetAllLearnerData();
      await loadStats();
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-sky-50 border border-sky-200 p-3 text-xs font-semibold text-sky-900">
        Dữ liệu tiến độ & lịch ôn SRS được lưu trực tiếp trên thiết bị bé học.
        Mở mục này trên điện thoại của bé để theo dõi chính xác nhất.
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-2xl bg-white border border-slate-200 p-3.5">
          <p className="text-xs font-bold text-slate-500">Thẻ đã học</p>
          <p className="font-display text-2xl font-extrabold text-emerald-700 mt-1">
            {stats.studiedCount}/{allCards.length}
          </p>
        </div>
        <div className="rounded-2xl bg-white border border-slate-200 p-3.5">
          <p className="text-xs font-bold text-slate-500">Cần ôn hôm nay</p>
          <p className="font-display text-2xl font-extrabold text-orange-600 mt-1">
            {stats.dueNow} thẻ
          </p>
        </div>
        <div className="rounded-2xl bg-white border border-slate-200 p-3.5">
          <p className="text-xs font-bold text-slate-500">Điểm phát âm TB</p>
          <p className="font-display text-2xl font-extrabold text-sky-700 mt-1">
            {stats.avgScore !== null ? `${stats.avgScore}/100` : "Chưa có"}
          </p>
        </div>
      </div>

      {/* Weak Spots */}
      <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-3">
        <h2 className="font-display text-base font-extrabold text-slate-900 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-orange-500" />
          Âm & Từ cần luyện thêm
        </h2>
        {stats.weakCards.length === 0 ? (
          <p className="text-xs font-semibold text-slate-500">
            Chưa ghi nhận âm hoặc từ nào cần chú ý trên thiết bị này.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {stats.weakCards.map(({ card, progress }) => (
              <div
                key={card.id}
                className="rounded-xl border border-orange-100 bg-orange-50/50 p-3 space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-display font-extrabold text-slate-900">
                    {card.text}{" "}
                    <span className="text-xs font-normal text-slate-500">
                      ({card.meaningVi})
                    </span>
                  </span>
                  {progress?.lastSpeakingScore !== undefined && (
                    <span className="rounded-lg bg-white px-2 py-0.5 text-[11px] font-extrabold text-orange-700 border border-orange-200">
                      Nói: {progress.lastSpeakingScore}/100
                    </span>
                  )}
                </div>
                {progress?.lastMistakeNoteVi && (
                  <p className="text-xs text-slate-700">
                    {progress.lastMistakeNoteVi}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Full SRS Table */}
      <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="font-display text-base font-extrabold text-slate-900">
            Chi tiết lịch ôn SRS từng thẻ
          </h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void handleExportProgress()}
              className="inline-flex items-center gap-1 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-extrabold text-slate-700"
            >
              <Download className="w-3.5 h-3.5" /> Xuất báo cáo JSON
            </button>
            <button
              type="button"
              onClick={() => void handleReset()}
              className="inline-flex items-center gap-1 rounded-xl bg-rose-50 px-3 py-1.5 text-xs font-extrabold text-rose-700"
            >
              <Trash2 className="w-3.5 h-3.5" /> Đặt lại tiến độ
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500">
                <th className="py-2 pr-3">Thẻ</th>
                <th className="py-2 pr-3">Mức độ</th>
                <th className="py-2 pr-3">Lần ôn</th>
                <th className="py-2 pr-3">Điểm nói</th>
                <th className="py-2">Lịch ôn tiếp theo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allCards.map(({ card }) => {
                const p = progressMap[card.id];
                const mastery = computeMasteryLevel(p);
                const badgeMap = {
                  new: "bg-slate-100 text-slate-600",
                  learning: "bg-amber-100 text-amber-800",
                  review: "bg-sky-100 text-sky-800",
                  mastered: "bg-emerald-100 text-emerald-800",
                };
                const labelMap = {
                  new: "Chưa học",
                  learning: "Đang nhớ",
                  review: "Đang ôn",
                  mastered: "Thuộc chắc",
                };
                return (
                  <tr key={card.id}>
                    <td className="py-2 pr-3 font-extrabold text-slate-800">
                      {card.text}
                    </td>
                    <td className="py-2 pr-3">
                      <span
                        className={`rounded-lg px-2 py-0.5 text-[11px] font-bold ${badgeMap[mastery]}`}
                      >
                        {labelMap[mastery]}
                      </span>
                    </td>
                    <td className="py-2 pr-3">{p?.attempts ?? 0}</td>
                    <td className="py-2 pr-3">
                      {p?.lastSpeakingScore !== undefined
                        ? `${p.lastSpeakingScore}/100`
                        : "—"}
                    </td>
                    <td className="py-2 font-semibold text-slate-600">
                      {p && p.attempts > 0 && nowMs !== null
                        ? formatIntervalVi(p.fsrs.due, new Date(nowMs))
                        : "Chưa xếp lịch"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
