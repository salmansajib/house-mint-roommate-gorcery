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
import { PlusCircle, HandCoins, ArrowUpRight, ArrowDownLeft, CheckCircle2 } from "lucide-react";
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
      <CardContent className="p-4 sm:p-6 lg:p-7 space-y-5">
        {/* Top Header Strip Skeleton */}
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-4 w-44" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>

        {/* Top Balance Summary Row */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div className="space-y-2.5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 sm:h-12 w-48 sm:w-60 rounded-xl" />
            <Skeleton className="h-6 w-36 rounded-full" />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:w-auto w-full">
            <div className="p-3 sm:p-4 rounded-xl bg-card border border-border/70 space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-6 w-24" />
            </div>
            <div className="p-3 sm:p-4 rounded-xl bg-card border border-border/70 space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-6 w-24" />
            </div>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="flex flex-wrap gap-2.5 pt-2 border-t border-border/60">
          <Skeleton className="h-12 w-36 rounded-xl" />
          <Skeleton className="h-12 w-32 rounded-xl" />
        </div>

        {/* Peer Debts Row */}
        <div className="pt-2 space-y-2">
          <Skeleton className="h-3.5 w-28" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
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
          {/* Full-width Card Top Header Strip */}
          <motion.div
            variants={heroItemVariants}
            className="flex items-center justify-between gap-3 text-[11px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider"
          >
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <span className="text-foreground/90 whitespace-nowrap">
                {isBangla ? "ব্যক্তিগত স্থিতি" : "Personal Balance"}
              </span>
              <span className="text-muted-foreground/40">•</span>
              <span className="text-muted-foreground/80 whitespace-nowrap">
                {users.length} {isBangla ? t.nav.roommateCount : (users.length === 1 ? t.common.roommate : t.common.roommates)}
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 tracking-normal normal-case">
              <UserBadge user={currentUser} size="sm" showDot />
            </div>
          </motion.div>

          {/* Main Balance Display & Actions Row */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Main Balance Display */}
            <div className="flex-1 space-y-3">
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

              {/* Financial Ledger Sub-metrics */}
              <motion.div
                variants={heroItemVariants}
                className="pt-1 grid grid-cols-1 xs:grid-cols-2 gap-2.5 sm:gap-4 max-w-xl"
              >
                <div className="flex items-center gap-2.5 bg-accent/40 border border-border/70 p-2.5 sm:p-3 rounded-xl transition-[background-color,border-color] duration-150 ease-out hover:bg-accent/60 hover:border-border">
                  <div className="size-7 rounded-lg bg-positive/15 text-positive flex items-center justify-center shrink-0">
                    <ArrowUpRight className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] text-muted-foreground block truncate">
                      {isBangla ? "নিজের পকেট থেকে পরিশোধ" : "Paid Out of Pocket"}
                    </span>
                    <CurrencyAmount amount={userBalance.total_paid} size="sm" className="font-bold text-foreground" />
                  </div>
                </div>

                <div className="flex items-center gap-2.5 bg-accent/40 border border-border/70 p-2.5 sm:p-3 rounded-xl transition-[background-color,border-color] duration-150 ease-out hover:bg-accent/60 hover:border-border">
                  <div className="size-7 rounded-lg bg-destructive/15 text-destructive flex items-center justify-center shrink-0">
                    <ArrowDownLeft className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] text-muted-foreground block truncate">
                      {isBangla ? "আপনার নিজের অংশ" : "Your Equal Fair Share"}
                    </span>
                    <CurrencyAmount amount={userBalance.total_share} size="sm" className="font-bold text-foreground" />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Action Buttons with smooth entrance and press physics */}
            <motion.div
              variants={heroItemVariants}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 pt-2 lg:pt-0 shrink-0"
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
              >
                <Button
                  onClick={onOpenAddExpense}
                  size="lg"
                  className="w-full sm:w-auto h-12 rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90 gap-2 justify-center cursor-pointer"
                >
                  <PlusCircle className="size-5" />
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
                  className="w-full sm:w-auto h-12 rounded-xl border-border hover:bg-accent hover:text-accent-foreground font-semibold gap-2 justify-center cursor-pointer"
                >
                  <HandCoins className="size-5 text-primary" />
                  <span>{t.nav.settleUp}</span>
                </Button>
              </motion.div>
            </motion.div>
          </div>
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
