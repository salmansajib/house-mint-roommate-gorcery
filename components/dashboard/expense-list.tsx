"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { useExpenses } from "@/context/expense-context";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { CurrencyAmount } from "@/components/ui/currency-amount";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
import { CATEGORY_META } from "@/lib/balance";
import { Expense } from "@/types";
import {
  ShoppingBag,
  Home,
  Zap,
  Flame,
  Wifi,
  Tag,
  Trash2,
  ChevronDown,
  ChevronUp,
  Receipt,
  Calendar,
  Clock,
  Layers,
  AlertTriangle,
  Lock,
  Edit2,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { EditExpenseModal } from "@/components/modals/edit-expense-modal";

function formatExpenseDateTime(dateStr: string, createdAtStr?: string) {
  try {
    const rawDate = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr;
    const formattedDate = format(parseISO(rawDate), "MMM dd, yyyy");

    if (createdAtStr) {
      const createdDate = new Date(createdAtStr);
      if (!isNaN(createdDate.getTime())) {
        return {
          date: formattedDate,
          time: format(createdDate, "h:mm a"),
        };
      }
    }

    if (dateStr.includes("T")) {
      const parsed = parseISO(dateStr);
      if (!isNaN(parsed.getTime())) {
        return {
          date: formattedDate,
          time: format(parsed, "h:mm a"),
        };
      }
    }

    return { date: formattedDate, time: null };
  } catch {
    return { date: dateStr, time: null };
  }
}

const ICON_MAP: Record<string, React.ElementType> = {
  ShoppingBag,
  Home,
  Zap,
  Flame,
  Wifi,
  Tag,
};

import {
  listContainerVariants,
  listItemVariants,
  premiumEase,
} from "@/lib/animations";

export function ExpenseListSkeleton() {
  return (
    <Card className="border-border/80">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-3 w-48" />
          </div>
          {/* Filter Pills Skeleton */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-28 rounded-lg" />
            <Skeleton className="h-8 w-28 rounded-lg" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="p-3 sm:p-4 rounded-xl bg-card border border-border/70 flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <Skeleton className="size-10 rounded-xl shrink-0" />
              <div className="space-y-2 min-w-0">
                <Skeleton className="h-4 w-32 sm:w-48" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="size-3.5 rounded-full" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1.5 shrink-0">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-4 w-14 rounded-full" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function ExpenseList() {
  const {
    expenses,
    settlements,
    users,
    currentUser,
    deleteExpense,
    selectedCategory,
    setSelectedCategory,
    selectedMonth,
    setSelectedMonth,
    monthlySummaries,
    isLoaded,
  } = useExpenses();

  const [expandedExpenseIds, setExpandedExpenseIds] = React.useState<
    Record<string, boolean>
  >({});
  
  // State for edit and delete dialogs
  const [expenseToDelete, setExpenseToDelete] = React.useState<Expense | null>(null);
  const [expenseToEdit, setExpenseToEdit] = React.useState<Expense | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedExpenseIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const getUserName = (id: string) => {
    return users.find((u) => u.id === id)?.name || "Roommate";
  };

  const handleConfirmDelete = () => {
    if (expenseToDelete) {
      const canDelete =
        expenseToDelete.paid_by === currentUser.id || currentUser.role === "admin";
      if (!canDelete) {
        setExpenseToDelete(null);
        return;
      }
      deleteExpense(expenseToDelete.id);
      setExpenseToDelete(null);
    }
  };

  if (!isLoaded) {
    return <ExpenseListSkeleton />;
  }

  return (
    <>
      <Card className="h-full flex flex-col border-border/80">
        <CardHeader className="p-4 sm:p-5 pb-3 sm:pb-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base sm:text-lg font-bold">
                  Household Ledger
                </CardTitle>
                <Badge variant="outline" className="text-[10px] sm:text-xs">
                  {expenses.length} {expenses.length === 1 ? "entry" : "entries"}
                </Badge>
              </div>
              <CardDescription className="text-xs">
                Every logged grocery haul, utility bill, and settlement
              </CardDescription>
            </div>

            {/* Month Filter Selector */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <Calendar className="size-3.5 sm:size-4 text-muted-foreground" />
              <div className="relative">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-card text-foreground border border-border rounded-lg pl-3 pr-8 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer appearance-none font-medium transition-colors hover:border-border/80"
                >
                  <option value="all">All Months</option>
                  {monthlySummaries.map((m) => (
                    <option key={m.month} value={m.month}>
                      {m.formatted_month}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Category Filter Pills (Horizontal Touch-friendly Scroll) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-3 py-1.5 text-xs rounded-xl font-semibold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                selectedCategory === "all"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-accent/40 text-muted-foreground hover:text-foreground hover:bg-accent/70"
              }`}
            >
              All Categories
            </button>
            {(Object.keys(CATEGORY_META) as (keyof typeof CATEGORY_META)[]).map(
              (cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 text-xs rounded-xl font-semibold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                      isSelected
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "bg-accent/40 text-muted-foreground hover:text-foreground hover:bg-accent/70"
                    }`}
                  >
                    {CATEGORY_META[cat].label}
                  </button>
                );
              }
            )}
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto space-y-3 p-3 sm:p-5 pt-0">
          {/* Settlements records */}
          {settlements.length > 0 && selectedCategory === "all" && (
            <div className="space-y-2 mb-4">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Recent Settlements
              </span>
              <motion.div
                initial="hidden"
                animate="show"
                variants={listContainerVariants}
                className="space-y-2"
              >
                {settlements.map((s) => (
                  <motion.div
                    key={s.id}
                    variants={listItemVariants}
                    className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-950/20 flex flex-col xs:flex-row xs:items-center justify-between gap-2 text-xs transition-[background-color,border-color,transform] duration-200 ease-out hover:bg-emerald-950/35 hover:border-emerald-500/35 hover:-translate-y-0.5"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="size-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0">
                        ✓
                      </div>
                      <div className="min-w-0">
                        <span className="font-semibold text-emerald-300 block truncate">
                          {getUserName(s.payer_id)} paid {getUserName(s.receiver_id)}
                        </span>
                        <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                          {(() => {
                            const dt = formatExpenseDateTime(s.date, s.created_at);
                            return (
                              <span>
                                {dt.date}
                                {dt.time ? ` at ${dt.time}` : ""}
                              </span>
                            );
                          })()}
                          {s.notes && <span>• {s.notes}</span>}
                        </p>
                      </div>
                    </div>
                    <div className="self-end xs:self-center">
                      <CurrencyAmount amount={s.amount} intent="positive" size="sm" className="font-bold" />
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          )}

          {/* Expenses List */}
          {expenses.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="py-12 text-center text-muted-foreground text-xs space-y-2"
            >
              <Receipt className="size-8 mx-auto opacity-40" />
              <p className="font-semibold text-foreground text-sm">No expenses found</p>
              <p className="text-xs">Try clearing filters or adding a new expense.</p>
            </motion.div>
          ) : (
            <motion.div
              initial="hidden"
              animate="show"
              variants={listContainerVariants}
              className="space-y-2.5"
            >
              {expenses.map((expense) => {
                const meta = CATEGORY_META[expense.category];
                const Icon = ICON_MAP[meta?.icon || "Tag"] || Tag;
                const isPayer = expense.paid_by === currentUser.id;
                const canManage = isPayer || currentUser.role === "admin";
                const payerName = getUserName(expense.paid_by);
                const isItemized =
                  Boolean(expense.items && expense.items.length > 0);
                const isExpanded = expandedExpenseIds[expense.id];

                // Current user's split share
                const userSplit = expense.splits.find(
                  (s) => s.user_id === currentUser.id
                );
                const userShareAmount = userSplit?.amount || 0;

                return (
                  <motion.div
                    key={expense.id}
                    variants={listItemVariants}
                    className="rounded-xl border border-border/70 bg-card hover:border-border hover:bg-accent/15 hover:shadow-md transition-[background-color,border-color,box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5 overflow-hidden"
                  >
                    <div className="p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* Left: Icon and Details */}
                      <div className="flex items-start gap-2.5 sm:gap-3 min-w-0 flex-1">
                        <div className="size-8 sm:size-9 rounded-xl bg-accent/60 border border-border/80 flex items-center justify-center text-foreground shrink-0 mt-0.5 sm:mt-0">
                          <Icon className="size-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                            <span className="font-semibold text-xs sm:text-sm text-foreground truncate max-w-[200px] sm:max-w-none">
                              {expense.title}
                            </span>
                            <Badge variant={meta?.badgeVariant || "default"} className="text-[9px] sm:text-[10px] py-0 px-1.5">
                              {meta?.label || expense.category}
                            </Badge>
                            {!isItemized && (expense.quantity || expense.unit) && (
                              <Badge variant="outline" className="text-[9px] sm:text-[10px] py-0 px-1.5 border-border">
                                {expense.quantity ? expense.quantity : ""} {expense.unit || ""}
                              </Badge>
                            )}
                            {isItemized && (
                              <Badge variant="secondary" className="text-[9px] sm:text-[10px] py-0 px-1.5 gap-1">
                                <Layers className="size-2.5" />
                                {expense.items?.length} items
                              </Badge>
                            )}
                          </div>
                          <div className="text-[11px] sm:text-xs text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1">
                            {(() => {
                              const dt = formatExpenseDateTime(expense.date, expense.created_at);
                              return (
                                <span className="inline-flex items-center gap-1 font-medium text-foreground/90">
                                  <Calendar className="size-3 text-muted-foreground shrink-0" />
                                  <span>{dt.date}</span>
                                  {dt.time && (
                                    <>
                                      <span className="text-muted-foreground">•</span>
                                      <Clock className="size-3 text-muted-foreground shrink-0" />
                                      <span>{dt.time}</span>
                                    </>
                                  )}
                                </span>
                              );
                            })()}
                            <span>•</span>
                            <span>
                              Paid by <strong className="text-foreground font-medium">{isPayer ? "You" : payerName}</strong>
                            </span>
                            <span className="hidden xs:inline">•</span>
                            <span className="text-[11px]">
                              Your share: <strong className="text-foreground">৳{userShareAmount}</strong>
                            </span>
                            {expense.updated_at && (
                              <>
                                <span className="text-muted-foreground">•</span>
                                <span
                                  className="text-[10px] text-muted-foreground italic font-normal"
                                  title={`Edited on ${format(new Date(expense.updated_at), "MMM dd, yyyy 'at' h:mm a")}`}
                                >
                                  (edited)
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Amount & Actions */}
                      <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-border/50">
                        <div className="text-left sm:text-right">
                          <CurrencyAmount amount={expense.amount} size="md" className="font-bold block" />
                          <span className="text-[10px] text-muted-foreground">
                            {expense.split_type === "equal"
                              ? `Split ${expense.splits.length} ways (Equal)`
                              : expense.split_type}
                          </span>
                        </div>

                        <div className="flex items-center gap-0.5 sm:gap-1">
                          {isItemized && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleExpand(expense.id)}
                              className="size-8 text-muted-foreground hover:text-foreground cursor-pointer"
                              title="View itemized breakdown"
                            >
                              {isExpanded ? (
                                <ChevronUp className="size-4" />
                              ) : (
                                <ChevronDown className="size-4" />
                              )}
                            </Button>
                          )}

                          {/* Permissions: Only Payer or Admin can edit & delete this expense */}
                          {canManage ? (
                            <div className="flex items-center gap-0.5">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setExpenseToEdit(expense)}
                                className="size-8 text-muted-foreground hover:text-primary hover:bg-primary/10 cursor-pointer"
                                title={isPayer ? "Edit expense" : "Edit expense (Admin)"}
                              >
                                <Edit2 className="size-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setExpenseToDelete(expense)}
                                className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                                title={isPayer ? "Delete expense" : "Delete expense (Admin)"}
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            </div>
                          ) : (
                            <div
                              className="size-8 flex items-center justify-center text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors cursor-not-allowed select-none"
                              title={`Protected: Only ${payerName} or an Admin can edit or delete this expense`}
                            >
                              <Lock className="size-3.5" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expandable itemized grocery drawer with smooth collapse */}
                    <AnimatePresence>
                      {isItemized && isExpanded && expense.items && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25, ease: premiumEase }}
                          className="overflow-hidden bg-accent/20 border-t border-border/60 p-3 text-xs space-y-1.5"
                        >
                          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                            Itemized Grocery Haul Breakdown
                          </div>
                          <div className="divide-y divide-border/40">
                            {expense.items.map((item, idx) => (
                              <div
                                key={item.id || idx}
                                className="py-1.5 flex items-center justify-between text-xs"
                              >
                                <span className="text-foreground font-medium truncate mr-2">
                                  {item.name}
                                  {(item.quantity || item.unit) ? (
                                    <span className="text-muted-foreground text-[11px] ml-1.5">
                                      ({item.quantity ? item.quantity : ""} {item.unit || ""} × ৳{item.unit_price})
                                    </span>
                                  ) : null}
                                </span>
                                <CurrencyAmount amount={item.total_price} size="sm" className="font-semibold text-foreground shrink-0" />
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={Boolean(expenseToDelete)} onOpenChange={(open) => !open && setExpenseToDelete(null)}>
        <AlertDialogContent className="w-[95vw] sm:max-w-md bg-card border-border rounded-2xl p-5 sm:p-6 shadow-2xl">
          <AlertDialogHeader className="text-left space-y-2">
            <div className="size-10 rounded-full bg-destructive/15 border border-destructive/30 flex items-center justify-center text-destructive mb-1">
              <AlertTriangle className="size-5" />
            </div>
            <AlertDialogTitle className="text-lg font-bold text-foreground">
              Delete This Expense?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground space-y-1">
              <span>Are you sure you want to delete </span>
              <strong className="text-foreground font-semibold">
                &ldquo;{expenseToDelete?.title}&rdquo; (৳{expenseToDelete?.amount})
              </strong>
              <span>? This will remove the entry from the ledger and immediately recalculate all roommate balances.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-3 gap-2 flex-col-reverse sm:flex-row">
            <AlertDialogCancel className="h-10 rounded-xl border-border hover:bg-accent cursor-pointer">
              Keep Expense
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="h-10 rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 font-semibold cursor-pointer shadow-md shadow-destructive/20"
            >
              Yes, Delete Expense
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Expense Modal */}
      <EditExpenseModal
        isOpen={Boolean(expenseToEdit)}
        expense={expenseToEdit}
        onClose={() => setExpenseToEdit(null)}
      />
    </>
  );
}
