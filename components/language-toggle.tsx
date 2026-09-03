"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { useLanguage } from "@/context/language-context";
import { cn } from "@/lib/utils";
import { Languages } from "lucide-react";

interface LanguageToggleProps {
  className?: string;
  variant?: "pill" | "compact" | "icon";
}

export function LanguageToggle({
  className,
  variant = "pill",
}: LanguageToggleProps) {
  const { locale, setLocale, toggleLocale, isBangla } = useLanguage();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={cn(
          "h-8 sm:h-9 px-2.5 rounded-full bg-card border border-border flex items-center justify-center opacity-70 cursor-default shrink-0",
          className
        )}
        aria-hidden="true"
      >
        <div className="w-8 h-4 rounded bg-muted-foreground/20 animate-pulse" />
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <motion.button
        type="button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleLocale}
        aria-label={isBangla ? "Switch to English" : "বাংলা ভাষায় পরিবর্তন করুন"}
        title={isBangla ? "Switch to English" : "বাংলা ভাষায় পরিবর্তন করুন"}
        className={cn(
          "relative h-8 sm:h-9 px-2.5 rounded-full bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-accent hover:border-border/90 active:bg-accent/80 transition-colors duration-200 cursor-pointer select-none flex items-center gap-1.5 shrink-0 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring font-medium text-xs sm:text-sm",
          className
        )}
      >
        <Languages className="size-3.5 sm:size-4 text-primary" />
        <span className="font-semibold text-foreground">
          {isBangla ? "বাংলা" : "EN"}
        </span>
      </motion.button>
    );
  }

  // Pill segmented design
  return (
    <div
      role="radiogroup"
      aria-label="Select Language"
      className={cn(
        "h-8 sm:h-9 p-0.5 rounded-full bg-card border border-border flex items-center shrink-0 relative select-none",
        className
      )}
    >
      <button
        type="button"
        role="radio"
        aria-checked={locale === "en"}
        onClick={() => setLocale("en")}
        className={cn(
          "relative z-10 px-1.5 sm:px-2.5 h-full rounded-full text-[11px] sm:text-xs font-semibold transition-colors duration-200 flex items-center justify-center cursor-pointer",
          locale === "en"
            ? "text-primary-foreground font-bold"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        {locale === "en" && (
          <motion.div
            layoutId="lang-active-pill"
            className="absolute inset-0 bg-primary rounded-full -z-10 shadow-xs"
            transition={{ type: "spring", stiffness: 450, damping: 35 }}
          />
        )}
        EN
      </button>

      <button
        type="button"
        role="radio"
        aria-checked={locale === "bn"}
        onClick={() => setLocale("bn")}
        className={cn(
          "relative z-10 px-1.5 sm:px-2.5 h-full rounded-full text-[11px] sm:text-xs font-semibold transition-colors duration-200 flex items-center justify-center cursor-pointer",
          locale === "bn"
            ? "text-primary-foreground font-bold"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        {locale === "bn" && (
          <motion.div
            layoutId="lang-active-pill"
            className="absolute inset-0 bg-primary rounded-full -z-10 shadow-xs"
            transition={{ type: "spring", stiffness: 450, damping: 35 }}
          />
        )}
        বাং
      </button>
    </div>
  );
}
