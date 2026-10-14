import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "FocusTrack",
    short_name: "FocusTrack",
    description: "Personal work intelligence and execution tracker",
    start_url: "/",
    scope: "/",
    display: "standalone",
    // A manifest has no dark variant; the page's theme-color meta takes over once it loads.
    background_color: "#f2f8fa",
    theme_color: "#f2f8fa",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icon-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
