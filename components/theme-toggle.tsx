"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { flushSync } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
}

/**
 * Circular Reveal Animation Settings:
 * Optimized for silky 60/120fps mobile PWA & desktop performance.
 */
export const THEME_TRANSITION_DURATION_MS = 400;
export const THEME_TRANSITION_EASING = "cubic-bezier(0.16, 1, 0.3, 1)";

export function ThemeToggle({ className }: ThemeToggleProps) {
  const [mounted, setMounted] = React.useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  // Avoid hydration mismatch by waiting until mounted on client
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={cn(
          "size-8 sm:size-9 rounded-full bg-card border border-border flex items-center justify-center opacity-70 cursor-default shrink-0",
          className,
        )}
        aria-hidden="true"
      >
        <div className="size-4 rounded-full bg-muted-foreground/30 animate-pulse" />
      </div>
    );
  }

  const isDark = resolvedTheme === "dark";

  const handleToggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    const nextTheme = isDark ? "light" : "dark";

    const isReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Graceful fallback for browsers without View Transitions or users who prefer reduced motion
    if (
      typeof document === "undefined" ||
      !("startViewTransition" in document) ||
      !document.startViewTransition ||
      isReducedMotion
    ) {
      setTheme(nextTheme);
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const x =
      rect.width > 0 ? rect.left + rect.width / 2 : window.innerWidth / 2;
    const y =
      rect.height > 0 ? rect.top + rect.height / 2 : window.innerHeight / 2;

    // Viewport dimensions accounting for mobile PWA dynamic toolbars & safe areas
    const viewportWidth =
      typeof window !== "undefined"
        ? Math.max(window.innerWidth, document.documentElement.clientWidth || 0)
        : 800;
    const viewportHeight =
      typeof window !== "undefined"
        ? Math.max(window.innerHeight, document.documentElement.clientHeight || 0)
        : 600;

    const maxX = Math.max(x, viewportWidth - x);
    const maxY = Math.max(y, viewportHeight - y);
    // Add extra padding to guarantee the circle completely clears the screen corners
    const endRadius = Math.hypot(maxX, maxY) + 24;

    const transition = document.startViewTransition(() => {
      flushSync(() => {
        document.documentElement.classList.remove("light", "dark");
        document.documentElement.classList.add(nextTheme);
        setTheme(nextTheme);
      });
    });

    transition.ready
      .then(() => {
        try {
          document.documentElement.animate(
            {
              clipPath: [
                `circle(0px at ${x}px ${y}px)`,
                `circle(${endRadius}px at ${x}px ${y}px)`,
              ],
            },
            {
              duration: THEME_TRANSITION_DURATION_MS,
              easing: THEME_TRANSITION_EASING,
              pseudoElement: "::view-transition-new(root)",
            },
          );
        } catch {
          // Gracefully fallback if WAAPI pseudoElement fails
        }
      })
      .catch(() => {
        // Transition skipped or aborted
      });
  };

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleToggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "relative size-8 sm:size-9 rounded-full bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-accent hover:border-border/90 active:bg-accent/80 transition-colors duration-200 cursor-pointer select-none flex items-center justify-center shrink-0 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.div
            key="moon"
            initial={{ opacity: 0, rotate: -60, scale: 0.6 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 60, scale: 0.6 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center justify-center text-primary"
          >
            <Moon className="size-4 sm:size-4.5" />
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ opacity: 0, rotate: 60, scale: 0.6 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: -60, scale: 0.6 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center justify-center text-warning"
          >
            <Sun className="size-4 sm:size-4.5" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
