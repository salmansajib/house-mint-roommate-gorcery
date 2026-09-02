"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "motion/react";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const [mounted, setMounted] = React.useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const transitionTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Avoid hydration mismatch by waiting until mounted on client
  React.useEffect(() => {
    setMounted(true);
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
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

  const handleToggle = () => {
    const nextTheme = isDark ? "light" : "dark";

    if (typeof document !== "undefined") {
      const root = document.documentElement;
      root.classList.add("theme-transition");
      setTheme(nextTheme);

      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
      transitionTimeoutRef.current = setTimeout(() => {
        root.classList.remove("theme-transition");
        transitionTimeoutRef.current = null;
      }, 350);
    } else {
      setTheme(nextTheme);
    }
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
