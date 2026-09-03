"use client";

import * as React from "react";
import { Locale, TranslationDictionary } from "@/lib/locales/types";
import { en } from "@/lib/locales/en";
import { bn } from "@/lib/locales/bn";

const dictionaries: Record<Locale, TranslationDictionary> = {
  en,
  bn,
};

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: TranslationDictionary;
  isBangla: boolean;
}

const LanguageContext = React.createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = "housemint_locale_preference";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = React.useState<Locale>("en");
  const [isInitialized, setIsInitialized] = React.useState(false);

  // Load locale from localStorage on mount
  React.useEffect(() => {
    try {
      const savedLocale = localStorage.getItem(STORAGE_KEY) as Locale | null;
      if (savedLocale && (savedLocale === "en" || savedLocale === "bn")) {
        setLocaleState(savedLocale);
        document.documentElement.lang = savedLocale;
      }
    } catch {
      // Fallback for SSR/private browsing
    } finally {
      setIsInitialized(true);
    }
  }, []);

  const setLocale = React.useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem(STORAGE_KEY, newLocale);
      document.documentElement.lang = newLocale;
    } catch {
      // Ignore localStorage write errors
    }
  }, []);

  const toggleLocale = React.useCallback(() => {
    setLocale(locale === "en" ? "bn" : "en");
  }, [locale, setLocale]);

  const value = React.useMemo<LanguageContextValue>(
    () => ({
      locale,
      setLocale,
      toggleLocale,
      t: dictionaries[locale] || en,
      isBangla: locale === "bn",
    }),
    [locale, setLocale, toggleLocale]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = React.useContext(LanguageContext);
  if (!context) {
    // Return a safe default fallback if used outside provider during initial render
    return {
      locale: "en" as Locale,
      setLocale: () => {},
      toggleLocale: () => {},
      t: en,
      isBangla: false,
    };
  }
  return context;
}
