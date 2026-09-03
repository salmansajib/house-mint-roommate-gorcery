import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns";
import { bn as bnLocale, enUS as enLocale } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const BENGALI_DIGITS: Record<string, string> = {
  "0": "০",
  "1": "১",
  "2": "২",
  "3": "৩",
  "4": "৪",
  "5": "৫",
  "6": "৬",
  "7": "৭",
  "8": "৮",
  "9": "৯",
};

/**
 * Convert standard English digits into Bengali numerals
 * e.g., "1,500" -> "১,৫০০"
 */
export function toBengaliNumerals(input: string | number): string {
  const str = String(input);
  return str.replace(/[0-9]/g, (char) => BENGALI_DIGITS[char] || char);
}

/**
 * Format a number as Bangladeshi Taka (BDT)
 * e.g., 15000 -> "15,000" or "১৫,০০০"
 */
export function formatBDT(
  amount: number,
  options?: {
    includeSymbol?: boolean;
    showSign?: boolean;
    minimumFractionDigits?: number;
    useBengaliNumerals?: boolean;
  }
): string {
  const {
    includeSymbol = true,
    showSign = false,
    minimumFractionDigits = amount % 1 !== 0 ? 2 : 0,
    useBengaliNumerals = false,
  } = options || {};

  const absAmount = Math.abs(amount);
  let formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits,
    maximumFractionDigits: 2,
  }).format(absAmount);

  if (useBengaliNumerals) {
    formatted = toBengaliNumerals(formatted);
  }

  const sign = showSign && amount > 0 ? "+" : amount < 0 ? "-" : "";
  const symbol = includeSymbol ? "৳" : "";

  return `${sign}${symbol}${formatted}`;
}

/**
 * Localized date formatting helper
 */
export function formatDateLocalized(
  date: Date | string | number,
  locale: "en" | "bn" = "en",
  pattern: string = "MMM d, yyyy"
): string {
  const dateObj = typeof date === "object" ? date : new Date(date);
  if (isNaN(dateObj.getTime())) return "";

  const dateFnsLocale = locale === "bn" ? bnLocale : enLocale;
  const formatted = format(dateObj, pattern, { locale: dateFnsLocale });

  return locale === "bn" ? toBengaliNumerals(formatted) : formatted;
}

/**
 * Localized relative time formatter (e.g. "2 days ago" / "২ দিন আগে")
 */
export function formatRelativeTimeLocalized(
  date: Date | string | number,
  locale: "en" | "bn" = "en"
): string {
  const dateObj = typeof date === "object" ? date : new Date(date);
  if (isNaN(dateObj.getTime())) return "";

  if (isToday(dateObj)) {
    return locale === "bn" ? "আজ" : "Today";
  }
  if (isYesterday(dateObj)) {
    return locale === "bn" ? "গতকাল" : "Yesterday";
  }

  const dateFnsLocale = locale === "bn" ? bnLocale : enLocale;
  const distance = formatDistanceToNow(dateObj, {
    addSuffix: true,
    locale: dateFnsLocale,
  });

  return locale === "bn" ? toBengaliNumerals(distance) : distance;
}
