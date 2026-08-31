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
import { CurrencyAmount } from "@/components/ui/currency-amount";
import { UserAvatar } from "@/components/ui/user-avatar";
import { UserBadge } from "@/components/ui/user-badge";
import { RecurringBill } from "@/types";
import { format } from "date-fns";
import {
  Home,
  Wifi,
  Flame,
  Zap,
  Tag,
  CheckCircle2,
  Calendar,
  Users,
} from "lucide-react";

interface QuickLogBillDialogProps {
  isOpen: boolean;
  onClose: () => void;
  bill: RecurringBill | null;
}

const CATEGORY_ICONS = {
  rent: Home,
  internet: Wifi,
  gas: Flame,
  electricity: Zap,
  groceries: Tag,
  other: Tag,
};

export function QuickLogBillDialog({
  isOpen,
  onClose,
  bill,
}: QuickLogBillDialogProps) {
  const { users, currentUser, logRecurringBillExpense } = useExpenses();

  const [amount, setAmount] = React.useState("");
  const [payerId, setPayerId] = React.useState("");
  const [date, setDate] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Sync state whenever dialog opens with a new bill
  React.useEffect(() => {
    if (bill && isOpen) {
      setAmount(bill.default_amount.toString());
      setPayerId(bill.default_payer_id || currentUser.id);
      setDate(format(new Date(), "yyyy-MM-dd"));
      setIsSubmitting(false);
    }
  }, [bill, isOpen, currentUser.id]);

  if (!bill) return null;

  const IconComponent = CATEGORY_ICONS[bill.category] || Tag;
  const numAmount = parseFloat(amount) || 0;
  const participatingUsers = users.filter((u) =>
    bill.participant_ids.includes(u.id)
  );
  const sharePerPerson =
    participatingUsers.length > 0 ? numAmount / participatingUsers.length : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numAmount <= 0) return;

    setIsSubmitting(true);
    logRecurringBillExpense(bill.id, numAmount, date, payerId);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[calc(100%-1.25rem)] sm:w-full sm:max-w-md bg-card border-border p-4 sm:p-6 text-foreground rounded-2xl shadow-2xl">
        <DialogHeader className="space-y-2 pr-8 sm:pr-0 text-left">
          <div className="flex items-center gap-3">
            <div
              className="size-10 rounded-xl flex items-center justify-center border shadow-xs"
              style={{
                backgroundColor: `color-mix(in oklch, var(--cat-${bill.category}) 15%, transparent)`,
                borderColor: `color-mix(in oklch, var(--cat-${bill.category}) 30%, transparent)`,
                color: `var(--cat-${bill.category})`,
              }}
            >
              <IconComponent className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold tracking-tight">
                Log {bill.title}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Confirm or adjust the details for this month&apos;s recurring bill.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Bill Amount Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground flex items-center justify-between">
              <span>Bill Amount (৳ BDT)</span>
              {numAmount !== bill.default_amount && (
                <span className="text-[10px] text-primary">
                  Default was ৳{bill.default_amount.toLocaleString("en-US")}
                </span>
              )}
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-numeral font-bold text-base text-muted-foreground select-none">
                ৳
              </span>
              <Input
                type="number"
                step="any"
                min="1"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="pl-8 text-base font-numeral font-bold tracking-tight bg-background border-border"
                autoFocus
              />
            </div>
          </div>

          {/* Who Paid Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">
              Paid By
            </label>
            <div className="grid grid-cols-2 gap-2">
              {users.map((u) => {
                const isSelected = payerId === u.id;
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => setPayerId(u.id)}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-medium transition-colors text-left cursor-pointer ${
                      isSelected
                        ? "bg-accent border-primary text-foreground ring-1 ring-primary"
                        : "bg-background/60 border-border/80 text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <UserAvatar user={u} size="xs" />
                    <span className="truncate">{u.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Payment Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Calendar className="size-3.5" />
              <span>Billing Date</span>
            </label>
            <Input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-background border-border text-xs"
            />
          </div>

          {/* Split Breakdown Preview */}
          <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-2">
            <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="size-3" />
                <span>Split ({participatingUsers.length} Roommates)</span>
              </span>
              <span>
                <CurrencyAmount amount={sharePerPerson} size="xs" /> / person
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {participatingUsers.map((u) => (
                <UserBadge key={u.id} user={u} size="sm" />
              ))}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || numAmount <= 0}
              className="w-full sm:w-auto gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold cursor-pointer"
            >
              <CheckCircle2 className="size-4" />
              <span>Confirm & Log Expense</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
