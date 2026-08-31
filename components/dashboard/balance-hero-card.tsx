"use client";

import * as React from "react";
import { motion } from "motion/react";
import { useExpenses } from "@/context/expense-context";
import { Card, CardContent } from "@/components/ui/card";
import { CurrencyAmount } from "@/components/ui/currency-amount";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getUserDebts } from "@/lib/balance";
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
    <Card className="relative overflow-hidden border-border/80 bg-gradient-to-b from-card via-card to-card/70 shadow-xl">
      <CardContent className="p-4 sm:p-6 lg:p-7 space-y-5">
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
          <Skeleton className="h-10 w-36 rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-xl" />
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
    return users.find((u) => u.id === id)?.name || "Roommate";
  };

  if (!isLoaded) {
    return <BalanceHeroCardSkeleton />;
  }

  return (
    <Card className="relative overflow-hidden border-border/80 bg-gradient-to-b from-card via-card to-card/70 shadow-xl">
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

      <CardContent className="p-4 sm:p-6 lg:p-8 space-y-6 relative z-10">
        <motion.div
          initial="hidden"
          animate="show"
          variants={heroContentVariants}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6"
        >
          {/* Main Balance Display */}
          <div className="flex-1 space-y-3">
            <motion.div
              variants={heroItemVariants}
              className="flex items-center gap-2 text-[11px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider"
            >
              <span>Personal Balance</span>
              <span>•</span>
              <span className="text-primary font-bold">{currentUser.name}&apos;s View</span>
              <span>•</span>
              <span className="text-muted-foreground">{users.length} in Household</span>
            </motion.div>

            {/* Dynamic Status Headline */}
            <motion.div variants={heroItemVariants} className="min-w-0">
              {isSettled ? (
                <div className="flex items-center gap-3">
                  <div className="size-10 sm:size-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 shadow-inner">
                    <CheckCircle2 className="size-6 sm:size-7" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-foreground tracking-tight">
                      All Settled Up!
                    </h2>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                      You are all square with everyone in the apartment.
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
                    {isOwed ? "You are owed in total" : "You owe in total"}
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
              <div className="flex items-center gap-2.5 bg-accent/40 border border-border/70 p-2.5 sm:p-3 rounded-xl transition-[transform,background-color,border-color] duration-200 ease-out hover:bg-accent/60 hover:border-border hover:-translate-y-0.5">
                <div className="size-7 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                  <ArrowUpRight className="size-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] text-muted-foreground block truncate">Paid Out of Pocket</span>
                  <CurrencyAmount amount={userBalance.total_paid} size="sm" className="font-bold text-foreground" />
                </div>
              </div>

              <div className="flex items-center gap-2.5 bg-accent/40 border border-border/70 p-2.5 sm:p-3 rounded-xl transition-[transform,background-color,border-color] duration-200 ease-out hover:bg-accent/60 hover:border-border hover:-translate-y-0.5">
                <div className="size-7 rounded-lg bg-rose-500/15 text-rose-400 flex items-center justify-center shrink-0">
                  <ArrowDownLeft className="size-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] text-muted-foreground block truncate">Your Equal Fair Share</span>
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
                className="w-full sm:w-auto h-11 sm:h-12 bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90 gap-2 justify-center cursor-pointer"
              >
                <PlusCircle className="size-5" />
                <span>Add Expense</span>
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
                className="w-full sm:w-auto h-11 sm:h-12 border-border hover:bg-accent hover:text-accent-foreground font-semibold gap-2 justify-center cursor-pointer"
              >
                <HandCoins className="size-5 text-emerald-400" />
                <span>Settle Up</span>
              </Button>
            </motion.div>
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
              Direct Peer Breakdown for {currentUser.name}
            </motion.span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {/* Roommates who owe the active user */}
              {owedToUser.map((debt) => (
                <motion.div
                  key={`${debt.from_user_id}-${debt.to_user_id}`}
                  variants={listItemVariants}
                  className="p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-500/25 flex items-center justify-between gap-2 text-xs transition-[transform,background-color,border-color] duration-200 ease-out hover:bg-emerald-950/35 hover:border-emerald-500/40 hover:-translate-y-0.5"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="size-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                      {getUserName(debt.from_user_id)[0]}
                    </div>
                    <span className="font-semibold text-emerald-300 truncate">
                      {getUserName(debt.from_user_id)} owes you
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
                  className="p-2.5 rounded-xl bg-rose-950/20 border border-rose-500/25 flex items-center justify-between gap-2 text-xs transition-[transform,background-color,border-color] duration-200 ease-out hover:bg-rose-950/35 hover:border-rose-500/40 hover:-translate-y-0.5"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="size-6 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                      {getUserName(debt.to_user_id)[0]}
                    </div>
                    <span className="font-semibold text-rose-300 truncate">
                      You owe {getUserName(debt.to_user_id)}
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
