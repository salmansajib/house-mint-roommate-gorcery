"use client";

import * as React from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/typography";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  Share2,
  PlusSquare,
  Sparkles,
  Zap,
  WifiOff,
  CheckCircle2,
} from "lucide-react";

interface PwaInstallDialogProps {
  isOpen: boolean;
  onClose: () => void;
  isInstallable: boolean;
  isIOS: boolean;
  onInstall: () => Promise<boolean>;
}

export function PwaInstallDialog({
  isOpen,
  onClose,
  isInstallable,
  isIOS,
  onInstall,
}: PwaInstallDialogProps) {
  const [installing, setInstalling] = React.useState(false);
  const [installedSuccess, setInstalledSuccess] = React.useState(false);

  const handleInstallClick = async () => {
    setInstalling(true);
    const accepted = await onInstall();
    setInstalling(false);
    if (accepted) {
      setInstalledSuccess(true);
      setTimeout(() => {
        onClose();
        setInstalledSuccess(false);
      }, 1400);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader className="text-center sm:text-left">
          <div className="flex items-center gap-3 mb-1">
            <div className="size-12 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shadow-inner shrink-0 overflow-hidden relative">
              <Image
                src="/icons/icon-192x192.png"
                alt="HouseMint App Icon"
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <DialogTitle className="text-lg font-bold">
                  Install HouseMint
                </DialogTitle>
                <Badge variant="outline" className="text-[10px] text-primary border-primary/30">
                  PWA
                </Badge>
              </div>
              <DialogDescription className="text-xs text-muted-foreground">
                Shared Roommate Grocery & Expense Tracker
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Value Propositions */}
        <div className="space-y-2.5 my-2">
          <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-accent/30 border border-border/40">
            <Zap className="size-4 text-primary shrink-0 mt-0.5" />
            <div>
              <Text variant="caption" className="font-semibold text-foreground">
                Instant Home Screen Launch
              </Text>
              <p className="text-[11px] text-muted-foreground leading-tight">
                Opens standalone without browser address bars for a smooth native app feel.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-accent/30 border border-border/40">
            <WifiOff className="size-4 text-primary shrink-0 mt-0.5" />
            <div>
              <Text variant="caption" className="font-semibold text-foreground">
                Offline Capability
              </Text>
              <p className="text-[11px] text-muted-foreground leading-tight">
                Review balances and log expenses anywhere, even with poor supermarket reception.
              </p>
            </div>
          </div>
        </div>

        {/* Platform Specific Steps */}
        {isIOS ? (
          <div className="p-3.5 rounded-xl bg-secondary/40 border border-secondary text-xs space-y-2.5">
            <Text variant="caption" className="font-bold text-foreground flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-primary" />
              How to add to iOS Home Screen:
            </Text>
            <ol className="space-y-2 text-muted-foreground text-[12px] list-none">
              <li className="flex items-center gap-2">
                <span className="size-5 rounded-full bg-accent flex items-center justify-center font-bold text-foreground text-[10px]">
                  1
                </span>
                <span>
                  Tap the Safari <strong className="text-foreground">Share</strong> icon{" "}
                  <Share2 className="inline size-3.5 text-primary" /> in the bottom bar.
                </span>
              </li>
              <li className="flex items-center gap-2">
                <span className="size-5 rounded-full bg-accent flex items-center justify-center font-bold text-foreground text-[10px]">
                  2
                </span>
                <span>
                  Scroll down and tap{" "}
                  <strong className="text-foreground">Add to Home Screen</strong>{" "}
                  <PlusSquare className="inline size-3.5 text-primary" />.
                </span>
              </li>
              <li className="flex items-center gap-2">
                <span className="size-5 rounded-full bg-accent flex items-center justify-center font-bold text-foreground text-[10px]">
                  3
                </span>
                <span>
                  Tap <strong className="text-foreground">Add</strong> in top-right.
                </span>
              </li>
            </ol>
          </div>
        ) : isInstallable ? (
          <div className="pt-2">
            <Button
              onClick={handleInstallClick}
              disabled={installing || installedSuccess}
              className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/25 gap-2 cursor-pointer"
            >
              {installedSuccess ? (
                <>
                  <CheckCircle2 className="size-4" />
                  <span>Installed Successfully!</span>
                </>
              ) : (
                <>
                  <Download className="size-4" />
                  <span>{installing ? "Installing..." : "Install Now"}</span>
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-muted/50 border border-border text-center text-xs text-muted-foreground">
            To install, use your browser&apos;s menu (⋮ or Share) and select{" "}
            <strong className="text-foreground">Install App</strong> or{" "}
            <strong className="text-foreground">Add to Home Screen</strong>.
          </div>
        )}

        <DialogFooter className="sm:justify-end gap-2 pt-2 border-t border-border/50">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-xs text-muted-foreground"
          >
            Maybe Later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
