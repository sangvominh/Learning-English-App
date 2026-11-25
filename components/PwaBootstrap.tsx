"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const emptySubscribe = () => () => {};

export function PwaBootstrap() {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  const isStandalone = useSyncExternalStore(
    emptySubscribe,
    () =>
      window.matchMedia("(display-mode: standalone)").matches ||
      Boolean((navigator as unknown as { standalone?: boolean }).standalone) ||
      (() => {
        try {
          return window.sessionStorage.getItem("sb_install_dismissed") === "1";
        } catch {
          return false;
        }
      })(),
    () => true
  );

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/", updateViaCache: "none" })
        .catch(() => {
          // Ignore SW registration failure on plain HTTP LAN
        });
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () =>
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  if (isStandalone || dismissed || !installPrompt) {
    return null;
  }

  const handleInstall = async () => {
    try {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setInstallPrompt(null);
      }
    } catch {
      setDismissed(true);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    try {
      window.sessionStorage.setItem("sb_install_dismissed", "1");
    } catch {
      // ignore
    }
  };

  return (
    <div className="fixed top-2 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-1.5rem)] max-w-md animate-pop-in">
      <div className="flex items-center justify-between gap-2 rounded-2xl bg-emerald-600 text-white px-3.5 py-2.5 shadow-lg border-2 border-emerald-400">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xl shrink-0">🐝</span>
          <p className="text-xs font-bold leading-tight truncate">
            Thêm SunnyBee ra màn hình chính để học như app!
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleInstall}
            className="inline-flex items-center gap-1 rounded-xl bg-amber-300 text-amber-950 px-2.5 py-1.5 text-xs font-extrabold shadow-sm active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            Cài đặt
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Đóng gợi ý cài đặt"
            className="p-1 rounded-lg hover:bg-emerald-700/60"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
