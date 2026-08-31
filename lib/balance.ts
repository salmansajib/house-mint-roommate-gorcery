import {
  Expense,
  Settlement,
  User,
  BalanceLedger,
  UserBalance,
  DebtSummary,
  CategorySummary,
  ExpenseCategory,
  MonthlySummary,
} from "@/types";
import { format, parseISO } from "date-fns";

export const CATEGORY_META: Record<
  ExpenseCategory,
  { label: string; icon: string; color: string; badgeVariant: "groceries" | "rent" | "electricity" | "gas" | "internet" | "default" }
> = {
  groceries: {
    label: "Groceries",
    icon: "ShoppingBag",
    color: "var(--cat-groceries)",
    badgeVariant: "groceries",
  },
  rent: {
    label: "Rent",
    icon: "Home",
    color: "var(--cat-rent)",
    badgeVariant: "rent",
  },
  electricity: {
    label: "Electricity",
    icon: "Zap",
    color: "var(--cat-electricity)",
    badgeVariant: "electricity",
  },
  gas: {
    label: "Gas",
    icon: "Flame",
    color: "var(--cat-gas)",
    badgeVariant: "gas",
  },
  internet: {
    label: "Internet",
    icon: "Wifi",
    color: "var(--cat-internet)",
    badgeVariant: "internet",
  },
  other: {
    label: "Other",
    icon: "Tag",
    color: "var(--cat-other)",
    badgeVariant: "default",
  },
};

/**
 * Calculate net balances and debts between roommates given all expenses and settlements
 */
export function calculateBalanceLedger(
  users: User[],
  expenses: Expense[],
  settlements: Settlement[]
): BalanceLedger {
  const userBalances: Record<string, UserBalance> = {};

  // Initialize ledger entries for all users
  for (const user of users) {
    userBalances[user.id] = {
      user,
      total_paid: 0,
      total_share: 0,
      net_balance: 0,
    };
  }

  let totalHouseholdSpent = 0;
  let totalSettled = 0;

  // Process all expenses
  for (const expense of expenses) {
    totalHouseholdSpent += expense.amount;

    // Credit the payer
    if (userBalances[expense.paid_by]) {
      userBalances[expense.paid_by].total_paid += expense.amount;
    }

    // Debit each roommate's fair share
    for (const split of expense.splits) {
      if (userBalances[split.user_id]) {
        userBalances[split.user_id].total_share += split.amount;
      }
    }
  }

  // Process all settlements (direct debt repayments)
  for (const settlement of settlements) {
    totalSettled += settlement.amount;

    // Payer gave money, so they reduce their debt (or increase credit)
    if (userBalances[settlement.payer_id]) {
      userBalances[settlement.payer_id].total_paid += settlement.amount;
    }

    // Receiver received money, so their credit decreases
    if (userBalances[settlement.receiver_id]) {
      userBalances[settlement.receiver_id].total_share += settlement.amount;
    }
  }

  // Calculate net balances (total_paid - total_share)
  // Positive: Owed money from the house
  // Negative: Owes money to the house
  for (const userId in userBalances) {
    const ub = userBalances[userId];
    ub.net_balance = Number((ub.total_paid - ub.total_share).toFixed(2));
  }

  // Calculate pairwise debts for N users using Min-Cash-Flow algorithm
  const debts: DebtSummary[] = [];
  
  // Clone balances for greedy settlement
  const debtors: { userId: string; amount: number }[] = [];
  const creditors: { userId: string; amount: number }[] = [];

  for (const userId in userBalances) {
    const net = userBalances[userId].net_balance;
    if (net < -0.01) {
      debtors.push({ userId, amount: Math.abs(net) });
    } else if (net > 0.01) {
      creditors.push({ userId, amount: net });
    }
  }

  // Sort debtors & creditors by amount descending
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  let dIdx = 0;
  let cIdx = 0;

  while (dIdx < debtors.length && cIdx < creditors.length) {
    const debtor = debtors[dIdx];
    const creditor = creditors[cIdx];

    const settledAmount = Math.min(debtor.amount, creditor.amount);

    if (settledAmount > 0.01) {
      debts.push({
        from_user_id: debtor.userId,
        to_user_id: creditor.userId,
        amount: Number(settledAmount.toFixed(2)),
      });
    }

    debtor.amount = Number((debtor.amount - settledAmount).toFixed(2));
    creditor.amount = Number((creditor.amount - settledAmount).toFixed(2));

    if (debtor.amount <= 0.01) dIdx++;
    if (creditor.amount <= 0.01) cIdx++;
  }

  return {
    user_balances: userBalances,
    debts,
    total_household_spent: Number(totalHouseholdSpent.toFixed(2)),
    total_settled: Number(totalSettled.toFixed(2)),
  };
}

