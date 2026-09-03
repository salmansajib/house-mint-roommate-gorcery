"use client";

import * as React from "react";
import { motion } from "motion/react";
import { useExpenses } from "@/context/expense-context";
import { useLanguage } from "@/context/language-context";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CurrencyAmount } from "@/components/ui/currency-amount";
import { CATEGORY_META } from "@/lib/balance";
import { toBengaliNumerals } from "@/lib/utils";
import { ShoppingBag, Home, Zap, Flame, Wifi, Tag } from "lucide-react";
import { listContainerVariants, listItemVariants, premiumEase } from "@/lib/animations";

const ICON_MAP: Record<string, React.ElementType> = {
  ShoppingBag,
  Home,
  Zap,
  Flame,
  Wifi,
  Tag,
};

export function CategoryBreakdownSkeleton() {
  return (
    <Card className="h-full border-border bg-card">
      <CardHeader className="p-4 sm:p-5 pb-3">
        <div className="space-y-1.5">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3 w-52" />
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-5 pt-0 space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="space-y-2 p-2 rounded-xl bg-card/60 border border-border/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="size-6 rounded-lg" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function CategoryBreakdown() {
  const { categoryBreakdown, selectedCategory, setSelectedCategory, isLoaded } =
    useExpenses();
  const { t, isBangla } = useLanguage();

  if (!isLoaded) {
    return <CategoryBreakdownSkeleton />;
  }

  return (
    <Card className="h-full border-border bg-card">
      <CardHeader className="p-4 sm:p-5 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold">{t.dashboard.breakdownByCategory}</CardTitle>
            <CardDescription className="text-xs">
              {isBangla ? "মেসের খাতওয়ারী ব্যয়ের বিন্যাস" : "Household spending distribution"}
            </CardDescription>
          </div>
          {selectedCategory !== "all" && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => setSelectedCategory("all")}
              className="text-xs text-primary hover:underline font-medium cursor-pointer"
            >
              {t.common.clear}
            </motion.button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-5 pt-0 space-y-3">
        {categoryBreakdown.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            {isBangla ? "এই ফিল্টারে কোনো খরচ পাওয়া যায়নি।" : "No expenses logged for this filter."}
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate="show"
            variants={listContainerVariants}
            className="space-y-2.5"
          >
            {categoryBreakdown.map((item, idx) => {
              const meta = CATEGORY_META[item.category];
              const Icon = ICON_MAP[meta?.icon || "Tag"] || Tag;
              const isSelected = selectedCategory === item.category;
              const localizedLabel = t.categories[item.category as keyof typeof t.categories] || item.label;

              const entryCountText = isBangla
                ? `(${toBengaliNumerals(item.count)}টি এন্ট্রি)`
                : `(${item.count} ${item.count === 1 ? "entry" : "entries"})`;

              const percentText = isBangla
                ? `${toBengaliNumerals(item.percentage)}%`
                : `${item.percentage}%`;

              return (
                <motion.div
                  key={item.category}
                  variants={listItemVariants}
                  onClick={() =>
                    setSelectedCategory(
                      selectedCategory === item.category ? "all" : item.category
                    )
                  }
                  className={`group p-3 rounded-xl border cursor-pointer select-none transition-[background-color,border-color,box-shadow] duration-150 ease-out ${
                    isSelected
                      ? "bg-primary/10 border-primary ring-1 ring-primary/30"
                      : "bg-accent/20 border-border/40 hover:bg-accent/40 hover:border-border/80"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`size-8 rounded-lg border flex items-center justify-center transition-colors duration-150 ${
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-card border-border/80 text-muted-foreground group-hover:text-foreground group-hover:border-border"
                        }`}
                      >
                        <Icon className="size-4" />
                      </div>
                      <div>
                        <span
                          className={`text-xs ${
                            isSelected
                              ? "font-bold text-foreground"
                              : "font-semibold text-foreground"
                          }`}
                        >
                          {localizedLabel}
                        </span>
                        <span className="text-[11px] text-muted-foreground ml-2">
                          {entryCountText}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <CurrencyAmount amount={item.total_amount} size="sm" className="font-bold" />
                      <span className="text-[10px] text-muted-foreground ml-1.5 font-medium">
                        {percentText}
                      </span>
                    </div>
                  </div>

                  {/* Animated Progress Bar */}
                  <div className="w-full h-1.5 bg-card rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(item.percentage, 4)}%` }}
                      transition={{
                        duration: 0.85,
                        ease: premiumEase,
                        delay: 0.1 + idx * 0.05,
                      }}
                      className="h-full rounded-full"
                      style={{
                        backgroundColor: meta?.color || "var(--primary)",
                      }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
