"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider, useTheme, type ThemeProviderProps } from "next-themes";

// Filter out React 19 dev false-positive error for next-themes inline script tag
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  const originalError = console.error;
  console.error = (...args: unknown[]) => {
    const isScriptWarning = args.some(
      (arg) => typeof arg === "string" && arg.includes("Encountered a script tag")
    );
    if (isScriptWarning) return;
    originalError.apply(console, args);
  };
}

/**
 * Keeps mobile PWA status bar & browser chrome dynamically in sync with the active theme.
 * Dark background: #080c0a (Obsidian Mint)
 * Light background: #f6f7f4
 */
function MetaThemeColorSync() {
  const { resolvedTheme } = useTheme();

  React.useEffect(() => {
    if (!resolvedTheme) return;
    const color = resolvedTheme === "light" ? "#f6f7f4" : "#080c0a";
    const metaTags = document.querySelectorAll('meta[name="theme-color"]');
    if (metaTags.length > 0) {
      metaTags.forEach((meta) => {
        meta.setAttribute("content", color);
      });
    } else {
      const meta = document.createElement("meta");
      meta.name = "theme-color";
      meta.content = color;
      document.head.appendChild(meta);
    }
  }, [resolvedTheme]);

  return null;
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      <MetaThemeColorSync />
      {children}
    </NextThemesProvider>
  );
}
