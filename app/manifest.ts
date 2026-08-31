import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "HouseMint — Shared Roommate Expense Tracker",
    short_name: "HouseMint",
    description:
      "Lightweight shared grocery and household expense tracker for roommates",
    start_url: "/",
    display: "standalone",
    background_color: "#080c0a",
    theme_color: "#080c0a",
    orientation: "portrait",
    scope: "/",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Add Expense",
        short_name: "Add",
        description: "Quickly record a new shared expense",
        url: "/?action=add-expense",
        icons: [{ src: "/icons/icon-192x192.png", sizes: "192x192" }],
      },
      {
        name: "Settle Up",
        short_name: "Settle",
        description: "Calculate and record balance settlement",
        url: "/?action=settle-up",
        icons: [{ src: "/icons/icon-192x192.png", sizes: "192x192" }],
      },
    ],
    categories: ["finance", "productivity", "utilities"],
  };
}
