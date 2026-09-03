"use client";

import * as React from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { PlusCircle, HandCoins } from "lucide-react";
import { bottomBarVariants } from "@/lib/animations";
import { useLanguage } from "@/context/language-context";

interface MobileBottomBarProps {
  onOpenAddExpense: () => void;
  onOpenSettleUp: () => void;
}

export function MobileBottomBar({
  onOpenAddExpense,
  onOpenSettleUp,
}: MobileBottomBarProps) {
  const { t } = useLanguage();

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={bottomBarVariants}
      className="sm:hidden fixed bottom-0 left-0 right-0 z-30 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-background/95 backdrop-blur-lg border-t border-border/80 shadow-2xl"
    >
      <div className="grid grid-cols-2 gap-2 max-w-md mx-auto">
        <motion.div whileTap={{ scale: 0.96 }}>
          <Button
            onClick={onOpenAddExpense}
            className="w-full h-12 rounded-full bg-primary text-primary-foreground font-bold shadow-md shadow-primary/20 gap-2 justify-center text-xs cursor-pointer"
          >
            <PlusCircle className="size-4" />
            <span>{t.dashboard.addExpense}</span>
          </Button>
        </motion.div>
        <motion.div whileTap={{ scale: 0.96 }}>
          <Button
            onClick={onOpenSettleUp}
            variant="outline"
            className="w-full h-12 rounded-full border-border bg-card/90 font-bold gap-2 justify-center text-xs text-foreground cursor-pointer"
          >
            <HandCoins className="size-4 text-primary" />
            <span>{t.nav.settleUp}</span>
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}
