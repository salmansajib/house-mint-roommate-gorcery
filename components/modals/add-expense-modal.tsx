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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CurrencyAmount } from "@/components/ui/currency-amount";
import { ExpenseCategory, ExpenseItem, User } from "@/types";
import { computeEqualSplit } from "@/lib/balance";
import { Plus, Trash2, Receipt, Layers, Sparkles, Users, CheckSquare, Square, ChevronDown, Calendar, Clock } from "lucide-react";
import { format } from "date-fns";
import { GroceryItemCombobox } from "./grocery-item-combobox";
import { mapBanglaUnitToStandard } from "@/lib/grocery-catalog";
import { useGroceryCatalog } from "@/hooks/use-grocery-catalog";

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Quick suggestions for quantity units
export const COMMON_QUANTITY_UNITS = [
  { value: "", label: "No Unit (Auto)" },
  { value: "kg", label: "kg (Kilogram)" },
  { value: "gm", label: "gm (Gram)" },
  { value: "pcs", label: "pcs (Piece)" },
  { value: "litre", label: "litre (L)" },
  { value: "ml", label: "ml" },
  { value: "pack", label: "pack (Packet)" },
  { value: "dozen", label: "dozen (12 pcs)" },
  { value: "hali", label: "hali (4 pcs)" },
  { value: "bunch", label: "bunch (Aati / Shak)" },
  { value: "bottle", label: "bottle" },
  { value: "box", label: "box" },
];

export const QUICK_UNIT_CHIPS = ["kg", "gm", "pcs", "litre", "dozen", "pack", "hali"];

