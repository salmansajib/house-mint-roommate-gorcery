import { Expense, Settlement, RecurringBill, HouseholdSettings, AppNotification } from "@/types";
import {
  createExpenseInDb,
  updateExpenseInDb,
  deleteExpenseInDb,
  createSettlementInDb,
  createRecurringBillInDb,
  deleteRecurringBillInDb,
  updateHouseholdSettingsInDb,
  createNotificationInDb,
} from "@/lib/supabase/db";

export type OfflineMutationType =
  | "CREATE_EXPENSE"
  | "UPDATE_EXPENSE"
  | "DELETE_EXPENSE"
  | "CREATE_SETTLEMENT"
  | "CREATE_RECURRING_BILL"
  | "DELETE_RECURRING_BILL"
  | "UPDATE_HOUSEHOLD_SETTINGS"
  | "CREATE_NOTIFICATION";

export interface OfflineQueueItem {
  id: string;
  type: OfflineMutationType;
  payload: any;
  timestamp: number;
  retry_count?: number;
}

const OFFLINE_QUEUE_KEY = "housemint_offline_queue_v1";

/**
 * Get all pending mutations from localStorage
 */
export function getOfflineQueue(): OfflineQueueItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn("Failed to read offline queue from localStorage:", err);
    return [];
  }
}

/**
 * Persist the mutation queue to localStorage and notify listeners
 */
function saveOfflineQueue(queue: OfflineQueueItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    window.dispatchEvent(
      new CustomEvent("housemint_offline_queue_change", {
        detail: { count: queue.length },
      })
    );
  } catch (err) {
    console.error("Failed to save offline queue to localStorage:", err);
  }
}

/**
 * Add a new mutation to the offline queue
 */
export function enqueueOfflineMutation(
  type: OfflineMutationType,
  payload: any
): OfflineQueueItem {
  const item: OfflineQueueItem = {
    id: `queue_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    type,
    payload,
    timestamp: Date.now(),
  };

  const queue = getOfflineQueue();
  queue.push(item);
  saveOfflineQueue(queue);

  return item;
}

/**
 * Remove a mutation by ID from the queue
 */
export function dequeueOfflineMutation(id: string): void {
  const queue = getOfflineQueue().filter((item) => item.id !== id);
  saveOfflineQueue(queue);
}

/**
 * Clear the entire offline queue
 */
export function clearOfflineQueue(): void {
  saveOfflineQueue([]);
}

/**
 * Returns true if there are pending operations for a given expense or bill ID
 */
export function hasPendingOfflineMutation(targetId: string): boolean {
  const queue = getOfflineQueue();
  return queue.some((item) => {
    if (item.type === "CREATE_EXPENSE" || item.type === "UPDATE_EXPENSE") {
      return item.payload?.id === targetId;
    }
    if (item.type === "DELETE_EXPENSE") {
      return item.payload?.id === targetId;
    }
    if (item.type === "CREATE_RECURRING_BILL" || item.type === "DELETE_RECURRING_BILL") {
      return item.payload?.id === targetId;
    }
    return false;
  });
}

/**
 * Flushes all pending mutations to Supabase sequentially.
 * Stops and keeps remaining queue if a network failure occurs.
 */
export async function flushOfflineQueue(): Promise<{
  processed: number;
  remaining: number;
}> {
  if (typeof window === "undefined" || !navigator.onLine) {
    return { processed: 0, remaining: getOfflineQueue().length };
  }

  const queue = getOfflineQueue();
  if (queue.length === 0) {
    return { processed: 0, remaining: 0 };
  }

  let processedCount = 0;
  const remainingQueue = [...queue];

  for (const item of queue) {
    try {
      let success = false;

      switch (item.type) {
        case "CREATE_EXPENSE":
          success = await createExpenseInDb(item.payload as Expense);
          break;

        case "UPDATE_EXPENSE":
          success = await updateExpenseInDb(item.payload as Expense);
          break;

        case "DELETE_EXPENSE":
          success = await deleteExpenseInDb(item.payload.id);
          break;

        case "CREATE_SETTLEMENT":
          success = await createSettlementInDb(item.payload as Settlement);
          break;

        case "CREATE_RECURRING_BILL":
          success = await createRecurringBillInDb(item.payload as RecurringBill);
          break;

        case "DELETE_RECURRING_BILL":
          success = await deleteRecurringBillInDb(item.payload.id);
          break;

        case "UPDATE_HOUSEHOLD_SETTINGS":
          success = await updateHouseholdSettingsInDb(
            item.payload as HouseholdSettings
          );
          break;

        case "CREATE_NOTIFICATION":
          success = await createNotificationInDb(
            item.payload as AppNotification
          );
          break;

        default:
          console.warn("Unknown offline mutation type:", item.type);
          success = true; // Drop unrecognized item to prevent infinite block
      }

      if (success) {
        processedCount++;
        // Remove from remaining queue
        const idx = remainingQueue.findIndex((q) => q.id === item.id);
        if (idx !== -1) {
          remainingQueue.splice(idx, 1);
        }
        saveOfflineQueue(remainingQueue);
      } else {
        // Increment retry count
        const currentRetries = (item.retry_count || 0) + 1;
        if (currentRetries >= 3) {
          console.warn(
            `[OfflineSync] Dropping unrecoverable mutation ${item.type} (${item.id}) after 3 attempts to prevent blocking the queue.`
          );
          const idx = remainingQueue.findIndex((q) => q.id === item.id);
          if (idx !== -1) {
            remainingQueue.splice(idx, 1);
          }
          saveOfflineQueue(remainingQueue);
        } else {
          const idx = remainingQueue.findIndex((q) => q.id === item.id);
          if (idx !== -1) {
            remainingQueue[idx] = { ...item, retry_count: currentRetries };
          }
          saveOfflineQueue(remainingQueue);
          console.warn(
            `[OfflineSync] Failed to process ${item.type} (${item.id}), attempt ${currentRetries}/3. Deferring.`
          );
          break;
        }
      }
    } catch (err) {
      console.warn(`[OfflineSync] Network error while processing ${item.type}:`, err);
      break;
    }
  }

  return { processed: processedCount, remaining: remainingQueue.length };
}
