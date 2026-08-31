"use client";

import * as React from "react";
import { useExpenses } from "@/context/expense-context";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CurrencyAmount } from "@/components/ui/currency-amount";
import { UserAvatar } from "@/components/ui/user-avatar";
import { UserBadge } from "@/components/ui/user-badge";
import { formatOrdinalDay } from "@/lib/recurring-bills";
import { RecurringBill, ExpenseCategory } from "@/types";
import { toast } from "@/components/ui/sonner";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Home,
  Wifi,
  Flame,
  Zap,
  Tag,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  Layers,
  Check,
  CheckSquare,
  Square,
  Sparkles,
  AlertTriangle,
} from "lucide-react";

interface RecurringBillsManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQuickLogBill?: (bill: RecurringBill) => void;
}

const CATEGORY_CONFIG: Record<
  ExpenseCategory,
  { label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  rent: { label: "Rent", icon: Home },
  internet: { label: "Internet", icon: Wifi },
  gas: { label: "Gas", icon: Flame },
  electricity: { label: "Electricity", icon: Zap },
  groceries: { label: "Groceries", icon: Tag },
  other: { label: "Other Bills", icon: Tag },
};

export function RecurringBillsManagerModal({
  isOpen,
  onClose,
  onQuickLogBill,
}: RecurringBillsManagerModalProps) {
  const {
    users,
    currentUser,
    recurringBills,
    recurringBillStatuses,
    addRecurringBill,
    editRecurringBill,
    deleteRecurringBill,
  } = useExpenses();

  const [activeTab, setActiveTab] = React.useState<"list" | "new">("list");
  const [editingBillId, setEditingBillId] = React.useState<string | null>(null);
  const [billToDelete, setBillToDelete] = React.useState<RecurringBill | null>(null);

  // Form State
  const [title, setTitle] = React.useState("");
  const [category, setCategory] = React.useState<ExpenseCategory>("rent");
  const [defaultAmount, setDefaultAmount] = React.useState("");
  const [dueDay, setDueDay] = React.useState("1");
  const [defaultPayerId, setDefaultPayerId] = React.useState(currentUser.id);
  const [participantIds, setParticipantIds] = React.useState<string[]>([]);
  const [notes, setNotes] = React.useState("");

  // Initialize participants to all roommates
  React.useEffect(() => {
    if (isOpen) {
      setParticipantIds(users.map((u) => u.id));
      setDefaultPayerId(currentUser.id);
    }
  }, [isOpen, users, currentUser.id]);

  const resetForm = () => {
    setTitle("");
    setCategory("rent");
    setDefaultAmount("");
    setDueDay("1");
    setDefaultPayerId(currentUser.id);
    setParticipantIds(users.map((u) => u.id));
    setNotes("");
    setEditingBillId(null);
  };

  const handleStartEdit = (bill: RecurringBill) => {
    setEditingBillId(bill.id);
    setTitle(bill.title);
    setCategory(bill.category);
    setDefaultAmount(bill.default_amount.toString());
    setDueDay(bill.due_day_of_month.toString());
    setDefaultPayerId(bill.default_payer_id);
    setParticipantIds(bill.participant_ids);
    setNotes(bill.notes || "");
    setActiveTab("new");
  };

  const toggleParticipant = (userId: string) => {
    setParticipantIds((prev) => {
      if (prev.includes(userId)) {
        if (prev.length <= 1) return prev; // At least one
        return prev.filter((id) => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(defaultAmount);
    const numDueDay = parseInt(dueDay, 10);

    if (!title.trim() || isNaN(numAmount) || numAmount <= 0) return;
    const safeDueDay = isNaN(numDueDay) || numDueDay < 1 ? 1 : Math.min(numDueDay, 31);

    if (editingBillId) {
      editRecurringBill(editingBillId, {
        title: title.trim(),
        category,
        default_amount: numAmount,
        due_day_of_month: safeDueDay,
        default_payer_id: defaultPayerId,
        participant_ids: participantIds,
        notes: notes.trim() || undefined,
      });
      toast.success("Recurring bill updated", {
        description: `"${title.trim()}" (৳${numAmount.toFixed(2)}) updated.`,
      });
    } else {
      addRecurringBill({
        title: title.trim(),
        category,
        default_amount: numAmount,
        billing_cycle: "monthly",
        due_day_of_month: safeDueDay,
        default_payer_id: defaultPayerId,
        split_type: "equal",
        participant_ids: participantIds,
        is_active: true,
        notes: notes.trim() || undefined,
      });
      toast.success("Recurring bill created", {
        description: `"${title.trim()}" (৳${numAmount.toFixed(2)}) will repeat monthly.`,
      });
    }

    resetForm();
    setActiveTab("list");
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[calc(100%-1.25rem)] sm:w-full sm:max-w-2xl max-h-[92dvh] sm:max-h-[90vh] flex flex-col p-0 overflow-hidden bg-card border-border text-foreground rounded-2xl shadow-2xl">
        <DialogHeader className="p-4 sm:p-6 pb-3 sm:pb-4 border-b border-border pr-10 sm:pr-6 text-left">
          <div className="flex items-center justify-between">
            <div className="space-y-1 min-w-0">
              <DialogTitle className="text-base sm:text-xl font-extrabold flex items-center gap-2">
                <Sparkles className="size-4.5 sm:size-5 text-primary shrink-0" />
                <span className="truncate">Manage Recurring Bills</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground line-clamp-1 sm:line-clamp-none">
                Set up recurring monthly utility templates and automatic due-date alerts.
              </DialogDescription>
            </div>
          </div>

          {/* Navigation Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={(val) => {
              if (val === "new" && editingBillId === null) {
                resetForm();
              }
              setActiveTab(val as "list" | "new");
            }}
            className="w-full pt-3"
          >
            <TabsList className="grid grid-cols-2 w-full bg-background border border-border">
              <TabsTrigger value="list" className="text-xs gap-1.5 cursor-pointer">
                <Layers className="size-3.5" />
                <span>Active Bills ({recurringBills.length})</span>
              </TabsTrigger>
              <TabsTrigger value="new" className="text-xs gap-1.5 cursor-pointer">
                <Plus className="size-3.5" />
                <span>{editingBillId ? "Edit Bill Template" : "Add Bill Template"}</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {activeTab === "list" ? (
            <div className="space-y-3">
              {recurringBills.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <div className="size-12 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto text-muted-foreground">
                    <Calendar className="size-6" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    No recurring bills set up yet
                  </p>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    Add monthly expenses like Rent, Wi-Fi, Gas, or Electricity so you never forget when they are due.
                  </p>
                  <Button
                    onClick={() => {
                      resetForm();
                      setActiveTab("new");
                    }}
                    size="sm"
                    className="gap-2 bg-primary text-primary-foreground font-semibold cursor-pointer"
                  >
                    <Plus className="size-3.5" />
                    <span>Create Your First Bill</span>
                  </Button>
                </div>
              ) : (
                recurringBills.map((bill) => {
                  const statusInfo = recurringBillStatuses.find(
                    (s) => s.bill.id === bill.id
                  );
                  const Icon = CATEGORY_CONFIG[bill.category]?.icon || Tag;
                  const defaultPayer = users.find(
                    (u) => u.id === bill.default_payer_id
                  );
                  const isPaid = statusInfo?.isPaidThisMonth;

                  return (
                    <div
                      key={bill.id}
                      className="p-3.5 sm:p-4 rounded-xl border border-border bg-background/60 hover:bg-background transition-all space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className="size-10 rounded-xl flex items-center justify-center shrink-0 border"
                            style={{
                              backgroundColor: `color-mix(in oklch, var(--cat-${bill.category}) 15%, transparent)`,
                              borderColor: `color-mix(in oklch, var(--cat-${bill.category}) 30%, transparent)`,
                              color: `var(--cat-${bill.category})`,
                            }}
                          >
                            <Icon className="size-5" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-sm text-foreground truncate">
                              {bill.title}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                              <span>Due {formatOrdinalDay(bill.due_day_of_month)} of month</span>
                              <span>•</span>
                              <span>Payer: {defaultPayer?.name || "Roommate"}</span>
                            </div>
                          </div>
                        </div>

                        {/* Amount and Status */}
                        <div className="text-right shrink-0">
                          <CurrencyAmount
                            amount={bill.default_amount}
                            size="sm"
                            className="font-bold text-foreground"
                          />
                          <p className="text-[11px] font-medium mt-0.5">
                            {isPaid ? (
                              <span className="text-positive font-semibold flex items-center justify-end gap-1">
                                <Check className="size-3" /> Paid this month
                              </span>
                            ) : (
                              <span className="text-muted-foreground">
                                Pending for this month
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Participant avatars & Actions */}
                      <div className="pt-2 border-t border-border/60 flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-muted-foreground">
                            Split ({bill.participant_ids.length}):
                          </span>
                          <div className="flex -space-x-1.5">
                            {bill.participant_ids.map((id) => {
                              const u = users.find((user) => user.id === id);
                              if (!u) return null;
                              return (
                                <UserAvatar
                                  key={u.id}
                                  user={u}
                                  size="xs"
                                  className="ring-1 ring-card"
                                />
                              );
                            })}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {!isPaid && onQuickLogBill && (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => {
                                onClose();
                                onQuickLogBill(bill);
                              }}
                              className="h-7 text-xs px-2.5 font-semibold text-primary cursor-pointer"
                            >
                              Log Bill
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleStartEdit(bill)}
                            className="size-7 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
                            title="Edit Bill Template"
                          >
                            <Edit2 className="size-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setBillToDelete(bill)}
                            className="size-7 p-0 text-destructive/70 hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                            title="Delete Bill Template"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">
                  Bill Name / Description
                </label>
                <Input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Fiber Internet, DESCO Electricity, Cook Salary"
                  className="bg-background border-border text-sm"
                  autoFocus
                />
              </div>

              {/* Category & Amount Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Category
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(
                      [
                        "rent",
                        "internet",
                        "gas",
                        "electricity",
                        "other",
                      ] as ExpenseCategory[]
                    ).map((cat) => {
                      const isSel = category === cat;
                      const CatIcon = CATEGORY_CONFIG[cat].icon;
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setCategory(cat)}
                          className={`flex items-center gap-1.5 p-2 rounded-lg border text-xs font-medium capitalize cursor-pointer transition-colors ${
                            isSel
                              ? "bg-accent border-primary text-foreground ring-1 ring-primary"
                              : "bg-background border-border text-muted-foreground hover:bg-muted"
                          }`}
                        >
                          <CatIcon className="size-3.5 shrink-0" />
                          <span className="truncate">{cat}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Default Monthly Amount (৳ BDT)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-numeral font-bold text-muted-foreground">
                      ৳
                    </span>
                    <Input
                      type="number"
                      step="any"
                      min="1"
                      required
                      value={defaultAmount}
                      onChange={(e) => setDefaultAmount(e.target.value)}
                      placeholder="0"
                      className="pl-7 font-numeral font-bold text-sm bg-background border-border"
                    />
                  </div>
                </div>
              </div>

              {/* Due Day & Default Payer Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground flex items-center justify-between">
                    <span>Due Day of Month</span>
                    <span className="text-[11px] text-primary font-bold">
                      {formatOrdinalDay(parseInt(dueDay, 10) || 1)} of every month
                    </span>
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="31"
                    required
                    value={dueDay}
                    onChange={(e) => setDueDay(e.target.value)}
                    placeholder="1 - 31"
                    className="bg-background border-border text-sm font-numeral"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Default Payer
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {users.map((u) => {
                      const isSel = defaultPayerId === u.id;
                      return (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => setDefaultPayerId(u.id)}
                          className={`flex items-center gap-1.5 p-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${
                            isSel
                              ? "bg-accent border-primary text-foreground ring-1 ring-primary"
                              : "bg-background border-border text-muted-foreground hover:bg-muted"
                          }`}
                        >
                          <UserAvatar user={u} size="xs" />
                          <span className="truncate">{u.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Split Participants */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">
                  Roommates Sharing this Bill
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {users.map((u) => {
                    const isChecked = participantIds.includes(u.id);
                    return (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => toggleParticipant(u.id)}
                        className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-medium cursor-pointer transition-colors text-left ${
                          isChecked
                            ? "bg-primary/10 border-primary/40 text-foreground"
                            : "bg-background border-border text-muted-foreground opacity-60"
                        }`}
                      >
                        {isChecked ? (
                          <CheckSquare className="size-4 text-primary shrink-0" />
                        ) : (
                          <Square className="size-4 text-muted-foreground shrink-0" />
                        )}
                        <span className="truncate">{u.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">
                  Notes / Account Number (Optional)
                </label>
                <Input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Account # 1048291, bKash merchant payment"
                  className="bg-background border-border text-xs"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    resetForm();
                    setActiveTab("list");
                  }}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="gap-1.5 bg-primary text-primary-foreground font-semibold cursor-pointer"
                >
                  <Check className="size-4" />
                  <span>{editingBillId ? "Save Changes" : "Create Bill Template"}</span>
                </Button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>

    {/* Delete Confirmation Alert Dialog */}
    <AlertDialog open={Boolean(billToDelete)} onOpenChange={(open) => !open && setBillToDelete(null)}>
      <AlertDialogContent className="w-[95vw] sm:max-w-md bg-card border-border rounded-2xl p-5 sm:p-6 shadow-2xl">
        <AlertDialogHeader className="text-left space-y-2">
          <div className="size-10 rounded-full bg-destructive/15 border border-destructive/30 flex items-center justify-center text-destructive mb-1">
            <AlertTriangle className="size-5" />
          </div>
          <AlertDialogTitle className="text-lg font-bold text-foreground">
            Delete Recurring Bill Template?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs text-muted-foreground space-y-1">
            <span>Are you sure you want to delete </span>
            <strong className="text-foreground font-semibold">
              &ldquo;{billToDelete?.title}&rdquo;
            </strong>
            <span>? This template will no longer generate monthly reminder badges or quick log options.</span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="pt-3 gap-2 flex-col-reverse sm:flex-row">
          <AlertDialogCancel className="h-10 rounded-xl border-border hover:bg-accent cursor-pointer">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              if (billToDelete) {
                deleteRecurringBill(billToDelete.id);
                toast.success("Recurring bill deleted", {
                  description: `"${billToDelete.title}" template removed.`,
                });
                setBillToDelete(null);
              }
            }}
            className="h-10 rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 font-semibold cursor-pointer shadow-md shadow-destructive/20"
          >
            Yes, Delete Bill
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </>
  );
}