/**
 * Get direct pairwise debts relevant to a specific user
 */
export function getUserDebts(
  debts: DebtSummary[],
  userId: string
): {
  owedToUser: DebtSummary[];
  userOwes: DebtSummary[];
} {
  return {
    owedToUser: debts.filter((d) => d.to_user_id === userId),
    userOwes: debts.filter((d) => d.from_user_id === userId),
  };
}

/**
 * Calculate category spending summary for a given list of expenses
 */
export function calculateCategoryBreakdown(
  expenses: Expense[]
): CategorySummary[] {
  const categoryTotals: Record<ExpenseCategory, { total: number; count: number }> = {
    groceries: { total: 0, count: 0 },
    rent: { total: 0, count: 0 },
    electricity: { total: 0, count: 0 },
    gas: { total: 0, count: 0 },
    internet: { total: 0, count: 0 },
    other: { total: 0, count: 0 },
  };

  let totalSpent = 0;
  for (const exp of expenses) {
    if (categoryTotals[exp.category]) {
      categoryTotals[exp.category].total += exp.amount;
      categoryTotals[exp.category].count += 1;
      totalSpent += exp.amount;
    }
  }

  return (Object.keys(categoryTotals) as ExpenseCategory[])
    .map((cat) => {
      const data = categoryTotals[cat];
      return {
        category: cat,
        label: CATEGORY_META[cat]?.label || cat,
        total_amount: Number(data.total.toFixed(2)),
        percentage: totalSpent > 0 ? Number(((data.total / totalSpent) * 100).toFixed(1)) : 0,
        count: data.count,
      };
    })
    .filter((cat) => cat.count > 0 || cat.total_amount > 0)
    .sort((a, b) => b.total_amount - a.total_amount);
}

/**
 * Group expenses by month and compute monthly breakdown
 */
export function calculateMonthlySummaries(
  expenses: Expense[]
): MonthlySummary[] {
  const monthGroups: Record<string, Expense[]> = {};

  for (const exp of expenses) {
    try {
      const monthKey = format(parseISO(exp.date), "yyyy-MM");
      if (!monthGroups[monthKey]) {
        monthGroups[monthKey] = [];
      }
      monthGroups[monthKey].push(exp);
    } catch {
      // Fallback if invalid date
      const monthKey = "Unknown";
      if (!monthGroups[monthKey]) monthGroups[monthKey] = [];
      monthGroups[monthKey].push(exp);
    }
  }

  return Object.keys(monthGroups)
    .sort()
    .reverse()
    .map((monthKey) => {
      const monthExpenses = monthGroups[monthKey];
      let formattedMonth = monthKey;
      try {
        formattedMonth = format(parseISO(`${monthKey}-01`), "MMMM yyyy");
      } catch {
        formattedMonth = monthKey;
      }

      let totalSpent = 0;
      const payerBreakdown: Record<string, number> = {};

      for (const exp of monthExpenses) {
        totalSpent += exp.amount;
        payerBreakdown[exp.paid_by] = (payerBreakdown[exp.paid_by] || 0) + exp.amount;
      }

      return {
        month: monthKey,
        formatted_month: formattedMonth,
        total_spent: Number(totalSpent.toFixed(2)),
        categories: calculateCategoryBreakdown(monthExpenses),
        payer_breakdown: payerBreakdown,
      };
    });
}

/**
 * Compute 50/50 splits for 2 users with integer poisha precision rule:
 * Extra 1 poisha / odd division remains with payer or equally divided
 */
export function computeEqualSplit(
  amount: number,
  users: User[],
  paidByUserId: string
): { user_id: string; amount: number; percentage: number }[] {
  // Only roommates participate in default splits (exclude external property managers/admins)
  const activeRoommates = users.filter((u) => u.is_roommate !== false);
  const targetUsers = activeRoommates.length > 0 ? activeRoommates : users;

  if (targetUsers.length === 0) return [];
  if (targetUsers.length === 1) {
    return [{ user_id: targetUsers[0].id, amount, percentage: 100 }];
  }

  const rawShare = Number((amount / targetUsers.length).toFixed(2));
  const totalAllocated = rawShare * targetUsers.length;
  const difference = Number((amount - totalAllocated).toFixed(2));

  return targetUsers.map((u) => {
    // If there is an odd cent/poisha difference, assign the remainder to the payer
    const userAmount =
      u.id === paidByUserId ? Number((rawShare + difference).toFixed(2)) : rawShare;
    return {
      user_id: u.id,
      amount: userAmount,
      percentage: Number(((userAmount / amount) * 100).toFixed(1)),
    };
  });
}
