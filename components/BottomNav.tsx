"use client";

import Link from "next/link";
import { BookOpen, Layers, Repeat } from "lucide-react";

interface BottomNavProps {
  active: "learn" | "review" | "games";
  dueCount?: number;
}

export function BottomNav({ active, dueCount = 0 }: BottomNavProps) {
  const items = [
    {
      id: "learn" as const,
      href: "/",
      label: "Bài học",
      icon: BookOpen,
      badge: 0,
    },
    {
      id: "review" as const,
      href: "/review",
      label: "Ôn tập",
      icon: Repeat,
      badge: dueCount,
    },
    {
      id: "games" as const,
      href: "/games",
      label: "Luyện tập",
      icon: Layers,
      badge: 0,
    },
  ];

  return (
    <nav
      aria-label="Điều hướng chính"
      className="fixed bottom-0 left-0 right-0 z-30 flex justify-center pointer-events-none"
    >
      <div className="w-full max-w-md bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 pt-1.5 pb-safe pointer-events-auto">
        <div className="grid grid-cols-3 gap-2">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`relative flex flex-col items-center justify-center gap-0.5 py-2 rounded-xl transition-colors ${
                  isActive
                    ? "bg-emerald-50 text-emerald-800"
                    : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                <div className="relative">
                  <Icon
                    className={`w-5 h-5 ${
                      isActive ? "stroke-[2.5]" : "stroke-[2]"
                    }`}
                  />
                  {item.badge > 0 && (
                    <span className="absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] px-1 rounded-full bg-orange-500 text-white text-[10px] font-extrabold flex items-center justify-center">
                      {item.badge > 99 ? "99+" : item.badge}
                    </span>
                  )}
                </div>
                <span
                  className={`text-xs ${
                    isActive ? "font-extrabold" : "font-semibold"
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
