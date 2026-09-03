import * as React from "react";
import { cn, formatBDT } from "@/lib/utils";
import { useLanguage } from "@/context/language-context";

export interface CurrencyAmountProps extends React.HTMLAttributes<HTMLSpanElement> {
  amount: number;
  showSign?: boolean;
  intent?: "positive" | "negative" | "neutral" | "auto";
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "display";
  forceBengaliNumerals?: boolean;
  forceEnglishNumerals?: boolean;
}

export function CurrencyAmount({
  amount,
  showSign = false,
  intent = "auto",
  size = "md",
  forceBengaliNumerals,
  forceEnglishNumerals,
  className,
  ...props
}: CurrencyAmountProps) {
  const { isBangla } = useLanguage();
  const useBengali = forceBengaliNumerals ?? (forceEnglishNumerals ? false : isBangla);

  let colorClass = "text-foreground";
  if (intent === "positive" || (intent === "auto" && amount > 0)) {
    colorClass = "text-positive";
  } else if (intent === "negative" || (intent === "auto" && amount < 0)) {
    colorClass = "text-destructive";
  } else if (intent === "neutral") {
    colorClass = "text-muted-foreground";
  }

  const sizeClasses = {
    xs: "text-xs font-medium",
    sm: "text-sm font-medium",
    md: "text-base font-semibold",
    lg: "text-xl font-bold",
    xl: "text-2xl font-bold",
    display: "text-display font-extrabold",
  }[size];

  const formattedValue = formatBDT(amount, {
    includeSymbol: false,
    showSign: false,
    useBengaliNumerals: useBengali,
  });

  const sign = showSign && amount > 0 ? "+" : amount < 0 ? "-" : "";

  return (
    <span
      className={cn(
        "font-numeral tabular-nums inline-flex items-baseline tracking-tight",
        colorClass,
        sizeClasses,
        className
      )}
      {...props}
    >
      <span className="opacity-90 mr-0.5">{sign}৳</span>
      <span>{formattedValue}</span>
    </span>
  );
}
