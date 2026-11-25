import type { Metadata, Viewport } from "next";
import { PwaBootstrap } from "@/components/PwaBootstrap";
import "./globals.css";

export const metadata: Metadata = {
  title: "SunnyBee English — Học Tiếng Anh Lớp 3",
  description:
    "App học tiếng Anh gọn tiện cho bé lớp 3 mất gốc: Phonics, Từ vựng, Chấm phát âm AI & Ôn tập khoa học SRS.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SunnyBee",
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#FFFBF2",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="vi" className="h-full antialiased">
      <body className="min-h-full bg-[#FFFBF2] text-[#1F2937] font-sans selection:bg-emerald-200 selection:text-emerald-950">
        <PwaBootstrap />
        {children}
      </body>
    </html>
  );
}
