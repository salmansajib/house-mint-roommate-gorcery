"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { useExpenses } from "@/context/expense-context";
import { UserAvatar } from "@/components/ui/user-avatar";
import { CurrencyAmount } from "@/components/ui/currency-amount";
import { X, Sparkles } from "lucide-react";

export function NotificationToast() {
  const { latestLiveToast, dismissLiveToast, users } = useExpenses();

  React.useEffect(() => {
    if (!latestLiveToast) return;
    const timer = setTimeout(() => {
      dismissLiveToast();
    }, 4500);

    return () => clearTimeout(timer);
  }, [latestLiveToast, dismissLiveToast]);

  if (!latestLiveToast) return null;

  const actorUser = users.find((u) => u.id === latestLiveToast.actor_id) || {
    id: latestLiveToast.actor_id,
    name: latestLiveToast.actor_name,
  };

  return (
    <div className="fixed bottom-16 sm:bottom-6 right-4 sm:right-6 z-50 pointer-events-none max-w-sm w-full px-2">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 15, scale: 0.95 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="pointer-events-auto p-3.5 bg-card/95 backdrop-blur-xl border border-primary/30 rounded-2xl shadow-2xl flex items-start gap-3 ring-1 ring-primary/20"
        >
          <div className="relative shrink-0 mt-0.5">
            <UserAvatar user={actorUser} size="sm" showRing={false} />
            <span className="absolute -top-1 -right-1 size-3 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
              <Sparkles className="size-2" />
            </span>
          </div>

          <div className="min-w-0 flex-1 space-y-0.5">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[11px] font-bold text-primary tracking-tight">
                {latestLiveToast.title}
              </span>
              <span className="text-[10px] text-muted-foreground">Just now</span>
            </div>
            <p className="text-xs text-foreground text-wrap pretty font-medium">
              {latestLiveToast.description}
            </p>
            {latestLiveToast.amount != null && (
              <div className="pt-0.5 flex items-center gap-1.5">
                <CurrencyAmount
                  amount={latestLiveToast.amount}
                  size="xs"
                  className="font-bold text-foreground"
                />
              </div>
            )}
          </div>

          <button
            onClick={dismissLiveToast}
            aria-label="Dismiss notification"
            className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-accent transition-colors cursor-pointer shrink-0"
          >
            <X className="size-3.5" />
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
