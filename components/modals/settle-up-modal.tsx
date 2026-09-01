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
import { HandCoins, ArrowRight, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import { toast } from "@/components/ui/sonner";

interface SettleUpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettleUpModal({ isOpen, onClose }: SettleUpModalProps) {
  const { users, currentUser, ledger, addSettlement } = useExpenses();

  const otherUsers = users.filter((u) => u.id !== currentUser?.id);
  const defaultOtherUser = otherUsers[0] || users[0] || currentUser;

  // Find if currentUser owes anyone or is owed by anyone
  const relevantDebts = (ledger?.debts || []).filter(
    (d) => d.from_user_id === currentUser?.id || d.to_user_id === currentUser?.id
  );

  const initialDebt = relevantDebts[0];
  const defaultPayerId = initialDebt ? initialDebt.from_user_id : (currentUser?.id || "");
  const defaultReceiverId = initialDebt
    ? initialDebt.to_user_id
    : (defaultOtherUser?.id || currentUser?.id || "");
  const defaultAmount = initialDebt ? initialDebt.amount.toString() : "1000";

  const [payerId, setPayerId] = React.useState(defaultPayerId);
  const [receiverId, setReceiverId] = React.useState(defaultReceiverId);
  const [amount, setAmount] = React.useState(defaultAmount);
  const [date, setDate] = React.useState(format(new Date(), "yyyy-MM-dd"));
  const [notes, setNotes] = React.useState("Settlement payment via bKash");

  React.useEffect(() => {
    if (isOpen) {
      const debt = ledger.debts.find(
        (d) => d.from_user_id === currentUser.id || d.to_user_id === currentUser.id
      );
      if (debt) {
        setPayerId(debt.from_user_id);
        setReceiverId(debt.to_user_id);
        setAmount(debt.amount.toString());
      } else {
        setPayerId(currentUser.id);
        setReceiverId(defaultOtherUser.id);
        setAmount("1000");
      }
    }
  }, [isOpen, currentUser.id, ledger.debts, defaultOtherUser.id]);

  const handlePayerChange = (newPayerId: string) => {
    setPayerId(newPayerId);
    if (newPayerId === receiverId) {
      const nextReceiver = users.find((u) => u.id !== newPayerId);
      if (nextReceiver) setReceiverId(nextReceiver.id);
    }
    // Auto fill existing debt if found
    const matchingDebt = ledger.debts.find(
      (d) => d.from_user_id === newPayerId && d.to_user_id === receiverId
    );
    if (matchingDebt) setAmount(matchingDebt.amount.toString());
  };

  const handleReceiverChange = (newReceiverId: string) => {
    setReceiverId(newReceiverId);
    if (newReceiverId === payerId) {
      const nextPayer = users.find((u) => u.id !== newReceiverId);
      if (nextPayer) setPayerId(nextPayer.id);
    }
    // Auto fill existing debt if found
    const matchingDebt = ledger.debts.find(
      (d) => d.from_user_id === payerId && d.to_user_id === newReceiverId
    );
    if (matchingDebt) setAmount(matchingDebt.amount.toString());
  };

  const payerName = users.find((u) => u.id === payerId)?.name || "Payer";
  const receiverName = users.find((u) => u.id === receiverId)?.name || "Receiver";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0 || payerId === receiverId) return;

    addSettlement({
      payer_id: payerId,
      receiver_id: receiverId,
      amount: numAmount,
      date,
      notes: notes.trim() || undefined,
    });

    toast.success("Payment recorded", {
      description: `${payerName} paid ${receiverName} ৳${numAmount.toFixed(2)}`,
    });

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[calc(100%-1.25rem)] sm:max-w-md bg-card border-border rounded-2xl p-4 sm:p-6 shadow-2xl">
        <DialogHeader className="text-left">
          <div className="flex items-center gap-2 text-emerald-400 mb-1">
            <HandCoins className="size-5" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              Debt Repayment
            </span>
          </div>
          <DialogTitle className="text-lg sm:text-xl font-bold">Record Settle Up</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Log a direct payment between any two roommates
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 pt-2">
          {/* Payment Transfer Summary Bar */}
          <div className="p-3 rounded-xl bg-accent/40 border border-border/80 flex items-center justify-between">
            <div className="text-center flex-1 min-w-0">
              <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                Payer (Sender)
              </span>
              <span className="text-xs sm:text-sm font-bold text-foreground truncate block">{payerName}</span>
            </div>
            <ArrowRight className="size-4 text-emerald-400 shrink-0 mx-2" />
            <div className="text-center flex-1 min-w-0">
              <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                Recipient
              </span>
              <span className="text-xs sm:text-sm font-bold text-foreground truncate block">{receiverName}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Who is Paying?</label>
              <div className="relative">
                <select
                  value={payerId}
                  onChange={(e) => handlePayerChange(e.target.value)}
                  className="w-full h-10 bg-accent/30 border border-border rounded-xl pl-3.5 pr-10 text-xs font-medium focus:ring-2 focus:ring-primary/40 focus:border-primary focus:outline-none transition-all cursor-pointer appearance-none"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} {u.id === currentUser.id ? "(You)" : ""}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Who is Receiving?</label>
              <div className="relative">
                <select
                  value={receiverId}
                  onChange={(e) => handleReceiverChange(e.target.value)}
                  className="w-full h-10 bg-accent/30 border border-border rounded-xl pl-3.5 pr-10 text-xs font-medium focus:ring-2 focus:ring-primary/40 focus:border-primary focus:outline-none transition-all cursor-pointer appearance-none"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} {u.id === currentUser.id ? "(You)" : ""}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Amount (৳)</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-bold text-muted-foreground">৳</span>
                <Input
                  type="number"
                  inputMode="decimal"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="h-10 pl-7 text-xs font-numeral font-bold bg-accent/20 border-border rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Date</label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-10 text-xs bg-accent/20 border-border rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Note / Payment Method</label>
            <Input
              placeholder="e.g. Sent via bKash / Nagad / Cash"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="h-10 text-xs bg-accent/20 border-border rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
            />
          </div>

          <DialogFooter className="pt-2 gap-2 flex-col-reverse sm:flex-row">
            <Button type="button" variant="outline" size="lg" onClick={onClose} className="h-11 sm:h-12 rounded-xl">
              Cancel
            </Button>
            <Button
              type="submit"
              size="lg"
              className="h-11 sm:h-12 rounded-xl bg-primary text-primary-foreground font-semibold shadow-sm hover:opacity-90 transition-opacity"
            >
              Record Payment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
