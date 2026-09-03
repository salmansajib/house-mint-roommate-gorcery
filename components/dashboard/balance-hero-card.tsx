"use client";

import * as React from "react";
import { motion } from "motion/react";
import { useExpenses } from "@/context/expense-context";
import { useLanguage } from "@/context/language-context";
import { Card, CardContent } from "@/components/ui/card";
import { CurrencyAmount } from "@/components/ui/currency-amount";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getUserDebts } from "@/lib/balance";
import { UserBadge } from "@/components/ui/user-badge";
import { UserAvatar } from "@/components/ui/user-avatar";
import { PlusCircle, HandCoins, ArrowUpRight, ArrowDownLeft, CheckCircle2, Receipt } from "lucide-react";
import {
  heroContentVariants,
  heroItemVariants,
  listContainerVariants,
  listItemVariants,
  premiumEase,
} from "@/lib/animations";

interface BalanceHeroCardProps {
  onOpenAddExpense: () => void;
  onOpenSettleUp: () => void;
}

export function BalanceHeroCardSkeleton() {
  return (
    <Card className="relative overflow-hidden border-border bg-card">
      <CardContent className="p-4 sm:p-6 lg:p-7 space-y-6">
        {/* Top Header Strip Skeleton */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <Skeleton className="size-8 sm:size-9 rounded-full shrink-0" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-24 sm:w-32" />
              <Skeleton className="h-3 w-32 sm:w-40" />
            </div>
          </div>
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>

        {/* Hero Balance & Action Buttons Row */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 sm:gap-6 pt-1">
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-10 sm:h-12 w-48 sm:w-60 rounded-xl" />
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <Skeleton className="h-11 sm:h-12 w-32 sm:w-36 rounded-xl" />
            <Skeleton className="h-11 sm:h-12 w-28 sm:w-32 rounded-xl" />
          </div>
        </div>

        {/* Full-Width 3-Column Metric Deck */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3.5 w-full pt-1">
          <div className="p-3.5 rounded-xl bg-card border border-border/70 space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="p-3.5 rounded-xl bg-card border border-border/70 space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="p-3.5 rounded-xl bg-card border border-border/70 space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-6 w-24" />
          </div>
        </div>

        {/* Peer Debts Row */}
        <div className="pt-2 border-t border-border/60 space-y-2">
          <Skeleton className="h-3.5 w-28" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            <Skeleton className="h-11 w-full rounded-xl" />
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function BalanceHeroCard({
  onOpenAddExpense,
  onOpenSettleUp,
}: BalanceHeroCardProps) {
  const { currentUser, users, ledger, isLoaded } = useExpenses();
  const { t, isBangla } = useLanguage();

  const userBalance = (currentUser && ledger?.user_balances?.[currentUser.id]) || {
    total_paid: 0,
    total_share: 0,
    net_balance: 0,
  };

  const netBalance = userBalance.net_balance;
  const isOwed = netBalance > 0.01;
  const isOwing = netBalance < -0.01;
  const isSettled = !isOwed && !isOwing;

  // Direct pairwise debts for current user
  const { owedToUser, userOwes } = React.useMemo(() => {
    if (!currentUser?.id || !ledger?.debts) return { owedToUser: [], userOwes: [] };
    return getUserDebts(ledger.debts, currentUser.id);
  }, [ledger?.debts, currentUser?.id]);

  const getUserName = (id: string) => {
    return users.find((u) => u.id === id)?.name || t.common.roommate;
  };

  if (!isLoaded) {
    return <BalanceHeroCardSkeleton />;
  }

  return (
    <Card className="relative overflow-hidden border-border bg-card">
      {/* Dynamic ambient gradient glow */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.22, scale: 1 }}
        transition={{ duration: 1.2, ease: premiumEase }}
        className={`absolute -top-24 -right-24 size-64 sm:size-80 rounded-full blur-3xl pointer-events-none transition-colors duration-700 ${
          isOwed
            ? "bg-emerald-500"
            : isOwing
            ? "bg-rose-500"
            : "bg-cyan-500"
        }`}
      />

      <CardContent className="p-4 sm:p-6 lg:p-7 space-y-6 relative z-10">
        <motion.div
          initial="hidden"
          animate="show"
          variants={heroContentVariants}
          className="space-y-5 sm:space-y-6"
        >
          {/* Full-width Card Top Header Strip: Executive Identity */}
          <motion.div
            variants={heroItemVariants}
            className="flex items-center justify-between gap-3"
          >
            {/* Left: User Avatar + Name + Subtitle */}
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <UserAvatar user={currentUser} size="sm" className="ring-2 ring-primary/20 shrink-0" />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 min-w-0">
                  <h3 className="text-sm sm:text-base font-bold text-foreground truncate">
                    {currentUser?.name || t.common.roommate}
                  </h3>
                  {currentUser?.role === "admin" && (
                    <span className="inline-flex items-center px-1.5 py-0.2 rounded-full bg-primary/15 text-primary text-[9px] font-semibold border border-primary/30 shrink-0">
                      Admin
                    </span>
                  )}
                </div>
                <p className="text-[11px] sm:text-xs font-medium text-muted-foreground truncate">
                  {isBangla ? "ব্যক্তিগত স্থিতি ও হিসাব" : "Personal Balance & Ledger"}
                </p>
              </div>
            </div>

            {/* Right: Roommate Count Badge */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/60 border border-border/80 text-[11px] sm:text-xs font-semibold text-muted-foreground whitespace-nowrap">
                <span className="size-1.5 rounded-full bg-primary animate-pulse" />
                {users.length} {isBangla ? t.nav.roommateCount : (users.length === 1 ? t.common.roommate : t.common.roommates)}
              </span>
            </div>
          </motion.div>

          {/* Hero Balance & Primary Actions Row */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 sm:gap-6 pt-1">
            {/* Dynamic Status Headline */}
            <motion.div variants={heroItemVariants} className="min-w-0">
              {isSettled ? (
                <div className="flex items-center gap-3">
                  <div className="size-10 sm:size-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 shadow-inner">
                    <CheckCircle2 className="size-6 sm:size-7" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-foreground tracking-tight">
                      {t.dashboard.allSettledUp}
                    </h2>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                      {isBangla ? "মেসের সকলের সাথে আপনার সমস্ত দেনা-পাওনা পরিশোধিত।" : "You are all square with everyone in the apartment."}
                    </p>
                  </div>
                </div>
              ) : (
                <motion.div
                  key={`${currentUser.id}-${netBalance}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: premiumEase }}
                  className="flex flex-col sm:flex-row sm:items-baseline gap-1.5 sm:gap-3"
                >
                  <span className="text-sm sm:text-base text-muted-foreground font-medium">
                    {isOwed ? t.dashboard.youAreOwed : t.dashboard.youOwe}
                  </span>
                  <CurrencyAmount
                    amount={Math.abs(netBalance)}
                    intent={isOwed ? "positive" : "negative"}
                    size="display"
                    className="font-extrabold tracking-tight leading-none"
                  />
                </motion.div>
              )}
            </motion.div>

            {/* Action Buttons: Visible on sm+ screens (mobile uses sticky bottom bar) */}
            <motion.div
              variants={heroItemVariants}
              className="hidden sm:flex items-center gap-2.5 sm:gap-3 shrink-0"
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
              >
                <Button
                  onClick={onOpenAddExpense}
                  size="lg"
                  className="h-11 sm:h-12 px-5 rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90 gap-2 justify-center cursor-pointer"
                >
                  <PlusCircle className="size-4.5 sm:size-5" />
                  <span>{t.dashboard.addExpense}</span>
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
              >
                <Button
                  onClick={onOpenSettleUp}
                  variant="outline"
                  size="lg"
                  className="h-11 sm:h-12 px-4 sm:px-5 rounded-xl border-border bg-card/60 hover:bg-accent hover:text-accent-foreground font-semibold gap-2 justify-center cursor-pointer"
                >
                  <HandCoins className="size-4.5 sm:size-5 text-primary" />
                  <span>{t.nav.settleUp}</span>
                </Button>
              </motion.div>
            </motion.div>
          </div>

          {/* Full-Width 3-Column Financial Ledger Metric Deck (Smart 2+1 on mobile) */}
          <motion.div
            variants={heroItemVariants}
            className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3.5 w-full pt-1"
          >
            <div className="flex items-center gap-3 bg-card/60 border border-border/80 p-3 sm:p-3.5 rounded-xl transition-[background-color,border-color,transform] duration-150 ease-out hover:bg-accent/40 hover:border-border">
              <div className="size-8 rounded-lg bg-positive/15 text-positive flex items-center justify-center shrink-0">
                <ArrowUpRight className="size-4.5" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] text-muted-foreground block truncate">
                  {isBangla ? "নিজের পকেট থেকে পরিশোধ" : "Paid Out of Pocket"}
                </span>
                <CurrencyAmount amount={userBalance.total_paid} size="sm" className="font-bold text-foreground text-sm sm:text-base" />
              </div>
            </div>

            <div className="flex items-center gap-3 bg-card/60 border border-border/80 p-3 sm:p-3.5 rounded-xl transition-[background-color,border-color,transform] duration-150 ease-out hover:bg-accent/40 hover:border-border">
              <div className="size-8 rounded-lg bg-destructive/15 text-destructive flex items-center justify-center shrink-0">
                <ArrowDownLeft className="size-4.5" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] text-muted-foreground block truncate">
                  {isBangla ? "আপনার নিজের অংশ" : "Your Equal Fair Share"}
                </span>
                <CurrencyAmount amount={userBalance.total_share} size="sm" className="font-bold text-foreground text-sm sm:text-base" />
              </div>
            </div>

            <div className="flex items-center gap-3 bg-primary/5 border border-primary/20 p-3 sm:p-3.5 rounded-xl transition-[background-color,border-color,transform] duration-150 ease-out hover:bg-primary/10 hover:border-primary/40 xs:col-span-2 sm:col-span-1">
              <div className="size-8 rounded-lg bg-primary/15 text-primary flex items-center justify-center shrink-0">
                <Receipt className="size-4.5" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] text-primary/80 font-medium block truncate">
                  {t.dashboard.monthlyTotal}
                </span>
                <CurrencyAmount amount={ledger.total_household_spent} size="sm" className="font-bold text-foreground text-sm sm:text-base" />
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* N-Member Pairwise Debt Matrix (Who owes who) */}
        {(owedToUser.length > 0 || userOwes.length > 0) && (
          <motion.div
            initial="hidden"
            animate="show"
            variants={listContainerVariants}
            className="pt-2 border-t border-border/60"
          >
            <motion.span
              variants={listItemVariants}
              className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-2.5"
            >
              {isBangla ? `${currentUser.name}-এর বকেয়া লেনদেন হিসাব` : `Direct Peer Breakdown for ${currentUser.name}`}
            </motion.span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {/* Roommates who owe the active user */}
              {owedToUser.map((debt) => (
                <motion.div
                  key={`${debt.from_user_id}-${debt.to_user_id}`}
                  variants={listItemVariants}
                  className="p-3 rounded-xl bg-positive/10 border border-positive/20 flex items-center justify-between gap-2 text-xs transition-[background-color,border-color] duration-150 ease-out hover:bg-positive/15 hover:border-positive/35"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <UserAvatar
                      user={
                        users.find((u) => u.id === debt.from_user_id) || {
                          id: debt.from_user_id,
                          name: getUserName(debt.from_user_id),
                        }
                      }
                      size="xs"
                      className="size-7 text-[11px] font-bold shrink-0"
                    />
                    <span className="font-semibold text-foreground truncate">
                      {isBangla
                        ? `${getUserName(debt.from_user_id)} আপনাকে দেবে`
                        : `${getUserName(debt.from_user_id)} owes you`}
                    </span>
                  </div>
                  <CurrencyAmount amount={debt.amount} intent="positive" size="sm" className="font-bold shrink-0" />
                </motion.div>
              ))}

              {/* Roommates the active user owes */}
              {userOwes.map((debt) => (
                <motion.div
                  key={`${debt.from_user_id}-${debt.to_user_id}`}
                  variants={listItemVariants}
                  className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center justify-between gap-2 text-xs transition-[background-color,border-color] duration-150 ease-out hover:bg-destructive/15 hover:border-destructive/35"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <UserAvatar
                      user={
                        users.find((u) => u.id === debt.to_user_id) || {
                          id: debt.to_user_id,
                          name: getUserName(debt.to_user_id),
                        }
                      }
                      size="xs"
                      className="size-7 text-[11px] font-bold shrink-0"
                    />
                    <span className="font-semibold text-foreground truncate">
                      {isBangla
                        ? `আপনি ${getUserName(debt.to_user_id)}-কে দেবেন`
                        : `You owe ${getUserName(debt.to_user_id)}`}
                    </span>
                  </div>
                  <CurrencyAmount amount={debt.amount} intent="negative" size="sm" className="font-bold shrink-0" />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
