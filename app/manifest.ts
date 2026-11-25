import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SunnyBee English — Học Tiếng Anh Lớp 3",
    short_name: "SunnyBee",
    description:
      "App học tiếng Anh cho bé lớp 3 mất gốc: Phonics, Từ vựng, Chấm phát âm & Ôn tập SRS",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#FFFBF2",
    theme_color: "#10B981",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
