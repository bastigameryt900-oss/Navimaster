import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Aurora Studios",
    short_name: "Aurora",
    description: SITE.description,
    lang: "es",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0e0d13",
    theme_color: "#0e0d13",
    categories: ["business", "productivity", "design"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Cotizar", url: "/cotizar", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Servicios", url: "/servicios", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "WhatsApp", url: "/contacto", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
