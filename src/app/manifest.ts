import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mcpatenz Bill Tracker",
    short_name: "Mcpatenz Bill Tracker",
    description:
      "Track every bill, see what is due, and get automatic email reminders before due dates.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#070b14",
    theme_color: "#070b14",
    orientation: "portrait-primary",
    categories: ["finance", "productivity", "utilities"],
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
