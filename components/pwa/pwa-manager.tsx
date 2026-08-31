"use client";

import * as React from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { usePwa } from "@/hooks/use-pwa";
import { PwaInstallDialog } from "./pwa-install-dialog";
import { OfflineBadge } from "./offline-badge";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/typography";
import { Download, X, Sparkles } from "lucide-react";

export function PwaManager() {
  const {
    isInstallable,
    isStandalone,
    isIOS,
    isOnline,
    isDismissed,
    triggerInstall,
    dismissPrompt,
  } = usePwa();

  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  // Listen for custom trigger to open install dialog anywhere in the app
  React.useEffect(() => {
    const handleOpenInstall = () => setIsDialogOpen(true);
    window.addEventListener("open-pwa-install", handleOpenInstall);
    return () =>
      window.removeEventListener("open-pwa-install", handleOpenInstall);
  }, []);

  // Determine if the non-intrusive floating prompt banner should show
  const showBanner =
    !isStandalone && !isDismissed && (isInstallable || isIOS);

  return (
    <>
      {/* Network Connectivity Status Indicator */}
      <OfflineBadge isOnline={isOnline} />

      {/* Floating PWA Install Prompt Banner */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-20 sm:bottom-6 right-3 sm:right-6 z-40 max-w-sm w-[calc(100%-1.5rem)] sm:w-auto"
          >
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-card/95 backdrop-blur-xl border border-primary/30 shadow-2xl shadow-black/50 text-foreground">
              <div className="size-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shadow-xs shrink-0 overflow-hidden relative">
                <Image
                  src="/icons/icon-192x192.png"
                  alt="HouseMint"
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <Text variant="caption" className="font-bold truncate text-foreground">
                    Install HouseMint
                  </Text>
                  <span className="inline-block size-1.5 rounded-full bg-primary" />
                </div>
                <p className="text-[11px] text-muted-foreground truncate">
                  Instant offline access & faster load
                </p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <Button
                  size="sm"
                  onClick={() => setIsDialogOpen(true)}
                  className="h-8 px-3 text-xs font-semibold rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/20 hover:brightness-105 cursor-pointer"
                >
                  <Download className="size-3.5 mr-1" />
                  Install
                </Button>
                <button
                  onClick={dismissPrompt}
                  aria-label="Dismiss banner"
                  className="size-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors cursor-pointer"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comprehensive Install Dialog */}
      <PwaInstallDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        isInstallable={isInstallable}
        isIOS={isIOS}
        onInstall={triggerInstall}
      />
    </>
  );
}
