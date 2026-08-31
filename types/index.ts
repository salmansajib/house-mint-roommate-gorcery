/**
 * Core Domain Types for HouseMint — Roommate Expense Tracker
 */

export type ExpenseCategory =
  | "groceries"
  | "rent"
  | "internet"
  | "gas"
  | "electricity"
  | "other";

export type SplitType =
  | "equal" // 50/50 split between roommates
  | "full" // 100% cost assigned to one person
  | "ratio" // Custom percentage ratio (e.g., 60/40)
  | "custom"; // Exact custom amount allocation

export interface User {
  id: string;
  name: string;
  email?: string;
  avatar_url?: string;
  accent_color?: "user-1" | "user-2" | string;
  role?: "admin" | "member"; // Admin permissions
  is_roommate?: boolean; // If false, external manager excluded from splits
}

export interface SplitShare {
  user_id: string;
  amount: number; // In BDT (৳)
  percentage?: number; // 0 - 100
}

export interface ExpenseItem {
  id: string;
  expense_id?: string;
  name: string;
  quantity?: number; // Optional (defaults to 1 if unspecified)
  unit?: string; // e.g. "kg", "gm", "pcs", "litre", "pack", "dozen"
  unit_price: number;
  total_price: number;
  assigned_to?: string | null; // If null, split by parent expense rule. If user_id, assigned 100% to that user
}

export interface Expense {
  id: string;
  title: string;
  category: ExpenseCategory;
  amount: number; // Total in BDT (৳)
  quantity?: number; // Optional quantity for single expense
  unit?: string; // Optional unit for single expense (e.g. "kg", "gm", "pcs", "litre", "pack", "dozen")
  paid_by: string; // User ID of the payer
  date: string; // ISO 8601 Date string (YYYY-MM-DD or full timestamp)
  split_type: SplitType;
  is_recurring?: boolean;
  recurring_bill_id?: string; // Optional reference to recurring bill template
  notes?: string;
  items?: ExpenseItem[]; // If itemized grocery list
  splits: SplitShare[]; // Detailed breakdown of how the amount is split
  created_at: string;
  updated_at?: string;
}

export interface RecurringBill {
  id: string;
  title: string;
  category: ExpenseCategory;
  default_amount: number; // In BDT (৳)
  billing_cycle: "monthly";
  due_day_of_month: number; // 1 - 31
  default_payer_id: string; // User ID who normally pays
  split_type: SplitType;
  participant_ids: string[]; // User IDs who share this bill
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export type BillDueUrgency =
  | "overdue"
  | "due_today"
  | "due_soon"
  | "upcoming"
  | "paid";

export interface RecurringBillStatus {
  bill: RecurringBill;
  status: BillDueUrgency;
  daysRemaining: number;
  dueDateFormatted: string;
  isPaidThisMonth: boolean;
  paidExpense?: Expense;
}

export interface Settlement {
  id: string;
  payer_id: string; // Who sent the money (debtor)
  receiver_id: string; // Who received the money (creditor)
  amount: number; // In BDT (৳)
  date: string; // ISO Date
  notes?: string;
  created_at: string;
}

export interface DebtSummary {
  from_user_id: string;
  to_user_id: string;
  amount: number; // Net amount owed in BDT
}

export interface UserBalance {
  user: User;
  total_paid: number; // Total amount paid out of pocket
  total_share: number; // Total fair share of expenses
  net_balance: number; // positive = owed money, negative = owes money
}

export interface BalanceLedger {
  user_balances: Record<string, UserBalance>;
  debts: DebtSummary[];
  total_household_spent: number;
  total_settled: number;
}

export interface CategorySummary {
  category: ExpenseCategory;
  label: string;
  total_amount: number;
  percentage: number;
  count: number;
}

export interface MonthlySummary {
  month: string; // e.g. "2026-08"
  formatted_month: string; // e.g. "August 2026"
  total_spent: number;
  categories: CategorySummary[];
  payer_breakdown: Record<string, number>;
}

export interface HouseholdSettings {
  householdName: string;
  inviteCode: string;
  adminInviteCode: string;
  defaultSplitMode: "equal" | "custom_ratio";
  defaultSplitRatios?: Record<string, number>; // user_id -> percentage
  lockedMonths?: string[]; // e.g. ["2026-07"]
  landlordName?: string;
  landlordPhone?: string;
  landlordPaymentMethod?: string;
  electricityMeterNo?: string;
  internetClientId?: string;
  emergencyFundEnabled?: boolean;
  emergencyFundBalance?: number;
}

export type NotificationActionType =
  | "expense_created"
  | "expense_updated"
  | "expense_deleted"
  | "settlement_created"
  | "recurring_bill_created"
  | "recurring_bill_logged"
  | "recurring_bill_deleted"
  | "admin_claimed"
  | "settings_updated";

export interface AppNotification {
  id: string;
  household_id?: string;
  actor_id: string; // User ID who performed the action
  actor_name: string; // Cached actor name for instant rendering
  action_type: NotificationActionType;
  title: string; // Brief title e.g. "Expense Added"
  description: string; // e.g. "Salman added 'Weekly Groceries' (৳3,450)"
  amount?: number; // Optional amount in BDT (৳)
  category?: ExpenseCategory;
  target_id?: string; // ID of the referenced expense or settlement
  target_title?: string;
  created_at: string; // ISO 8601 string
  read_by: string[]; // List of user IDs who have read this notification
}

export interface GroceryCatalogItem {
  id: string;
  household_id?: string | null;
  name_bn: string;
  name_en: string;
  banglish_aliases: string[];
  category: string;
  default_unit: string;
  usage_count?: number;
  created_at?: string;
}

