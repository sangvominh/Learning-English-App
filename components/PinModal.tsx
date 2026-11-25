"use client";

import { useEffect, useState } from "react";
import { Delete, Lock, X } from "lucide-react";

interface PinModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (pin: string) => void;
}

export function PinModal({ open, onClose, onSuccess }: PinModalProps) {
  if (!open) return null;
  return <PinModalInner onClose={onClose} onSuccess={onSuccess} />;
}

function PinModalInner({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: (pin: string) => void;
}) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);
  const [isDefaultPin, setIsDefaultPin] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/status")
      .then((r) => r.json())
      .then((data: { isUsingDefaultPin?: boolean }) => {
        if (active) setIsDefaultPin(Boolean(data.isUsingDefaultPin));
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const verifyPin = async (candidate: string) => {
    setChecking(true);
    setError("");
    try {
      const res = await fetch("/api/admin/verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: candidate }),
      });
      const data = (await res.json()) as { ok?: boolean };
      if (data.ok) {
        onSuccess(candidate);
      } else {
        setError("Mã PIN chưa đúng. Thử lại nhé!");
        setPin("");
      }
    } catch {
      setError("Không kiểm tra được PIN. Kiểm tra lại kết nối.");
      setPin("");
    } finally {
      setChecking(false);
    }
  };

  const pressDigit = (d: string) => {
    if (checking || pin.length >= 6) return;
    const next = pin + d;
    setPin(next);
    setError("");
    if (next.length === 4) {
      void verifyPin(next);
    }
  };

  const handleBackspace = () => {
    if (checking) return;
    setPin((prev) => prev.slice(0, -1));
    setError("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-xs rounded-3xl bg-white p-5 shadow-2xl border-2 border-amber-100 animate-pop-in">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-slate-800">
            <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-extrabold leading-tight">
                Góc Phụ Huynh
              </h2>
              <p className="text-xs text-slate-500">Nhập mã PIN để quản trị</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex justify-center gap-3 my-4">
          {[0, 1, 2, 3].map((idx) => {
            const filled = idx < pin.length;
            return (
              <div
                key={idx}
                className={`w-11 h-12 rounded-2xl border-2 flex items-center justify-center text-xl font-extrabold transition-all ${
                  filled
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 bg-slate-50 text-slate-300"
                }`}
              >
                {filled ? "●" : ""}
              </div>
            );
          })}
        </div>

        {error && (
          <p className="text-center text-xs font-bold text-rose-600 mb-3">
            {error}
          </p>
        )}

        {isDefaultPin && (
          <p className="text-center text-[11px] font-semibold text-amber-700 bg-amber-50 rounded-xl py-1 px-2 mb-3">
            PIN mặc định hiện tại: <span className="font-extrabold">1234</span>
          </p>
        )}

        <div className="grid grid-cols-3 gap-2">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
            <button
              key={d}
              type="button"
              disabled={checking}
              onClick={() => pressDigit(d)}
              className="h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-lg font-extrabold text-slate-800 transition"
            >
              {d}
            </button>
          ))}
          <button
            type="button"
            onClick={onClose}
            className="h-12 rounded-2xl bg-slate-50 text-xs font-bold text-slate-500 hover:bg-slate-100"
          >
            Hủy
          </button>
          <button
            type="button"
            disabled={checking}
            onClick={() => pressDigit("0")}
            className="h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-lg font-extrabold text-slate-800 transition"
          >
            0
          </button>
          <button
            type="button"
            disabled={checking}
            onClick={handleBackspace}
            aria-label="Xóa"
            className="h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 active:scale-95 flex items-center justify-center text-slate-700 transition"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
