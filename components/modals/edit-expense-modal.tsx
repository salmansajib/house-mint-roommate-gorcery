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
import { Badge } from "@/components/ui/badge";
import { CurrencyAmount } from "@/components/ui/currency-amount";
import { Expense, ExpenseCategory, ExpenseItem } from "@/types";
import { computeEqualSplit } from "@/lib/balance";
import {
  Edit3,
  Calendar,
  Clock,
  ChevronDown,
  ShieldCheck,
  Users,
  Plus,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { COMMON_QUANTITY_UNITS, QUICK_UNIT_CHIPS } from "./add-expense-modal";
import { GroceryItemCombobox } from "./grocery-item-combobox";
import { mapBanglaUnitToStandard } from "@/lib/grocery-catalog";
import { useGroceryCatalog } from "@/hooks/use-grocery-catalog";

interface EditExpenseModalProps {
  expense: Expense | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EditExpenseModal({
  expense,
  isOpen,
  onClose,
}: EditExpenseModalProps) {
  const { users, currentUser, editExpense } = useExpenses();
  const { recordUsage } = useGroceryCatalog();

  // Form states
  const [title, setTitle] = React.useState("");
  const [category, setCategory] = React.useState<ExpenseCategory>("rent");
  const [amount, setAmount] = React.useState("");
  const [singleQuantity, setSingleQuantity] = React.useState("");
  const [singleUnit, setSingleUnit] = React.useState("");
  const [paidBy, setPaidBy] = React.useState("");
  const [date, setDate] = React.useState("");
  const [time, setTime] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [selectedParticipants, setSelectedParticipants] = React.useState<
    string[]
  >([]);

  // Itemized grocery line items (if expense has items)
  const [items, setItems] = React.useState<
    Array<{ id?: string; name: string; quantity: string; unit: string; unit_price: string }>
  >([]);

  const isItemized = Boolean(expense?.items && expense.items.length > 0);
  const isAdminEdit = Boolean(
    expense && currentUser && expense.paid_by !== currentUser.id && currentUser.role === "admin"
  );

  // Sync state whenever expense prop changes or modal opens
  React.useEffect(() => {
    if (expense && isOpen) {
      setTitle(expense.title);
      setCategory(expense.category);
      setAmount(expense.amount.toString());
      setSingleQuantity(expense.quantity ? expense.quantity.toString() : "");
      setSingleUnit(expense.unit || "");
      setPaidBy(expense.paid_by);

      const rawDate = expense.date.includes("T")
        ? expense.date.split("T")[0]
        : expense.date;
      setDate(rawDate);

      // Determine time
      if (expense.created_at) {
        try {
          setTime(format(new Date(expense.created_at), "HH:mm"));
        } catch {
          setTime("12:00");
        }
      } else if (expense.date.includes("T")) {
        try {
          setTime(format(new Date(expense.date), "HH:mm"));
        } catch {
          setTime("12:00");
        }
      } else {
        setTime("12:00");
      }

      setNotes(expense.notes || "");

      // Participants
      if (expense.splits && expense.splits.length > 0) {
        setSelectedParticipants(expense.splits.map((s) => s.user_id));
      } else {
        setSelectedParticipants(users.map((u) => u.id));
      }

      // Line items
      if (expense.items && expense.items.length > 0) {
        setItems(
          expense.items.map((it) => ({
            id: it.id,
            name: it.name,
            quantity: it.quantity ? it.quantity.toString() : "",
            unit: it.unit || "",
            unit_price: (it.total_price ?? it.unit_price).toString(),
          }))
        );
      } else {
        setItems([]);
      }
    }
  }, [expense, isOpen, users]);

  // Calculate items total if itemized (sum of item total amounts)
  const itemsTotal = React.useMemo(() => {
    if (!isItemized) return parseFloat(amount) || 0;
    return items.reduce((acc, it) => acc + (parseFloat(it.unit_price) || 0), 0);
  }, [isItemized, items, amount]);

  const toggleParticipant = (userId: string) => {
    setSelectedParticipants((prev) => {
      if (prev.includes(userId)) {
        if (prev.length <= 1) return prev; // Keep at least one
        return prev.filter((id) => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleUpdateItem = (
    index: number,
    field: "name" | "quantity" | "unit" | "unit_price",
    val: string
  ) => {
    setItems((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [field]: val } : item))
    );
  };

  const handleAddItem = () => {
    setItems((prev) => [
      { id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, name: "", quantity: "", unit: "", unit_price: "" },
      ...prev,
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expense) return;

    const numAmount = isItemized ? itemsTotal : parseFloat(amount);
    if (!title.trim() || isNaN(numAmount) || numAmount <= 0) return;

    const participatingUsers = users.filter((u) =>
      selectedParticipants.includes(u.id)
    );
    const splits = computeEqualSplit(numAmount, participatingUsers, paidBy);

    // Combine date and time
    const [year, month, day] = date.split("-").map(Number);
    const [hours, minutes] = (time || "12:00").split(":").map(Number);
    const updatedDateTime = new Date(
      year,
      (month || 1) - 1,
      day || 1,
      hours || 0,
      minutes || 0
    );

    let updatedItems: ExpenseItem[] | undefined = undefined;
    if (isItemized) {
      updatedItems = items
        .filter((it) => it.name.trim() && parseFloat(it.unit_price) > 0)
        .map((it, idx) => {
          const itemTotal = parseFloat(it.unit_price) || 0;
          const hasQty = it.quantity.trim() !== "" && !isNaN(parseFloat(it.quantity));
          const qty = hasQty ? parseFloat(it.quantity) : undefined;
          const uPrice = qty && qty > 0 ? Number((itemTotal / qty).toFixed(2)) : itemTotal;
          return {
            id: it.id || `item-${Date.now()}-${idx}`,
            expense_id: expense.id,
            name: it.name.trim(),
            quantity: qty,
            unit: it.unit.trim() || undefined,
            unit_price: uPrice,
            total_price: Number(itemTotal.toFixed(2)),
          };
        });
    }

    const numQuantity = singleQuantity.trim() !== "" ? parseFloat(singleQuantity) : undefined;

    editExpense(expense.id, {
      title: title.trim(),
      category,
      amount: numAmount,
      quantity: !isNaN(Number(numQuantity)) ? numQuantity : undefined,
      unit: singleUnit.trim() || undefined,
      paid_by: paidBy,
      date,
      created_at: updatedDateTime.toISOString(),
      notes: notes.trim() || undefined,
      splits,
      items: updatedItems,
    });

    // Record grocery item usage in background
    if (updatedItems) {
      updatedItems.forEach((vi) => {
        recordUsage(vi.name, vi.unit);
      });
    } else if (category === "groceries") {
      recordUsage(title.trim(), singleUnit.trim() || undefined);
    }

    onClose();
  };

  if (!expense) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95vw] sm:max-w-xl max-h-[90vh] flex flex-col p-4 sm:p-6 bg-card border-border rounded-2xl overflow-hidden shadow-2xl">
        <DialogHeader className="shrink-0 text-left pb-1">
          <div className="flex items-center justify-between gap-2">
            <DialogTitle className="text-lg sm:text-xl font-bold flex items-center gap-2">
              <Edit3 className="size-5 text-primary" />
              <span>Edit Expense</span>
            </DialogTitle>
            {isAdminEdit && (
              <Badge className="bg-primary/15 text-primary border-primary/30 text-[10px] px-2 py-0.5 font-semibold flex items-center gap-1">
                <ShieldCheck className="size-3" />
                <span>Admin Override</span>
              </Badge>
            )}
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Update expense amount, payer, date, time, and how costs are split.
          </DialogDescription>
        </DialogHeader>

        {isAdminEdit && (
          <div className="px-3 py-2 rounded-xl bg-primary/10 border border-primary/25 text-xs text-foreground flex items-center gap-2">
            <ShieldCheck className="size-4 text-primary shrink-0" />
            <span className="text-[11px] leading-tight">
              You are editing this entry as the <strong>Apartment Admin</strong>. Changes will update the balances for all roommates.
            </span>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto pl-1 pr-2.5 sm:pr-3.5 py-2 space-y-4 outline-none custom-scrollbar overscroll-contain"
        >
          {/* Category & Paid By */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Category</label>
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                  className="w-full h-10 bg-accent/30 border border-border rounded-xl pl-3.5 pr-10 text-xs font-medium focus:ring-2 focus:ring-primary/40 focus:border-primary focus:outline-none transition-all cursor-pointer appearance-none"
                >
                  <option value="rent">Rent</option>
                  <option value="groceries">Groceries</option>
                  <option value="electricity">Electricity</option>
                  <option value="gas">Gas</option>
                  <option value="internet">Internet</option>
                  <option value="other">Other</option>
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Paid By</label>
              <div className="relative">
                <select
                  value={paidBy}
                  onChange={(e) => setPaidBy(e.target.value)}
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

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Expense Title</label>
            <GroceryItemCombobox
              placeholder={
                category === "groceries"
                  ? "e.g. chal, rice, peyaj, dim (auto-suggests Bangla)"
                  : "e.g. August Apartment Rent, Wifi Bill, Grocery item"
              }
              value={title}
              onChange={(val) => setTitle(val)}
              onSelectSuggestion={(suggestion) => {
                setCategory("groceries");
                if (
                  suggestion.default_unit &&
                  (!singleUnit || singleUnit === "kg" || singleUnit === "pcs" || singleUnit === "")
                ) {
                  const stdUnit = mapBanglaUnitToStandard(suggestion.default_unit);
                  setSingleUnit(stdUnit);
                }
              }}
              className="h-10 text-xs bg-accent/20 border-border rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
              containerClassName="w-full flex-none"
              required
            />
          </div>

          {/* Quantity & Unit (Single items only) */}
          {!isItemized && (
            <div className="p-3.5 rounded-xl bg-accent/25 border border-border/70 space-y-2.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <span>Quantity & Unit</span>
                <span className="text-[10px] text-muted-foreground font-normal">(Optional)</span>
              </label>

              <div className="grid grid-cols-12 gap-2.5">
                <div className="col-span-5">
                  <Input
                    type="number"
                    inputMode="decimal"
                    step="any"
                    placeholder="e.g. 5"
                    value={singleQuantity}
                    onChange={(e) => setSingleQuantity(e.target.value)}
                    className="h-9 text-xs bg-accent/20 border-border rounded-lg text-center focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                  />
                </div>

                <div className="col-span-7 relative">
                  <select
                    value={singleUnit}
                    onChange={(e) => setSingleUnit(e.target.value)}
                    className="w-full h-9 bg-accent/20 border border-border rounded-lg pl-3 pr-8 text-xs font-medium focus:ring-2 focus:ring-primary/40 focus:border-primary focus:outline-none transition-all cursor-pointer appearance-none"
                  >
                    {COMMON_QUANTITY_UNITS.map((u) => (
                      <option key={u.value} value={u.value}>
                        {u.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {QUICK_UNIT_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => setSingleUnit(singleUnit === chip ? "" : chip)}
                    className={`text-[10px] px-2 py-0.5 rounded-md border font-medium transition-all cursor-pointer ${
                      singleUnit === chip
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card text-muted-foreground border-border hover:text-foreground hover:bg-accent"
                    }`}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Amount, Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Total Amount (৳) {isItemized && "(Calculated from items)"}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-bold text-muted-foreground">৳</span>
                <Input
                  type="number"
                  inputMode="decimal"
                  step="any"
                  placeholder="0.00"
                  value={isItemized ? itemsTotal.toFixed(2) : amount}
                  onChange={(e) => !isItemized && setAmount(e.target.value)}
                  readOnly={isItemized}
                  className={`h-10 pl-7 text-xs font-numeral font-bold bg-accent/20 border-border rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all ${
                    isItemized ? "opacity-90 cursor-default" : ""
                  }`}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <Calendar className="size-3 text-muted-foreground" />
                  <span>Date</span>
                </label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="h-10 text-xs bg-accent/20 border-border rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all cursor-pointer min-w-0"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <Clock className="size-3 text-muted-foreground" />
                  <span>Time</span>
                </label>
                <Input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="h-10 text-xs bg-accent/20 border-border rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all cursor-pointer min-w-0"
                  required
                />
              </div>
            </div>
          </div>

          {/* Equal Split Household Participants Selector */}
          <div className="p-3.5 rounded-xl bg-accent/25 border border-border/70 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Users className="size-3.5 text-primary" />
                <span>Split Equally Among</span>
              </span>
              <span className="text-[11px] text-primary font-semibold">
                {selectedParticipants.length} of {users.length} Roommates (৳
                {selectedParticipants.length > 0
                  ? (
                      (isItemized ? itemsTotal : parseFloat(amount) || 0) /
                      selectedParticipants.length
                    ).toFixed(2)
                  : "0.00"}{" "}
                each)
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {users.map((user) => {
                const isChecked = selectedParticipants.includes(user.id);
                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => toggleParticipant(user.id)}
                    className={`p-2 rounded-lg border text-xs flex items-center justify-between transition-all cursor-pointer ${
                      isChecked
                        ? "bg-primary/15 border-primary/40 text-foreground font-semibold"
                        : "bg-card/60 border-border text-muted-foreground opacity-60 hover:opacity-100"
                    }`}
                  >
                    <span className="truncate">{user.name}</span>
                    <span className="text-primary font-bold text-xs">
                      {isChecked ? "✓" : ""}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Line items if Itemized Grocery */}
          {isItemized && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">
                  Grocery Line Items ({items.length})
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleAddItem}
                  className="h-7 text-xs text-primary gap-1 px-2.5 rounded-lg hover:bg-primary/10 cursor-pointer"
                >
                  <Plus className="size-3.5" />
                  Add Item
                </Button>
              </div>

              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-2 custom-scrollbar">
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-accent/30 border border-border/70 space-y-2.5 shadow-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <GroceryItemCombobox
                        placeholder="Item name (e.g. chal, rice, peyaj, dim)"
                        value={item.name}
                        onChange={(val) => handleUpdateItem(idx, "name", val)}
                        onSelectSuggestion={(suggestion) => {
                          if (suggestion.default_unit && (!item.unit || item.unit === "kg" || item.unit === "pcs" || item.unit === "")) {
                            const stdUnit = mapBanglaUnitToStandard(suggestion.default_unit);
                            handleUpdateItem(idx, "unit", stdUnit);
                          }
                        }}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        disabled={items.length <= 1}
                        className="size-8 flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg disabled:opacity-30 cursor-pointer shrink-0 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-12 gap-2">
                      <div className="col-span-4">
                        <Input
                          type="number"
                          inputMode="decimal"
                          step="any"
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e) => handleUpdateItem(idx, "quantity", e.target.value)}
                          className="h-8 text-xs bg-card rounded-lg text-center border-border"
                        />
                      </div>
                      <div className="col-span-4">
                        <select
                          value={item.unit}
                          onChange={(e) => handleUpdateItem(idx, "unit", e.target.value)}
                          className="w-full h-8 bg-card border border-border rounded-lg pl-2 pr-6 text-xs font-medium appearance-none"
                        >
                          {COMMON_QUANTITY_UNITS.map((u) => (
                            <option key={u.value} value={u.value}>
                              {u.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-4">
                        <Input
                          type="number"
                          inputMode="decimal"
                          step="any"
                          placeholder="Total (৳)"
                          value={item.unit_price}
                          onChange={(e) => handleUpdateItem(idx, "unit_price", e.target.value)}
                          className="h-8 text-xs bg-card font-numeral font-bold rounded-lg border-border text-right"
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Notes (Optional)</label>
            <Input
              placeholder="e.g. Paid via bKash to landlord"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="h-10 text-xs bg-accent/20 border-border rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
            />
          </div>

          <DialogFooter className="pt-3 pb-1 gap-2 flex-col-reverse sm:flex-row">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="h-10 rounded-xl cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="h-10 rounded-xl bg-primary text-primary-foreground font-semibold shadow-sm hover:opacity-90 transition-opacity cursor-pointer"
            >
              Update Expense
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
