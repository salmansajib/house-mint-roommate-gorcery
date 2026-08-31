"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { WifiOff, RefreshCw } from "lucide-react";
import { Text } from "@/components/ui/typography";

interface OfflineBadgeProps {
  isOnline: boolean;
}

export function OfflineBadge({ isOnline }: OfflineBadgeProps) {
  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.aside
          initial={{ opacity: 0, y: -20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.96 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          aria-live="polite"
          className="fixed top-3 sm:top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
        >
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-card/95 backdrop-blur-md border border-warning/40 shadow-xl shadow-black/40 pointer-events-auto">
            <span className="relative flex size-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-warning opacity-75" />
              <span className="relative inline-flex rounded-full size-2 bg-warning" />
            </span>
            <WifiOff className="size-3.5 text-warning shrink-0" />
            <Text variant="caption" className="font-semibold text-warning">
              Offline mode
            </Text>
            <span className="text-[11px] text-muted-foreground hidden sm:inline">
              — Local changes saved to cache
            </span>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
