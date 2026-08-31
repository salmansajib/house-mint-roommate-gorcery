import { RecurringBill, RecurringBillStatus, BillDueUrgency, Expense } from "@/types";
import { format, differenceInCalendarDays } from "date-fns";

/**
 * Format day of month with ordinal suffix (e.g. 1st, 2nd, 3rd, 4th, 15th)
 */
export function formatOrdinalDay(day: number): string {
  const suffixes = ["th", "st", "nd", "rd"];
  const v = day % 100;
  return `${day}${suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]}`;
}

/**
 * Compute the due date and current payment status for recurring bills in a given month.
 */
export function calculateRecurringBillStatuses(
  bills: RecurringBill[],
  expenses: Expense[],
  referenceDate: Date = new Date()
): RecurringBillStatus[] {
  const currentYear = referenceDate.getFullYear();
  const currentMonthIndex = referenceDate.getMonth(); // 0-11
  const currentMonthStr = format(referenceDate, "yyyy-MM");

  // Map each active bill to its status
  const statuses: RecurringBillStatus[] = bills
    .filter((b) => b.is_active)
    .map((bill) => {
      // Find matching expense paid in this month
      const paidExpense = expenses.find((exp) => {
        const inThisMonth = exp.date.startsWith(currentMonthStr);
        if (!inThisMonth) return false;

        // Match either explicit recurring_bill_id or title & category match
        if (exp.recurring_bill_id && exp.recurring_bill_id === bill.id) {
          return true;
        }

        return (
          exp.is_recurring &&
          exp.category === bill.category &&
          (exp.title.toLowerCase().includes(bill.title.toLowerCase()) ||
            bill.title.toLowerCase().includes(exp.title.toLowerCase()))
        );
      });

      // Target due date in this month (clamp to max days of the month)
      const maxDaysInMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate();
      const clampedDueDay = Math.min(bill.due_day_of_month, maxDaysInMonth);
      const dueDate = new Date(currentYear, currentMonthIndex, clampedDueDay);

      const daysRemaining = differenceInCalendarDays(dueDate, referenceDate);
      const dueDateFormatted = `${formatOrdinalDay(clampedDueDay)} of ${format(dueDate, "MMM")}`;

      if (paidExpense) {
        return {
          bill,
          status: "paid" as BillDueUrgency,
          daysRemaining,
          dueDateFormatted,
          isPaidThisMonth: true,
          paidExpense,
        };
      }

      // Determine urgency for unpaid bill
      let status: BillDueUrgency;
      if (daysRemaining < 0) {
        status = "overdue";
      } else if (daysRemaining === 0) {
        status = "due_today";
      } else if (daysRemaining <= 5) {
        status = "due_soon";
      } else {
        status = "upcoming";
      }

      return {
        bill,
        status,
        daysRemaining,
        dueDateFormatted,
        isPaidThisMonth: false,
      };
    });

  // Urgency priority ordering for display:
  // 1. overdue
  // 2. due_today
  // 3. due_soon
  // 4. upcoming
  // 5. paid
  const priorityMap: Record<BillDueUrgency, number> = {
    overdue: 1,
    due_today: 2,
    due_soon: 3,
    upcoming: 4,
    paid: 5,
  };

  return statuses.sort((a, b) => {
    const priorityDiff = priorityMap[a.status] - priorityMap[b.status];
    if (priorityDiff !== 0) return priorityDiff;
    // Secondary sort: soonest due date first
    return a.daysRemaining - b.daysRemaining;
  });
}

/**
 * Summary metrics for recurring bills in the current month
 */
export interface RecurringBillsMetrics {
  totalBills: number;
  paidCount: number;
  pendingCount: number;
  overdueCount: number;
  dueSoonCount: number;
  totalMonthlyBudget: number;
  totalPaidAmount: number;
  totalPendingAmount: number;
}

export function calculateRecurringMetrics(
  statuses: RecurringBillStatus[]
): RecurringBillsMetrics {
  let paidCount = 0;
  let overdueCount = 0;
  let dueSoonCount = 0;
  let totalMonthlyBudget = 0;
  let totalPaidAmount = 0;
  let totalPendingAmount = 0;

  for (const s of statuses) {
    totalMonthlyBudget += s.bill.default_amount;
    if (s.isPaidThisMonth) {
      paidCount++;
      totalPaidAmount += s.paidExpense ? s.paidExpense.amount : s.bill.default_amount;
    } else {
      totalPendingAmount += s.bill.default_amount;
      if (s.status === "overdue") overdueCount++;
      if (s.status === "due_soon" || s.status === "due_today") dueSoonCount++;
    }
  }

  return {
    totalBills: statuses.length,
    paidCount,
    pendingCount: statuses.length - paidCount,
    overdueCount,
    dueSoonCount,
    totalMonthlyBudget,
    totalPaidAmount,
    totalPendingAmount,
  };
}

/**
 * Returns semantic badge classes per AGENTS.md guidelines (no arbitrary palette colors)
 */
export function getUrgencyBadgeConfig(status: BillDueUrgency): {
  label: string;
  className: string;
  badgeVariant: "default" | "secondary" | "outline" | "destructive";
} {
  switch (status) {
    case "overdue":
      return {
        label: "Overdue",
        className: "bg-destructive/15 text-destructive border-destructive/30",
        badgeVariant: "outline",
      };
    case "due_today":
      return {
        label: "Due Today",
        className: "bg-warning/20 text-warning border-warning/40 animate-pulse",
        badgeVariant: "outline",
      };
    case "due_soon":
      return {
        label: "Due Soon",
        className: "bg-warning/15 text-warning border-warning/30",
        badgeVariant: "outline",
      };
    case "upcoming":
      return {
        label: "Upcoming",
        className: "bg-muted text-muted-foreground border-border",
        badgeVariant: "outline",
      };
    case "paid":
      return {
        label: "Paid",
        className: "bg-positive/15 text-positive border-positive/30",
        badgeVariant: "outline",
      };
  }
}
