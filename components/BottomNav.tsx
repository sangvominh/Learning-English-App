"use client";

import Link from "next/link";
import { BookOpen, Gamepad2, Repeat } from "lucide-react";

interface BottomNavProps {
  active: "learn" | "review" | "games";
  dueCount?: number;
}

export function BottomNav({ active, dueCount = 0 }: BottomNavProps) {
  const items = [
    {
      id: "learn" as const,
      href: "/",
      label: "Học bài",
      icon: BookOpen,
      badge: 0,
    },
    {
      id: "review" as const,
      href: "/review",
      label: "Ôn SRS",
      icon: Repeat,
      badge: dueCount,
    },
    {
      id: "games" as const,
      href: "/games",
      label: "Trò chơi",
      icon: Gamepad2,
      badge: 0,
    },
  ];

  return (
    <nav
      aria-label="Điều hướng chính"
      className="fixed bottom-0 left-0 right-0 z-30 flex justify-center pointer-events-none"
    >
      <div className="w-full max-w-md bg-white/95 backdrop-blur-md border-t-2 border-amber-100 shadow-[0_-6px_24px_rgba(15,23,42,0.06)] px-3 pt-2 pb-safe pointer-events-auto">
        <div className="grid grid-cols-3 gap-2">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`relative flex flex-col items-center justify-center gap-0.5 py-2 rounded-2xl transition-colors ${
                  isActive
                    ? "bg-emerald-100 text-emerald-800"
                    : "text-slate-500 hover:bg-amber-50/70"
                }`}
              >
                <div className="relative">
                  <Icon
                    className={`w-6 h-6 ${
                      isActive ? "stroke-[2.5]" : "stroke-[2]"
                    }`}
                  />
                  {item.badge > 0 && (
                    <span className="absolute -top-1.5 -right-2.5 min-w-[20px] h-5 px-1 rounded-full bg-orange-500 text-white text-[11px] font-extrabold flex items-center justify-center shadow-sm">
                      {item.badge > 99 ? "99+" : item.badge}
                    </span>
                  )}
                </div>
                <span
                  className={`text-xs ${
                    isActive ? "font-extrabold" : "font-bold"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
