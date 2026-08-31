"use client";

import * as React from "react";
import { useExpenses } from "@/context/expense-context";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Key, AlertCircle, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ClaimAdminDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ClaimAdminDialog({
  isOpen,
  onClose,
  onSuccess,
}: ClaimAdminDialogProps) {
  const { claimAdminAccess, currentUser } = useExpenses();
  const [adminKey, setAdminKey] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setAdminKey("");
      setError(null);
      setSuccess(false);
    }
  }, [isOpen]);

  const handleClaim = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const isClaimed = claimAdminAccess(adminKey);
    if (isClaimed) {
      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1000);
    } else {
      setError(
        "Invalid Master Admin Key. Please check with your apartment manager."
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-card border-border shadow-2xl p-0 overflow-hidden">
        <DialogHeader className="p-5 pb-3 border-b border-border/70 bg-muted/20">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shrink-0">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                Claim Admin Access
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Elevate <span className="font-semibold text-foreground">{currentUser?.name}</span> to Apartment Administrator.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleClaim} className="p-5 space-y-4">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="p-3 rounded-xl bg-destructive/15 border border-destructive/30 text-destructive text-xs flex items-center gap-2"
              >
                <AlertCircle className="size-4 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-positive/15 border border-positive/30 text-positive text-xs flex items-center gap-2 font-medium"
              >
                <CheckCircle2 className="size-4 shrink-0" />
                <span>Admin privileges unlocked successfully!</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Key className="size-3.5" />
              <span>Enter Apartment Master Admin Key</span>
            </label>
            <Input
              type="password"
              required
              autoFocus
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              placeholder="Enter master admin key"
              className="font-mono text-sm tracking-wider uppercase placeholder:normal-case bg-background border-border"
            />
            <p className="text-[11px] text-muted-foreground">
              Configured in your apartment environment or setup documentation.
            </p>
          </div>

          <DialogFooter className="pt-2 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={!adminKey.trim() || success}
              className="bg-primary text-primary-foreground text-xs font-semibold gap-1.5"
            >
              <ShieldCheck className="size-3.5" />
              <span>Unlock Admin Hub</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
