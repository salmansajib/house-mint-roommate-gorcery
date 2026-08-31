"use client";

import * as React from "react";
import { motion } from "motion/react";
import { useExpenses } from "@/context/expense-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CurrencyAmount } from "@/components/ui/currency-amount";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { getUrgencyBadgeConfig } from "@/lib/recurring-bills";
import { RecurringBill } from "@/types";
import {
  Home,
  Wifi,
  Flame,
  Zap,
  Tag,
  CalendarClock,
  Settings2,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Plus,
} from "lucide-react";
import { listItemVariants, listContainerVariants } from "@/lib/animations";

interface RecurringBillsCardProps {
  onOpenManager: () => void;
  onOpenQuickLog: (bill: RecurringBill) => void;
}

const CATEGORY_ICONS = {
  rent: Home,
  internet: Wifi,
  gas: Flame,
  electricity: Zap,
  groceries: Tag,
  other: Tag,
};

export function RecurringBillsCardSkeleton() {
  return (
    <Card className="border-border/80 shadow-md">
      <CardHeader className="p-4 sm:p-5 pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Skeleton className="size-8 sm:size-9 rounded-xl" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-44" />
              <Skeleton className="h-3 w-56" />
            </div>
          </div>
          <Skeleton className="h-8 w-28 rounded-xl" />
        </div>

        {/* 3 Metric cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3">
          <div className="p-3 rounded-xl bg-card border border-border/70 space-y-1.5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-5 w-24" />
          </div>
          <div className="p-3 rounded-xl bg-card border border-border/70 space-y-1.5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-5 w-24" />
          </div>
          <div className="p-3 rounded-xl bg-card border border-border/70 space-y-1.5">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-5 w-24" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 pt-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-3.5 rounded-xl bg-card border border-border/70 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <Skeleton className="size-8 rounded-lg" />
                <Skeleton className="h-4 w-16 rounded-full" />
              </div>
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-20" />
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-border/50">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-7 w-20 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function RecurringBillsCard({
  onOpenManager,
  onOpenQuickLog,
}: RecurringBillsCardProps) {
  const { recurringBillStatuses, recurringMetrics, users, isLoaded } = useExpenses();

  if (!isLoaded) {
    return <RecurringBillsCardSkeleton />;
  }

  if (recurringBillStatuses.length === 0) {
    return (
      <Card className="border-dashed border-border/80 bg-card/60 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shrink-0">
            <CalendarClock className="size-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">
              No Recurring Bills Configured Yet
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Set up monthly bills like Rent, Wi-Fi, or Electricity to get automatic due-date reminders.
            </p>
          </div>
        </div>
        <Button
          onClick={onOpenManager}
          size="sm"
          className="gap-1.5 bg-primary text-primary-foreground font-semibold shrink-0 cursor-pointer shadow-xs"
        >
          <Plus className="size-3.5" />
          <span>Add Recurring Bill</span>
        </Button>
      </Card>
    );
  }

  return (
    <Card className="border-border/80 bg-gradient-to-b from-card via-card to-card/90 shadow-md overflow-hidden">
      <CardHeader className="p-4 sm:p-5 pb-3 border-b border-border/60">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shrink-0 shadow-xs">
              <CalendarClock className="size-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm sm:text-base font-bold text-foreground">
                  Recurring Bills & Due Dates
                </CardTitle>
                {recurringMetrics.overdueCount > 0 && (
                  <Badge
                    variant="outline"
                    className="bg-destructive/15 text-destructive border-destructive/30 text-[10px] px-1.5 py-0 font-bold animate-pulse"
                  >
                    {recurringMetrics.overdueCount} Overdue
                  </Badge>
                )}
                {recurringMetrics.dueSoonCount > 0 && (
                  <Badge
                    variant="outline"
                    className="bg-warning/15 text-warning border-warning/30 text-[10px] px-1.5 py-0 font-bold"
                  >
                    {recurringMetrics.dueSoonCount} Due Soon
                  </Badge>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Monthly household utilities and fixed payments
              </p>
            </div>
          </div>

          {/* Quick Metrics & Manage Button */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground bg-background/50 px-2.5 py-1 rounded-lg border border-border/60">
              <span>Paid:</span>
              <span className="font-semibold text-positive">
                {recurringMetrics.paidCount}/{recurringMetrics.totalBills}
              </span>
              <span>•</span>
              <span>Pending:</span>
              <CurrencyAmount
                amount={recurringMetrics.totalPendingAmount}
                size="xs"
                className="font-bold text-foreground"
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={onOpenManager}
              className="h-8 text-xs gap-1.5 border-border hover:bg-accent cursor-pointer"
            >
              <Settings2 className="size-3.5" />
              <span>Manage Bills</span>
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-3 sm:p-4 pt-3">
        <motion.div
          initial="hidden"
          animate="show"
          variants={listContainerVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3"
        >
          {recurringBillStatuses.map((item) => {
            const { bill, status, dueDateFormatted, isPaidThisMonth } = item;
            const Icon = CATEGORY_ICONS[bill.category] || Tag;
            const badgeConfig = getUrgencyBadgeConfig(status);
            const payer = users.find((u) => u.id === bill.default_payer_id);

            return (
              <motion.div
                key={bill.id}
                variants={listItemVariants}
                className={`p-3 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                  status === "overdue"
                    ? "border-destructive/40 bg-destructive/5 hover:border-destructive/60"
                    : status === "due_today" || status === "due_soon"
                    ? "border-warning/40 bg-warning/5 hover:border-warning/60"
                    : isPaidThisMonth
                    ? "border-border/60 bg-background/40 hover:bg-background/80"
                    : "border-border bg-background/60 hover:bg-background"
                }`}
              >
                {/* Top: Icon, Title & Urgency Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="size-8 rounded-lg flex items-center justify-center shrink-0 border"
                      style={{
                        backgroundColor: `color-mix(in oklch, var(--cat-${bill.category}) 15%, transparent)`,
                        borderColor: `color-mix(in oklch, var(--cat-${bill.category}) 30%, transparent)`,
                        color: `var(--cat-${bill.category})`,
                      }}
                    >
                      <Icon className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-xs text-foreground truncate">
                        {bill.title}
                      </h4>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Clock className="size-2.5" />
                        <span>{dueDateFormatted}</span>
                      </p>
                    </div>
                  </div>

                  <Badge
                    variant={badgeConfig.badgeVariant}
                    className={`text-[10px] px-1.5 py-0 font-semibold shrink-0 ${badgeConfig.className}`}
                  >
                    {badgeConfig.label}
                  </Badge>
                </div>

                {/* Bottom: Amount, Payer & Action */}
                <div className="pt-2 border-t border-border/50 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {payer && <UserAvatar user={payer} size="xs" showRing={false} />}
                    <div className="min-w-0">
                      <CurrencyAmount
                        amount={bill.default_amount}
                        size="sm"
                        className="font-bold text-foreground"
                      />
                    </div>
                  </div>

                  {/* Action */}
                  {isPaidThisMonth ? (
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-positive shrink-0">
                      <CheckCircle2 className="size-3.5" />
                      <span>Paid</span>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => onOpenQuickLog(bill)}
                      className="h-7 text-xs px-2.5 font-semibold bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer shadow-xs gap-1"
                    >
                      <span>Log Bill</span>
                      <ArrowRight className="size-3" />
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </CardContent>
    </Card>
  );
}
