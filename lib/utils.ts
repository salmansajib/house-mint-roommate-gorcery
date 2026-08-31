import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as Bangladeshi Taka (BDT)
 * e.g., 15000 -> "15,000"
 */
export function formatBDT(
  amount: number,
  options?: {
    includeSymbol?: boolean;
    showSign?: boolean;
    minimumFractionDigits?: number;
  }
): string {
  const {
    includeSymbol = true,
    showSign = false,
    minimumFractionDigits = amount % 1 !== 0 ? 2 : 0,
  } = options || {};

  const absAmount = Math.abs(amount);
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits,
    maximumFractionDigits: 2,
  }).format(absAmount);

  const sign = showSign && amount > 0 ? "+" : amount < 0 ? "-" : "";
  const symbol = includeSymbol ? "৳" : "";

  return `${sign}${symbol}${formatted}`;
}
