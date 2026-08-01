import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Road",
    short_name: "Road",
    description: "رفيقك في الإنجاز",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f2f4f6",
    theme_color: "#1e4d6b",
    icons: [
      { src: "/icon", sizes: "180x180", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png", purpose: "maskable" },
    ],
  };
}