export function AddExpenseModal({ isOpen, onClose }: AddExpenseModalProps) {
  const { users, currentUser, addExpense } = useExpenses();
  const { recordUsage } = useGroceryCatalog();

  // Mode: "single" or "itemized"
  const [activeTab, setActiveTab] = React.useState<"single" | "itemized">("single");

  // Single Expense Form State
  const [title, setTitle] = React.useState("");
  const [category, setCategory] = React.useState<ExpenseCategory>("rent");
  const [amount, setAmount] = React.useState("");
  const [singleQuantity, setSingleQuantity] = React.useState("");
  const [singleUnit, setSingleUnit] = React.useState("");
  const [paidBy, setPaidBy] = React.useState(currentUser?.id || "");
  const [date, setDate] = React.useState(format(new Date(), "yyyy-MM-dd"));
  const [time, setTime] = React.useState(format(new Date(), "HH:mm"));
  const [notes, setNotes] = React.useState("");
  const [selectedParticipants, setSelectedParticipants] = React.useState<string[]>([]);

  // Itemized Grocery Form State
  const [groceryTitle, setGroceryTitle] = React.useState("Weekly Grocery Trip");
  const [groceryPaidBy, setGroceryPaidBy] = React.useState(currentUser?.id || "");
  const [groceryDate, setGroceryDate] = React.useState(format(new Date(), "yyyy-MM-dd"));
  const [groceryTime, setGroceryTime] = React.useState(format(new Date(), "HH:mm"));
  const [groceryItems, setGroceryItems] = React.useState<
    Array<{ name: string; quantity: string; unit: string; unit_price: string }>
  >([
    { name: "Miniket Rice", quantity: "10", unit: "kg", unit_price: "84" },
    { name: "Broiler Chicken", quantity: "4", unit: "kg", unit_price: "220" },
    { name: "Fresh Vegetables", quantity: "", unit: "", unit_price: "450" },
  ]);
  const [groceryParticipants, setGroceryParticipants] = React.useState<string[]>([]);

  // Reset and initialize participants & current date/time when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setPaidBy(currentUser.id);
      setGroceryPaidBy(currentUser.id);
      setSelectedParticipants(users.map((u) => u.id));
      setGroceryParticipants(users.map((u) => u.id));
      const now = new Date();
      setDate(format(now, "yyyy-MM-dd"));
      setTime(format(now, "HH:mm"));
      setGroceryDate(format(now, "yyyy-MM-dd"));
      setGroceryTime(format(now, "HH:mm"));
    }
  }, [isOpen, currentUser.id, users]);

  // Toggle participant for Single Bill
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

  // Toggle participant for Grocery
  const toggleGroceryParticipant = (userId: string) => {
    setGroceryParticipants((prev) => {
      if (prev.includes(userId)) {
        if (prev.length <= 1) return prev;
        return prev.filter((id) => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  // Compute itemized total
  const groceryTotal = React.useMemo(() => {
    return groceryItems.reduce((sum, item) => {
      const price = parseFloat(item.unit_price) || 0;
      const qty = parseFloat(item.quantity) || 1;
      return sum + qty * price;
    }, 0);
  }, [groceryItems]);

  const handleAddGroceryItem = () => {
    setGroceryItems((prev) => [
      ...prev,
      { name: "", quantity: "", unit: "kg", unit_price: "" },
    ]);
  };

  const handleUpdateGroceryItem = (
    index: number,
    field: "name" | "quantity" | "unit" | "unit_price",
    value: string
  ) => {
    setGroceryItems((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, [field]: value } : item
      )
    );
  };

  const handleRemoveGroceryItem = (index: number) => {
    if (groceryItems.length <= 1) return;
    setGroceryItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Submit Single Bill
  const handleSingleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!title.trim() || isNaN(numAmount) || numAmount <= 0) return;

    const participatingUsers = users.filter((u) =>
      selectedParticipants.includes(u.id)
    );
    const numQuantity = singleQuantity.trim() !== "" ? parseFloat(singleQuantity) : undefined;
    const splits = computeEqualSplit(numAmount, participatingUsers, paidBy);

    const [year, month, day] = date.split("-").map(Number);
    const [hours, minutes] = (time || "12:00").split(":").map(Number);
    const expenseDateTime = new Date(year, (month || 1) - 1, day || 1, hours || 0, minutes || 0);

    addExpense({
      title: title.trim(),
      category,
      amount: numAmount,
      quantity: !isNaN(Number(numQuantity)) ? numQuantity : undefined,
      unit: singleUnit.trim() || undefined,
      paid_by: paidBy,
      date,
      created_at: expenseDateTime.toISOString(),
      split_type: "equal",
      notes: notes.trim() || undefined,
      splits,
    });

    if (category === "groceries") {
      recordUsage(title.trim(), singleUnit.trim() || undefined);
    }

    // Reset & close
    setTitle("");
    setAmount("");
    setSingleQuantity("");
    setSingleUnit("");
    setNotes("");
    onClose();
  };

  // Submit Itemized Groceries
  const handleItemizedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (groceryTotal <= 0) return;

    const validItems: ExpenseItem[] = groceryItems
      .filter((item) => item.name.trim() && parseFloat(item.unit_price) > 0)
      .map((item, idx) => {
        const uPrice = parseFloat(item.unit_price) || 0;
        const hasQty = item.quantity.trim() !== "" && !isNaN(parseFloat(item.quantity));
        const qty = hasQty ? parseFloat(item.quantity) : undefined;
        const multiplier = qty ?? 1;

        return {
          id: `item-${Date.now()}-${idx}`,
          name: item.name.trim(),
          quantity: qty,
          unit: item.unit.trim() || undefined,
          unit_price: uPrice,
          total_price: Number((multiplier * uPrice).toFixed(2)),
        };
      });

    if (validItems.length === 0) return;

    const participatingUsers = users.filter((u) =>
      groceryParticipants.includes(u.id)
    );
    const splits = computeEqualSplit(groceryTotal, participatingUsers, groceryPaidBy);

    const [gYear, gMonth, gDay] = groceryDate.split("-").map(Number);
    const [gHours, gMinutes] = (groceryTime || "12:00").split(":").map(Number);
    const groceryDateTime = new Date(gYear, (gMonth || 1) - 1, gDay || 1, gHours || 0, gMinutes || 0);

    addExpense({
      title: groceryTitle.trim() || "Grocery Trip",
      category: "groceries",
      amount: groceryTotal,
      paid_by: groceryPaidBy,
      date: groceryDate,
      created_at: groceryDateTime.toISOString(),
      split_type: "equal",
      items: validItems,
      splits,
    });

    // Record grocery item usage in background for smart suggestions & Supabase learning
    validItems.forEach((vi) => {
      recordUsage(vi.name, vi.unit);
    });

    onClose();
  };

  const singlePerPerson = parseFloat(amount) > 0 && selectedParticipants.length > 0
    ? (parseFloat(amount) / selectedParticipants.length).toFixed(2)
    : "0.00";

  const groceryPerPerson = groceryTotal > 0 && groceryParticipants.length > 0
    ? (groceryTotal / groceryParticipants.length).toFixed(2)
    : "0.00";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95vw] sm:max-w-xl max-h-[90vh] flex flex-col p-4 sm:p-6 bg-card border-border rounded-2xl overflow-hidden shadow-2xl">
        <DialogHeader className="shrink-0 text-left pb-1">
          <DialogTitle className="text-lg sm:text-xl font-bold flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            <span>Add New Expense</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Log bills or groceries — automatically split equally among roommates
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as "single" | "itemized")}
          className="w-full mt-2 flex flex-col flex-1 min-h-0"
        >
          <TabsList className="grid w-full grid-cols-2 bg-accent/40 shrink-0 p-1 mb-1">
            <TabsTrigger value="single" className="text-xs font-semibold gap-1.5 py-1.5 cursor-pointer">
              <Receipt className="size-3.5" />
              Single Bill / Item
            </TabsTrigger>
            <TabsTrigger value="itemized" className="text-xs font-semibold gap-1.5 py-1.5 cursor-pointer">
              <Layers className="size-3.5" />
              Itemized Grocery Haul
            </TabsTrigger>
          </TabsList>

          {/* Mode 1: Single Bill Form */}
          <TabsContent
            value="single"
            className="flex-1 overflow-y-auto pl-1 pr-2.5 sm:pr-3.5 py-2 space-y-4 outline-none focus:outline-none focus-visible:ring-0 custom-scrollbar overscroll-contain mt-0"
          >
            <form onSubmit={handleSingleSubmit} className="space-y-4 pb-2">
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

              {/* Quantity & Unit of Measurement (Optional) */}
              <div className="p-3.5 rounded-xl bg-accent/25 border border-border/70 space-y-2.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <span>Quantity & Unit</span>
                  <span className="text-[10px] text-muted-foreground font-normal">(Optional)</span>
                </label>

                <div className="grid grid-cols-12 gap-2.5">
                  <div className="col-span-5">
                    <div className="relative">
                      <span className="absolute left-2.5 top-2.5 text-[10px] text-muted-foreground font-semibold">Qty:</span>
                      <Input
                        type="number"
                        inputMode="decimal"
                        step="any"
                        placeholder="e.g. 2.5"
                        value={singleQuantity}
                        onChange={(e) => setSingleQuantity(e.target.value)}
                        className="h-9 pl-10 text-xs font-numeral bg-card rounded-lg border-border focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                      />
                    </div>
                  </div>

                  <div className="col-span-7">
                    <div className="relative">
                      <select
                        value={singleUnit}
                        onChange={(e) => setSingleUnit(e.target.value)}
                        className="w-full h-9 bg-card border border-border rounded-lg pl-3 pr-8 text-xs font-medium focus:ring-2 focus:ring-primary/40 focus:border-primary focus:outline-none transition-all cursor-pointer appearance-none"
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
                </div>

                {/* Quick Unit Suggestion Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto pt-1 no-scrollbar">
                  <span className="text-[10px] text-muted-foreground font-medium shrink-0">Quick units:</span>
                  {QUICK_UNIT_CHIPS.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => setSingleUnit(chip)}
                      className={`px-2 py-0.5 text-[10px] rounded-md font-semibold border transition-all cursor-pointer shrink-0 ${
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

              {/* Total Amount, Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-6 space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Total Amount (৳)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-bold text-muted-foreground">৳</span>
                    <Input
                      type="number"
                      inputMode="decimal"
                      step="any"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="h-10 pl-7 text-xs font-numeral font-bold bg-accent/20 border-border rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="sm:col-span-3 space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                    <Calendar className="size-3 text-muted-foreground" />
                    <span>Date</span>
                  </label>
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="h-10 text-xs bg-accent/20 border-border rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all cursor-pointer"
                    required
                  />
                </div>

                <div className="sm:col-span-3 space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                    <Clock className="size-3 text-muted-foreground" />
                    <span>Time</span>
                  </label>
                  <Input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="h-10 text-xs bg-accent/20 border-border rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all cursor-pointer"
                    required
                  />
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
                    {selectedParticipants.length} of {users.length} Roommates
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

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Notes (Optional)</label>
                <Input
                  placeholder="e.g. Paid via bKash to landlord"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="h-10 text-xs bg-accent/20 border-border rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                />
              </div>

              {/* Real-time Equal Split Calculation Badge */}
              {parseFloat(amount) > 0 && (
                <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-xs flex justify-between items-center">
                  <div>
                    <span className="text-muted-foreground block">Equal share per person:</span>
                    <span className="text-[10px] text-muted-foreground">
                      Divided equally among {selectedParticipants.length} members
                    </span>
                  </div>
                  <span className="font-bold text-primary text-base font-numeral">
                    ৳{singlePerPerson}
                  </span>
                </div>
              )}

              <DialogFooter className="pt-3 pb-1 gap-2 flex-col-reverse sm:flex-row">
                <Button type="button" variant="outline" size="sm" onClick={onClose} className="h-10 rounded-xl">
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="h-10 rounded-xl bg-primary text-primary-foreground font-semibold shadow-sm hover:opacity-90 transition-opacity">
                  Save Expense
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          {/* Mode 2: Itemized Groceries Form */}
          <TabsContent
            value="itemized"
            className="flex-1 overflow-y-auto pl-1 pr-2.5 sm:pr-3.5 py-2 space-y-4 outline-none focus:outline-none focus-visible:ring-0 custom-scrollbar overscroll-contain mt-0"
          >
            <form onSubmit={handleItemizedSubmit} className="space-y-4 pb-2">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-4 space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Trip Title</label>
                  <Input
                    value={groceryTitle}
                    onChange={(e) => setGroceryTitle(e.target.value)}
                    className="h-10 text-xs bg-accent/20 border-border rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                    required
                  />
                </div>
                <div className="sm:col-span-4 space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Paid By</label>
                  <div className="relative">
                    <select
                      value={groceryPaidBy}
                      onChange={(e) => setGroceryPaidBy(e.target.value)}
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
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                    <Calendar className="size-3 text-muted-foreground" />
                    <span>Date</span>
                  </label>
                  <Input
                    type="date"
                    value={groceryDate}
                    onChange={(e) => setGroceryDate(e.target.value)}
                    className="h-10 text-xs bg-accent/20 border-border rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all cursor-pointer"
                    required
                  />
                </div>
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                    <Clock className="size-3 text-muted-foreground" />
                    <span>Time</span>
                  </label>
                  <Input
                    type="time"
                    value={groceryTime}
                    onChange={(e) => setGroceryTime(e.target.value)}
                    className="h-10 text-xs bg-accent/20 border-border rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all cursor-pointer"
                    required
                  />
                </div>
              </div>

              {/* Equal Split Household Participants Selector for Groceries */}
              <div className="p-3.5 rounded-xl bg-accent/25 border border-border/70 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Users className="size-3.5 text-primary" />
                    <span>Split Grocery Bill Equally Among</span>
                  </span>
                  <span className="text-[11px] text-primary font-semibold">
                    {groceryParticipants.length} of {users.length} Roommates
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {users.map((user) => {
                    const isChecked = groceryParticipants.includes(user.id);
                    return (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => toggleGroceryParticipant(user.id)}
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

              {/* Items Card List (Responsive item cards with quantity & unit selectors) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">Grocery Line Items</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleAddGroceryItem}
                    className="h-7 text-xs text-primary gap-1 px-2.5 rounded-lg hover:bg-primary/10 cursor-pointer"
                  >
                    <Plus className="size-3.5" />
                    Add Item
                  </Button>
                </div>

                <div className="space-y-2.5 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                  {groceryItems.map((item, idx) => {
                    const price = parseFloat(item.unit_price) || 0;
                    const qty = parseFloat(item.quantity) || 1;
                    const rowTotal = qty * price;
                    const hasCustomQty = item.quantity.trim() !== "" || item.unit.trim() !== "";

                    return (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-accent/30 border border-border/70 space-y-2.5 shadow-xs"
                      >
                        {/* Top: Item Name + Delete */}
                        <div className="flex items-center justify-between gap-2">
                          <GroceryItemCombobox
                            placeholder="Item name (e.g. chal, rice, peyaj, dim)"
                            value={item.name}
                            onChange={(val) => handleUpdateGroceryItem(idx, "name", val)}
                            onSelectSuggestion={(suggestion) => {
                              // If current unit is empty or default, auto-populate with suggested unit
                              if (suggestion.default_unit && (!item.unit || item.unit === "kg" || item.unit === "pcs" || item.unit === "")) {
                                const stdUnit = mapBanglaUnitToStandard(suggestion.default_unit);
                                handleUpdateGroceryItem(idx, "unit", stdUnit);
                              }
                            }}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveGroceryItem(idx)}
                            disabled={groceryItems.length <= 1}
                            className="size-8 flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg disabled:opacity-30 cursor-pointer shrink-0 transition-colors"
                            title="Remove item"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>

                        {/* Middle: Quantity, Unit Selector, and Price */}
                        <div className="grid grid-cols-12 gap-2 items-center">
                          {/* Quantity (Optional) */}
                          <div className="col-span-4 sm:col-span-3">
                            <div className="relative">
                              <span className="absolute left-2 top-2 text-[9px] text-muted-foreground font-semibold">Qty:</span>
                              <Input
                                type="number"
                                inputMode="decimal"
                                step="any"
                                placeholder="1 (opt)"
                                value={item.quantity}
                                onChange={(e) =>
                                  handleUpdateGroceryItem(idx, "quantity", e.target.value)
                                }
                                className="h-8 pl-8 text-xs bg-card font-numeral rounded-lg text-center border-border focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                                min="0.01"
                              />
                            </div>
                          </div>

                          {/* Unit of Measurement Dropdown / Suggestions (Optional) */}
                          <div className="col-span-4 sm:col-span-4">
                            <div className="relative">
                              <select
                                value={item.unit}
                                onChange={(e) => handleUpdateGroceryItem(idx, "unit", e.target.value)}
                                className="w-full h-8 bg-card border border-border rounded-lg pl-2.5 pr-7 text-xs font-medium focus:ring-2 focus:ring-primary/40 focus:border-primary focus:outline-none transition-all cursor-pointer appearance-none"
                              >
                                {COMMON_QUANTITY_UNITS.map((u) => (
                                  <option key={u.value} value={u.value}>
                                    {u.label}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 size-3 text-muted-foreground pointer-events-none" />
                            </div>
                          </div>

                          {/* Price */}
                          <div className="col-span-4 sm:col-span-5">
                            <div className="relative">
                              <span className="absolute left-2.5 top-2 text-[10px] text-muted-foreground font-semibold">৳</span>
                              <Input
                                type="number"
                                inputMode="decimal"
                                step="any"
                                placeholder="Price"
                                value={item.unit_price}
                                onChange={(e) =>
                                  handleUpdateGroceryItem(idx, "unit_price", e.target.value)
                                }
                                className="h-8 pl-6 text-xs bg-card font-numeral font-bold rounded-lg border-border focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                                required
                              />
                            </div>
                          </div>
                        </div>

                        {/* Quick Unit Suggestion Chips for row */}
                        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                          {QUICK_UNIT_CHIPS.map((chip) => (
                            <button
                              key={chip}
                              type="button"
                              onClick={() => handleUpdateGroceryItem(idx, "unit", chip)}
                              className={`px-1.5 py-0.5 text-[9px] rounded font-medium border transition-all cursor-pointer shrink-0 ${
                                item.unit === chip
                                  ? "bg-primary text-primary-foreground border-primary"
                                  : "bg-card text-muted-foreground border-border hover:text-foreground"
                              }`}
                            >
                              {chip}
                            </button>
                          ))}
                        </div>

                        {/* Bottom: Subtotal computation badge */}
                        <div className="flex items-center justify-between text-[11px] px-1 text-muted-foreground">
                          <span>
                            {hasCustomQty
                              ? `${item.quantity || "1"} ${item.unit || "unit"} × ৳${price || 0}`
                              : `Price: ৳${price || 0}`}
                          </span>
                          <span className="font-semibold text-foreground">
                            Subtotal: <strong className="text-primary font-numeral">৳{rowTotal.toFixed(2)}</strong>
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Total Grocery Summary */}
              <div className="p-3 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-foreground">Total Grocery Amount:</span>
                  <p className="text-[11px] text-muted-foreground">
                    ৳{groceryPerPerson} / roommate ({groceryParticipants.length} equal shares)
                  </p>
                </div>
                <CurrencyAmount amount={groceryTotal} size="lg" className="font-extrabold text-primary" />
              </div>

              <DialogFooter className="pt-2 pb-1 gap-2 flex-col-reverse sm:flex-row">
                <Button type="button" variant="outline" size="sm" onClick={onClose} className="h-10 rounded-xl">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={groceryTotal <= 0}
                  className="h-10 rounded-xl bg-primary text-primary-foreground font-semibold shadow-sm hover:opacity-90 transition-opacity"
                >
                  Save Grocery Trip
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
