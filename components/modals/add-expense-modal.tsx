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
import { Plus, Trash2, Receipt, Layers, Sparkles, Users, CheckSquare, Square, ChevronDown, Calendar, Clock, Pencil, ShoppingCart, Check, X } from "lucide-react";
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

interface GroceryHaulItem {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  unit_price: string;
}

const createEmptyGroceryItem = (): GroceryHaulItem => ({
  id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  name: "",
  quantity: "",
  unit: "kg",
  unit_price: "",
});

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
  const [groceryItems, setGroceryItems] = React.useState<GroceryHaulItem[]>([]);
  const [groceryParticipants, setGroceryParticipants] = React.useState<string[]>([]);

  // Quick-Add Composer State (Option 1)
  const [composerName, setComposerName] = React.useState("");
  const [composerQty, setComposerQty] = React.useState("");
  const [composerUnit, setComposerUnit] = React.useState("kg");
  const [composerPrice, setComposerPrice] = React.useState("");
  const [editingItemId, setEditingItemId] = React.useState<string | null>(null);

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
      setGroceryTitle("Weekly Grocery Trip");
      setGroceryItems([]);
      setComposerName("");
      setComposerQty("");
      setComposerUnit("kg");
      setComposerPrice("");
      setEditingItemId(null);
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

  // Compute itemized total (sum of full amounts of all items)
  const groceryTotal = React.useMemo(() => {
    return groceryItems.reduce((sum, item) => {
      const price = parseFloat(item.unit_price) || 0;
      return sum + price;
    }, 0);
  }, [groceryItems]);

  // Add or update item in the haul list (Option 1)
  const handleAddOrUpdateItem = () => {
    const trimmedName = composerName.trim();
    const numPrice = parseFloat(composerPrice);
    if (!trimmedName || isNaN(numPrice) || numPrice <= 0) return;

    if (editingItemId) {
      setGroceryItems((prev) =>
        prev.map((item) =>
          item.id === editingItemId
            ? {
                ...item,
                name: trimmedName,
                quantity: composerQty.trim(),
                unit: composerUnit.trim() || "kg",
                unit_price: composerPrice.trim(),
              }
            : item
        )
      );
      setEditingItemId(null);
    } else {
      setGroceryItems((prev) => [
        {
          id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          name: trimmedName,
          quantity: composerQty.trim(),
          unit: composerUnit.trim() || "kg",
          unit_price: composerPrice.trim(),
        },
        ...prev,
      ]);
    }

    setComposerName("");
    setComposerQty("");
    setComposerUnit("kg");
    setComposerPrice("");
  };

  const handleStartEdit = (item: GroceryHaulItem) => {
    setEditingItemId(item.id);
    setComposerName(item.name);
    setComposerQty(item.quantity);
    setComposerUnit(item.unit || "kg");
    setComposerPrice(item.unit_price);
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setComposerName("");
    setComposerQty("");
    setComposerUnit("kg");
    setComposerPrice("");
  };

  const handleRemoveGroceryItem = (id: string) => {
    setGroceryItems((prev) => prev.filter((item) => item.id !== id));
    if (editingItemId === id) {
      handleCancelEdit();
    }
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

    // Include currently typed item if valid
    let itemsToSubmit = [...groceryItems];
    if (composerName.trim() && parseFloat(composerPrice) > 0) {
      if (editingItemId) {
        itemsToSubmit = itemsToSubmit.map((it) =>
          it.id === editingItemId
            ? {
                ...it,
                name: composerName.trim(),
                quantity: composerQty.trim(),
                unit: composerUnit.trim() || "kg",
                unit_price: composerPrice.trim(),
              }
            : it
        );
      } else {
        itemsToSubmit = [
          {
            id: `item-${Date.now()}`,
            name: composerName.trim(),
            quantity: composerQty.trim(),
            unit: composerUnit.trim() || "kg",
            unit_price: composerPrice.trim(),
          },
          ...itemsToSubmit,
        ];
      }
    }

    const validItems: ExpenseItem[] = itemsToSubmit
      .filter((item) => item.name.trim() && parseFloat(item.unit_price) > 0)
      .map((item, idx) => {
        const itemTotal = parseFloat(item.unit_price) || 0;
        const hasQty = item.quantity.trim() !== "" && !isNaN(parseFloat(item.quantity));
        const qty = hasQty ? parseFloat(item.quantity) : undefined;
        const uPrice = qty && qty > 0 ? Number((itemTotal / qty).toFixed(2)) : itemTotal;

        return {
          id: item.id || `item-${Date.now()}-${idx}`,
          name: item.name.trim(),
          quantity: qty,
          unit: item.unit.trim() || undefined,
          unit_price: uPrice,
          total_price: Number(itemTotal.toFixed(2)),
        };
      });

    const finalTotal = validItems.reduce((sum, it) => sum + it.total_price, 0);
    if (validItems.length === 0 || finalTotal <= 0) return;

    const participatingUsers = users.filter((u) =>
      groceryParticipants.includes(u.id)
    );
    const splits = computeEqualSplit(finalTotal, participatingUsers, groceryPaidBy);

    const [gYear, gMonth, gDay] = groceryDate.split("-").map(Number);
    const [gHours, gMinutes] = (groceryTime || "12:00").split(":").map(Number);
    const groceryDateTime = new Date(gYear, (gMonth || 1) - 1, gDay || 1, gHours || 0, gMinutes || 0);

    addExpense({
      title: groceryTitle.trim() || "Grocery Trip",
      category: "groceries",
      amount: finalTotal,
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

    // Reset & close
    setGroceryTitle("Weekly Grocery Trip");
    setGroceryItems([]);
    handleCancelEdit();
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
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
              {/* Row 1: Trip Title & Paid By */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Trip Title</label>
                  <Input
                    value={groceryTitle}
                    onChange={(e) => setGroceryTitle(e.target.value)}
                    placeholder="e.g. Weekly Grocery Trip"
                    className="h-10 text-xs bg-accent/20 border-border rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                    required
                  />
                </div>
                <div className="space-y-1.5">
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
              </div>

              {/* Row 2: Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                    <Calendar className="size-3 text-muted-foreground" />
                    <span>Date</span>
                  </label>
                  <Input
                    type="date"
                    value={groceryDate}
                    onChange={(e) => setGroceryDate(e.target.value)}
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
                    value={groceryTime}
                    onChange={(e) => setGroceryTime(e.target.value)}
                    className="h-10 text-xs bg-accent/20 border-border rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all cursor-pointer min-w-0"
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

              {/* Option 1: The Quick-Add Composer Card */}
              <div className="p-3 sm:p-3.5 rounded-xl bg-accent/30 border border-border/80 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    {editingItemId ? (
                      <>
                        <Pencil className="size-3.5 text-primary" />
                        <span>Editing Item</span>
                      </>
                    ) : (
                      <>
                        <Plus className="size-3.5 text-primary" />
                        <span>Add Grocery Item</span>
                      </>
                    )}
                  </span>
                  {editingItemId && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <X className="size-3" />
                      <span>Cancel Edit</span>
                    </button>
                  )}
                </div>

                {/* Composer Row 1: Item Name Combobox */}
                <div className="space-y-1">
                  <GroceryItemCombobox
                    placeholder="Item name (e.g. chal, rice, peyaj, dim)"
                    value={composerName}
                    onChange={(val) => setComposerName(val)}
                    onSelectSuggestion={(suggestion) => {
                      if (suggestion.default_unit) {
                        const stdUnit = mapBanglaUnitToStandard(suggestion.default_unit);
                        setComposerUnit(stdUnit);
                      }
                    }}
                    className="h-9 text-xs bg-card border-border rounded-lg"
                  />
                </div>

                {/* Composer Row 2: Qty, Unit, Price & Add Button */}
                <div className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-3 sm:col-span-3">
                    <div className="relative">
                      <span className="absolute left-2.5 top-2.5 text-[9px] text-muted-foreground font-semibold">Qty:</span>
                      <Input
                        type="number"
                        inputMode="decimal"
                        step="any"
                        placeholder="1 (opt)"
                        value={composerQty}
                        onChange={(e) => setComposerQty(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddOrUpdateItem();
                          }
                        }}
                        className="h-9 pl-9 text-xs bg-card font-numeral rounded-lg text-center border-border focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                        min="0.01"
                      />
                    </div>
                  </div>

                  <div className="col-span-4 sm:col-span-3">
                    <div className="relative">
                      <select
                        value={composerUnit}
                        onChange={(e) => setComposerUnit(e.target.value)}
                        className="w-full h-9 bg-card border border-border rounded-lg pl-2.5 pr-7 text-xs font-medium focus:ring-2 focus:ring-primary/40 focus:border-primary focus:outline-none transition-all cursor-pointer appearance-none"
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

                  <div className="col-span-5 sm:col-span-3">
                    <div className="relative">
                      <span className="absolute left-2.5 top-2 text-[10px] text-muted-foreground font-semibold">৳</span>
                      <Input
                        type="number"
                        inputMode="decimal"
                        step="any"
                        placeholder="Total ৳"
                        value={composerPrice}
                        onChange={(e) => setComposerPrice(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddOrUpdateItem();
                          }
                        }}
                        className="h-9 pl-6 text-xs bg-card font-numeral font-bold rounded-lg border-border focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                      />
                    </div>
                  </div>

                  <div className="col-span-12 sm:col-span-3">
                    <Button
                      type="button"
                      onClick={handleAddOrUpdateItem}
                      disabled={!composerName.trim() || !(parseFloat(composerPrice) > 0)}
                      className="w-full h-9 text-xs font-semibold rounded-lg bg-primary text-primary-foreground shadow-xs hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      {editingItemId ? (
                        <>
                          <Check className="size-3.5" />
                          <span>Update Item</span>
                        </>
                      ) : (
                        <>
                          <Plus className="size-3.5" />
                          <span>Add to Haul</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Quick Unit Suggestion Chips */}
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-0.5">
                  <span className="text-[10px] text-muted-foreground shrink-0 mr-1">Unit:</span>
                  {QUICK_UNIT_CHIPS.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => setComposerUnit(chip)}
                      className={`px-2 py-0.5 text-[10px] rounded-md font-semibold border transition-all cursor-pointer shrink-0 ${
                        composerUnit === chip
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card text-muted-foreground border-border hover:text-foreground hover:bg-accent"
                      }`}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Haul Receipt Breakdown (Compact Rows) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Receipt className="size-3.5 text-primary" />
                    <span>Items in this Haul ({groceryItems.length})</span>
                  </span>
                  {groceryItems.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setGroceryItems([]);
                        handleCancelEdit();
                      }}
                      className="text-[11px] text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {groceryItems.length === 0 ? (
                  <div className="py-6 px-4 rounded-xl border border-dashed border-border/80 text-center flex flex-col items-center justify-center gap-1.5 bg-accent/10">
                    <ShoppingCart className="size-6 text-muted-foreground/50" />
                    <p className="text-xs font-medium text-foreground">No items added to this haul yet</p>
                    <p className="text-[11px] text-muted-foreground">
                      Type an item name and total amount above, then click <strong>Add to Haul</strong> (or press Enter)
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1 custom-scrollbar">
                    {groceryItems.map((item) => {
                      const itemTotal = parseFloat(item.unit_price) || 0;
                      const qty = parseFloat(item.quantity) || 0;
                      const hasQty = qty > 0;
                      const rate = hasQty ? (itemTotal / qty).toFixed(2) : null;
                      const isBeingEdited = editingItemId === item.id;

                      return (
                        <div
                          key={item.id}
                          className={`flex items-center justify-between p-2.5 px-3 rounded-xl border transition-all gap-2 ${
                            isBeingEdited
                              ? "bg-primary/10 border-primary/50 shadow-xs"
                              : "bg-card border-border/70 hover:border-primary/40"
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-foreground truncate">
                                {item.name}
                              </span>
                              {item.unit && (
                                <span className="text-[9px] font-semibold px-1.5 py-0.2 bg-accent text-muted-foreground rounded border border-border/50 shrink-0">
                                  {hasQty ? `${item.quantity} ${item.unit}` : item.unit}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-muted-foreground font-numeral">
                              {hasQty
                                ? `${item.quantity} ${item.unit || "unit"} (≈ ৳${rate}/${item.unit || "unit"})`
                                : "Full item amount"}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="font-bold text-xs text-primary font-numeral">
                              ৳{itemTotal.toFixed(2)}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleStartEdit(item)}
                              className="size-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent cursor-pointer transition-colors"
                              title="Edit item"
                            >
                              <Pencil className="size-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveGroceryItem(item.id)}
                              className="size-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer transition-colors"
                              title="Remove item"
                            >
                              <Trash2 className="size-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
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
