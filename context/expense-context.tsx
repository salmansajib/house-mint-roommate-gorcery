"use client";

import * as React from "react";
import {
  Expense,
  Settlement,
  User,
  BalanceLedger,
  ExpenseCategory,
  MonthlySummary,
  CategorySummary,
  RecurringBill,
  RecurringBillStatus,
  HouseholdSettings,
  AppNotification,
  NotificationActionType,
} from "@/types";
import {
  INITIAL_USERS,
  INITIAL_EXPENSES,
  INITIAL_SETTLEMENTS,
  INITIAL_RECURRING_BILLS,
  INITIAL_HOUSEHOLD_SETTINGS,
  INITIAL_NOTIFICATIONS,
} from "@/lib/mock-data";
import {
  calculateBalanceLedger,
  calculateCategoryBreakdown,
  calculateMonthlySummaries,
  computeEqualSplit,
} from "@/lib/balance";
import {
  calculateRecurringBillStatuses,
  calculateRecurringMetrics,
  RecurringBillsMetrics,
} from "@/lib/recurring-bills";
import { format } from "date-fns";
import { formatBDT } from "@/lib/utils";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  fetchHouseholdData,
  createExpenseInDb,
  updateExpenseInDb,
  deleteExpenseInDb,
  createSettlementInDb,
  createRecurringBillInDb,
  deleteRecurringBillInDb,
  updateHouseholdSettingsInDb,
  updateUserRoleInDb,
  updateUserResidentStatusInDb,
  createProfileInDb,
  createNotificationInDb,
  markNotificationReadInDb,
  markAllNotificationsReadInDb,
  clearNotificationsInDb,
  APARTMENT_INVITE_CODE,
  APARTMENT_ADMIN_KEY,
  DEFAULT_HOUSEHOLD_ID,
} from "@/lib/supabase/db";

import { useAuth } from "./auth-context";

interface ExpenseContextType {
  users: User[];
  currentUser: User;
  setCurrentUser: (user: User) => void;
  isAdmin: boolean;
  householdSettings: HouseholdSettings;
  expenses: Expense[];
  allExpenses: Expense[];
  settlements: Settlement[];
  ledger: BalanceLedger;
  monthlySummaries: MonthlySummary[];
  categoryBreakdown: CategorySummary[];
  recurringBills: RecurringBill[];
  recurringBillStatuses: RecurringBillStatus[];
  recurringMetrics: RecurringBillsMetrics;
  selectedCategory: ExpenseCategory | "all";
  setSelectedCategory: (cat: ExpenseCategory | "all") => void;
  selectedMonth: string | "all";
  setSelectedMonth: (month: string | "all") => void;
  isLoaded: boolean;
  isCloudConnected: boolean;
  isSyncing: boolean;
  addExpense: (
    expense: Omit<Expense, "id" | "created_at"> & { created_at?: string }
  ) => void;
  editExpense: (id: string, updated: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  addSettlement: (settlement: Omit<Settlement, "id" | "created_at">) => void;
  addRecurringBill: (bill: Omit<RecurringBill, "id" | "created_at">) => void;
  editRecurringBill: (id: string, updated: Partial<RecurringBill>) => void;
  deleteRecurringBill: (id: string) => void;
  logRecurringBillExpense: (
    billId: string,
    customAmount?: number,
    customDate?: string,
    customPayerId?: string
  ) => void;
  updateHouseholdSettings: (settings: Partial<HouseholdSettings>) => void;
  updateUserRole: (userId: string, role: "admin" | "member") => void;
  updateUserResidentStatus: (userId: string, isRoommate: boolean) => void;
  addUser: (user: Omit<User, "id">) => void;
  notifications: AppNotification[];
  unreadNotificationCount: number;
  latestLiveToast: AppNotification | null;
  dismissLiveToast: () => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearAllNotifications: () => void;
  claimAdminAccess: (adminKey: string) => boolean;
  resetToDefaults: () => void;
}

const ExpenseContext = React.createContext<ExpenseContextType | null>(null);

const STORAGE_KEYS = {
  USERS: "housemint_users_v1",
  CURRENT_USER: "housemint_current_user_v1",
  EXPENSES: "housemint_expenses_v1",
  SETTLEMENTS: "housemint_settlements_v1",
  RECURRING_BILLS: "housemint_recurring_bills_v1",
  HOUSEHOLD_SETTINGS: "housemint_household_settings_v1",
  NOTIFICATIONS: "housemint_notifications_v1",
};

const DEFAULT_GUEST_USER: User = {
  id: "guest",
  name: "Roommate",
  accent_color: "user-1",
};

const DEFAULT_HOUSEHOLD_SETTINGS: HouseholdSettings = {
  householdName: "Our Apartment",
  inviteCode: APARTMENT_INVITE_CODE,
  adminInviteCode: APARTMENT_ADMIN_KEY,
  defaultSplitMode: "equal",
  emergencyFundEnabled: false,
  lockedMonths: [],
};

export function ExpenseProvider({ children }: { children: React.ReactNode }) {
  const { currentUser: authUser, setCurrentUser: setAuthUser } = useAuth();
  const [users, setUsers] = React.useState<User[]>(() => {
    if (isSupabaseConfigured()) {
      return authUser ? [authUser] : [];
    }
    return INITIAL_USERS;
  });
  const currentUser = authUser || users[0] || DEFAULT_GUEST_USER;
  const setCurrentUser = setAuthUser;

  const [householdSettings, setHouseholdSettings] =
    React.useState<HouseholdSettings>(() => {
      if (isSupabaseConfigured()) {
        return DEFAULT_HOUSEHOLD_SETTINGS;
      }
      return INITIAL_HOUSEHOLD_SETTINGS;
    });

  const isAdmin = currentUser?.role === "admin";

  const [expenses, setExpenses] = React.useState<Expense[]>(() => {
    if (isSupabaseConfigured()) return [];
    return INITIAL_EXPENSES;
  });
  const [settlements, setSettlements] = React.useState<Settlement[]>(() => {
    if (isSupabaseConfigured()) return [];
    return INITIAL_SETTLEMENTS;
  });
  const [recurringBills, setRecurringBills] = React.useState<RecurringBill[]>(() => {
    if (isSupabaseConfigured()) return [];
    return INITIAL_RECURRING_BILLS;
  });
  const [notifications, setNotifications] = React.useState<AppNotification[]>(() => {
    if (isSupabaseConfigured()) return [];
    return INITIAL_NOTIFICATIONS;
  });
  const [latestLiveToast, setLatestLiveToast] = React.useState<AppNotification | null>(null);

  const currentUserRef = React.useRef(currentUser);
  React.useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  const [isLoaded, setIsLoaded] = React.useState(false);
  const [isCloudConnected, setIsCloudConnected] = React.useState(false);
  const [isSyncing, setIsSyncing] = React.useState(false);

  const [selectedCategory, setSelectedCategory] = React.useState<
    ExpenseCategory | "all"
  >("all");
  const [selectedMonth, setSelectedMonth] = React.useState<string | "all">(
    "all"
  );

  // Sync state from Supabase Cloud
  const syncWithSupabase = React.useCallback(async () => {
    if (!isSupabaseConfigured()) return false;

    try {
      setIsSyncing(true);
      const cloudData = await fetchHouseholdData();
      if (cloudData) {
        const resolvedUsers =
          cloudData.users.length > 0
            ? cloudData.users
            : authUser
            ? [authUser]
            : [];
        setUsers(resolvedUsers);
        setExpenses(cloudData.expenses);
        setSettlements(cloudData.settlements);
        setRecurringBills(cloudData.recurringBills);
        if (cloudData.notifications !== undefined) {
          setNotifications(cloudData.notifications);
        }
        if (cloudData.settings) {
          setHouseholdSettings(cloudData.settings);
        }
        setIsCloudConnected(true);
        return true;
      }
    } catch (e) {
      console.warn("Could not sync with Supabase cloud:", e);
    } finally {
      setIsSyncing(false);
    }
    return false;
  }, [authUser]);

  // Keep users array in sync when authUser becomes available
  React.useEffect(() => {
    if (authUser && users.length === 0) {
      setUsers([authUser]);
    }
  }, [authUser, users.length]);

  // Hydrate on initial mount: Clean cloud mode or fallback to local storage
  React.useEffect(() => {
    async function initData() {
      // 1. In offline mode, check local storage. In cloud mode, clear stale demo mock data.
      try {
        const savedNotifications = localStorage.getItem(
          STORAGE_KEYS.NOTIFICATIONS
        );
        if (savedNotifications) {
          try {
            setNotifications(JSON.parse(savedNotifications));
          } catch {}
        }

        if (!isSupabaseConfigured()) {
          const savedExpenses = localStorage.getItem(STORAGE_KEYS.EXPENSES);
          const savedSettlements = localStorage.getItem(STORAGE_KEYS.SETTLEMENTS);
          const savedRecurringBills = localStorage.getItem(
            STORAGE_KEYS.RECURRING_BILLS
          );
          const savedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
          const savedSettings = localStorage.getItem(STORAGE_KEYS.HOUSEHOLD_SETTINGS);
          const savedUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);

          if (savedExpenses) setExpenses(JSON.parse(savedExpenses));
          if (savedSettlements) setSettlements(JSON.parse(savedSettlements));
          if (savedRecurringBills) setRecurringBills(JSON.parse(savedRecurringBills));
          if (savedUsers) setUsers(JSON.parse(savedUsers));
          if (savedSettings) setHouseholdSettings(JSON.parse(savedSettings));
          if (savedUser) {
            const found = INITIAL_USERS.find((u) => u.id === savedUser);
            if (found) setCurrentUser(found);
          }

          // Small graceful delay in offline mode so the skeleton transition is visible on reload
          await new Promise((resolve) => setTimeout(resolve, 300));
        } else {
          // If previous prototype mock data exists in localStorage, clear it immediately
          const savedExpenses = localStorage.getItem(STORAGE_KEYS.EXPENSES);
          if (
            savedExpenses &&
            (savedExpenses.includes("exp-1") || savedExpenses.includes("user-salman"))
          ) {
            localStorage.removeItem(STORAGE_KEYS.EXPENSES);
            localStorage.removeItem(STORAGE_KEYS.SETTLEMENTS);
            localStorage.removeItem(STORAGE_KEYS.RECURRING_BILLS);
            localStorage.removeItem(STORAGE_KEYS.USERS);
            localStorage.removeItem(STORAGE_KEYS.HOUSEHOLD_SETTINGS);
            localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
          }

          // 2. Hydrate from Supabase Cloud before marking loaded
          const connected = await syncWithSupabase();
          if (!connected) {
            setIsCloudConnected(false);
          }
        }
      } catch (e) {
        console.error("Failed to load initial state:", e);
      } finally {
        setIsLoaded(true);
      }
    }

    initData();
  }, [syncWithSupabase]);

  // Realtime WebSocket Subscription
  React.useEffect(() => {
    const supabase = createClient();
    if (!supabase || !isSupabaseConfigured()) return;

    // Listen to changes across household tables
    const channel = supabase
      .channel("housemint-realtime-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "expenses" },
        () => syncWithSupabase()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "settlements" },
        () => syncWithSupabase()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "recurring_bills" },
        () => syncWithSupabase()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        () => syncWithSupabase()
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        (payload: any) => {
          const n = payload.new;
          if (n) {
            const mapped: AppNotification = {
              id: n.id,
              household_id: n.household_id,
              actor_id: n.actor_id,
              actor_name: n.actor_name,
              action_type: n.action_type,
              title: n.title,
              description: n.description,
              amount: n.amount != null ? Number(n.amount) : undefined,
              category: n.category || undefined,
              target_id: n.target_id || undefined,
              target_title: n.target_title || undefined,
              created_at: n.created_at,
              read_by: Array.isArray(n.read_by) ? n.read_by : [],
            };
            setNotifications((prev) => {
              if (prev.some((item) => item.id === mapped.id)) return prev;
              return [mapped, ...prev.slice(0, 49)];
            });
            // If action was triggered by another roommate, trigger in-app floating banner!
            if (mapped.actor_id !== currentUserRef.current?.id) {
              setLatestLiveToast(mapped);
            }
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "notifications" },
        (payload: any) => {
          const u = payload.new;
          if (u) {
            setNotifications((prev) =>
              prev.map((item) =>
                item.id === u.id
                  ? {
                      ...item,
                      read_by: Array.isArray(u.read_by) ? u.read_by : [],
                    }
                  : item
              )
            );
          }
        }
      )
      .subscribe((status: string) => {
        if (status === "SUBSCRIBED") {
          setIsCloudConnected(true);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [syncWithSupabase]);

  // Save to localStorage as offline cache
  React.useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
      localStorage.setItem(
        STORAGE_KEYS.SETTLEMENTS,
        JSON.stringify(settlements)
      );
      localStorage.setItem(
        STORAGE_KEYS.RECURRING_BILLS,
        JSON.stringify(recurringBills)
      );
      localStorage.setItem(
        STORAGE_KEYS.NOTIFICATIONS,
        JSON.stringify(notifications)
      );
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, currentUser.id);
    } catch (e) {
      console.error("Failed to save state:", e);
    }
  }, [expenses, settlements, recurringBills, notifications, currentUser, isLoaded]);

  // Derived calculations
  const filteredExpenses = React.useMemo(() => {
    const list = expenses.filter((exp) => {
      if (selectedCategory !== "all" && exp.category !== selectedCategory) {
        return false;
      }
      if (selectedMonth !== "all" && !exp.date.startsWith(selectedMonth)) {
        return false;
      }
      return true;
    });

    return list.sort((a, b) => {
      const timeA = new Date(a.created_at || a.date).getTime();
      const timeB = new Date(b.created_at || b.date).getTime();
      return timeB - timeA;
    });
  }, [expenses, selectedCategory, selectedMonth]);

  const ledger = React.useMemo(() => {
    return calculateBalanceLedger(users, expenses, settlements);
  }, [users, expenses, settlements]);

  const categoryBreakdown = React.useMemo(() => {
    return calculateCategoryBreakdown(filteredExpenses);
  }, [filteredExpenses]);

  const monthlySummaries = React.useMemo(() => {
    return calculateMonthlySummaries(expenses);
  }, [expenses]);

  const recurringBillStatuses = React.useMemo(() => {
    return calculateRecurringBillStatuses(recurringBills, expenses);
  }, [recurringBills, expenses]);

  const recurringMetrics = React.useMemo(() => {
    return calculateRecurringMetrics(recurringBillStatuses);
  }, [recurringBillStatuses]);

  // Notifications API
  const unreadNotificationCount = React.useMemo(() => {
    if (!currentUser) return 0;
    return notifications.filter(
      (n) => !n.read_by || !n.read_by.includes(currentUser.id)
    ).length;
  }, [notifications, currentUser]);

  const dismissLiveToast = React.useCallback(() => {
    setLatestLiveToast(null);
  }, []);

  const addNotification = React.useCallback(
    (data: {
      action_type: NotificationActionType;
      title: string;
      description: string;
      amount?: number;
      category?: ExpenseCategory;
      target_id?: string;
      target_title?: string;
      actor_id?: string;
      actor_name?: string;
    }) => {
      const actorId = data.actor_id || currentUser.id;
      const actorName = data.actor_name || currentUser.name || "Roommate";
      const notif: AppNotification = {
        id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        household_id: DEFAULT_HOUSEHOLD_ID,
        actor_id: actorId,
        actor_name: actorName,
        action_type: data.action_type,
        title: data.title,
        description: data.description,
        amount: data.amount,
        category: data.category,
        target_id: data.target_id,
        target_title: data.target_title,
        created_at: new Date().toISOString(),
        read_by: [], // Starts unread so the badge number increments on the icon
      };

      setNotifications((prev) => [notif, ...prev.slice(0, 49)]);

      if (isSupabaseConfigured()) {
        createNotificationInDb(notif).catch((err) =>
          console.warn("createNotificationInDb failed:", err)
        );
      }
    },
    [currentUser]
  );

  const markNotificationAsRead = React.useCallback(
    (id: string) => {
      setNotifications((prev) => {
        const next = prev.map((n) => {
          const currentRead = Array.isArray(n.read_by) ? n.read_by : [];
          if (n.id === id && !currentRead.includes(currentUser.id)) {
            return { ...n, read_by: [...currentRead, currentUser.id] };
          }
          return n;
        });
        try {
          localStorage.setItem(
            STORAGE_KEYS.NOTIFICATIONS,
            JSON.stringify(next)
          );
        } catch {}
        return next;
      });
      if (isSupabaseConfigured()) {
        markNotificationReadInDb(id, currentUser.id).catch(() => {});
      }
    },
    [currentUser.id]
  );

  const markAllNotificationsAsRead = React.useCallback(() => {
    setNotifications((prev) => {
      const next = prev.map((n) => {
        const currentRead = Array.isArray(n.read_by) ? n.read_by : [];
        return currentRead.includes(currentUser.id)
          ? n
          : { ...n, read_by: [...currentRead, currentUser.id] };
      });
      try {
        localStorage.setItem(
          STORAGE_KEYS.NOTIFICATIONS,
          JSON.stringify(next)
        );
      } catch {}
      return next;
    });
    if (isSupabaseConfigured()) {
      markAllNotificationsReadInDb(DEFAULT_HOUSEHOLD_ID, currentUser.id).catch(
        () => {}
      );
    }
  }, [currentUser.id]);

  const clearAllNotifications = React.useCallback(() => {
    setNotifications([]);
    try {
      localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    } catch {}
    if (isSupabaseConfigured()) {
      clearNotificationsInDb(DEFAULT_HOUSEHOLD_ID).catch(() => {});
    }
  }, []);

  const addExpense = React.useCallback(
    (newExp: Omit<Expense, "id" | "created_at"> & { created_at?: string }) => {
      const expense: Expense = {
        ...newExp,
        id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        created_at: newExp.created_at || new Date().toISOString(),
      };
      setExpenses((prev) => [expense, ...prev]);

      // Trigger notification for all roommates
      addNotification({
        action_type: "expense_created",
        title: "Expense Added",
        description: `${currentUser.name} added '${expense.title}' (${formatBDT(expense.amount)})`,
        amount: expense.amount,
        category: expense.category,
        target_id: expense.id,
        target_title: expense.title,
      });

      // Cloud mutation in background
      if (isSupabaseConfigured()) {
        createExpenseInDb(expense).catch((err) =>
          console.error("Supabase createExpense error:", err)
        );
      }
    },
    [addNotification, currentUser.name]
  );

  const editExpense = React.useCallback(
    (id: string, updated: Partial<Expense>) => {
      // Permission Guard: Either the original payer or an Admin can edit
      const targetExpense = expenses.find((exp) => exp.id === id);
      if (!targetExpense) return;

      const canEdit =
        targetExpense.paid_by === currentUser.id || currentUser.role === "admin";

      if (!canEdit) {
        console.warn(
          `[Permission Guard] Unauthorized edit attempt: User ${currentUser.id} is neither the payer (${targetExpense.paid_by}) nor an admin.`
        );
        return;
      }

      const updatedExpense: Expense = {
        ...targetExpense,
        ...updated,
        updated_at: new Date().toISOString(),
      };

      setExpenses((prev) =>
        prev.map((item) => (item.id === id ? updatedExpense : item))
      );

      // Trigger notification for update
      addNotification({
        action_type: "expense_updated",
        title: "Expense Updated",
        description: `${currentUser.name} edited '${updatedExpense.title}'`,
        amount: updatedExpense.amount,
        category: updatedExpense.category,
        target_id: id,
        target_title: updatedExpense.title,
      });

      // Cloud mutation in background
      if (isSupabaseConfigured()) {
        updateExpenseInDb(updatedExpense).catch((err) =>
          console.error("Supabase updateExpense error:", err)
        );
      }
    },
    [expenses, currentUser.id, currentUser.role, currentUser.name, addNotification]
  );

  const deleteExpense = React.useCallback(
    (id: string) => {
      // Permission Guard: Either the original payer or an Admin can delete
      const targetExpense = expenses.find((exp) => exp.id === id);
      if (!targetExpense) return;

      const canDelete =
        targetExpense.paid_by === currentUser.id || currentUser.role === "admin";

      if (!canDelete) {
        console.warn(
          `[Permission Guard] Unauthorized delete attempt: User ${currentUser.id} is neither the payer (${targetExpense.paid_by}) nor an admin.`
        );
        return;
      }

      setExpenses((prev) => prev.filter((item) => item.id !== id));

      // Trigger notification for deletion
      addNotification({
        action_type: "expense_deleted",
        title: "Expense Deleted",
        description: `${currentUser.name} deleted '${targetExpense.title}'`,
        amount: targetExpense.amount,
        category: targetExpense.category,
        target_id: id,
        target_title: targetExpense.title,
      });

      // Cloud deletion in background
      if (isSupabaseConfigured()) {
        deleteExpenseInDb(id).catch((err) =>
          console.error("Supabase deleteExpense error:", err)
        );
      }
    },
    [expenses, currentUser.id, currentUser.role, currentUser.name, addNotification]
  );

  const addSettlement = React.useCallback(
    (newSet: Omit<Settlement, "id" | "created_at">) => {
      const settlement: Settlement = {
        ...newSet,
        id: `set-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        created_at: new Date().toISOString(),
      };
      setSettlements((prev) => [settlement, ...prev]);

      const payerName = users.find((u) => u.id === settlement.payer_id)?.name || "Roommate";
      const receiverName = users.find((u) => u.id === settlement.receiver_id)?.name || "Roommate";

      addNotification({
        action_type: "settlement_created",
        title: "Debt Settled",
        description: `${payerName} recorded settlement of ${formatBDT(settlement.amount)} to ${receiverName}`,
        amount: settlement.amount,
        target_id: settlement.id,
      });

      // Cloud mutation in background
      if (isSupabaseConfigured()) {
        createSettlementInDb(settlement).catch((err) =>
          console.error("Supabase createSettlement error:", err)
        );
      }
    },
    [users, addNotification]
  );

  const addRecurringBill = React.useCallback(
    (newBill: Omit<RecurringBill, "id" | "created_at">) => {
      const bill: RecurringBill = {
        ...newBill,
        id: `rec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        created_at: new Date().toISOString(),
      };
      setRecurringBills((prev) => [bill, ...prev]);

      addNotification({
        action_type: "recurring_bill_created",
        title: "New Recurring Bill",
        description: `${currentUser.name} added template '${bill.title}' (${formatBDT(bill.default_amount)}/mo)`,
        amount: bill.default_amount,
        category: bill.category,
        target_id: bill.id,
        target_title: bill.title,
      });

      // Cloud mutation in background
      if (isSupabaseConfigured()) {
        createRecurringBillInDb(bill).catch((err) =>
          console.error("Supabase createRecurringBill error:", err)
        );
      }
    },
    [currentUser.name, addNotification]
  );

  const editRecurringBill = React.useCallback(
    (id: string, updated: Partial<RecurringBill>) => {
      setRecurringBills((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, ...updated, updated_at: new Date().toISOString() }
            : item
        )
      );
    },
    []
  );

  const deleteRecurringBill = React.useCallback(
    (id: string) => {
      const target = recurringBills.find((b) => b.id === id);
      setRecurringBills((prev) => prev.filter((item) => item.id !== id));

      addNotification({
        action_type: "recurring_bill_deleted",
        title: "Recurring Bill Removed",
        description: `${currentUser.name} removed bill template '${target?.title || "Bill"}'`,
        target_id: id,
      });

      // Cloud deletion in background
      if (isSupabaseConfigured()) {
        deleteRecurringBillInDb(id).catch((err) =>
          console.error("Supabase deleteRecurringBill error:", err)
        );
      }
    },
    [recurringBills, currentUser.name, addNotification]
  );

  const logRecurringBillExpense = React.useCallback(
    (
      billId: string,
      customAmount?: number,
      customDate?: string,
      customPayerId?: string
    ) => {
      const bill = recurringBills.find((b) => b.id === billId);
      if (!bill) return;

      const finalAmount = customAmount ?? bill.default_amount;
      const finalDate = customDate ?? format(new Date(), "yyyy-MM-dd");
      const finalPayerId = customPayerId ?? bill.default_payer_id;

      const participatingUsers = users.filter((u) =>
        bill.participant_ids.includes(u.id)
      );

      const splits = computeEqualSplit(
        finalAmount,
        participatingUsers,
        finalPayerId
      );

      const monthName = format(new Date(finalDate), "MMMM");
      const title = `${bill.title} — ${monthName}`;

      addExpense({
        title,
        category: bill.category,
        amount: finalAmount,
        paid_by: finalPayerId,
        date: finalDate,
        split_type: bill.split_type,
        is_recurring: true,
        recurring_bill_id: bill.id,
        notes: bill.notes || `Recurring ${bill.category} monthly bill`,
        splits,
      });
    },
    [recurringBills, users, addExpense]
  );

  const updateHouseholdSettings = React.useCallback(
    (updated: Partial<HouseholdSettings>) => {
      setHouseholdSettings((prev) => {
        const next = { ...prev, ...updated };
        try {
          localStorage.setItem(
            STORAGE_KEYS.HOUSEHOLD_SETTINGS,
            JSON.stringify(next)
          );
        } catch {}
        updateHouseholdSettingsInDb(next);
        return next;
      });
    },
    []
  );

  const updateUserRole = React.useCallback(
    (userId: string, role: "admin" | "member") => {
      setUsers((prev) => {
        const next = prev.map((u) => (u.id === userId ? { ...u, role } : u));
        try {
          localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(next));
        } catch {}
        return next;
      });
      if (currentUser && currentUser.id === userId) {
        setCurrentUser({ ...currentUser, role });
      }
      updateUserRoleInDb(userId, role);
    },
    [currentUser, setCurrentUser]
  );

  const updateUserResidentStatus = React.useCallback(
    (userId: string, isRoommate: boolean) => {
      setUsers((prev) => {
        const next = prev.map((u) =>
          u.id === userId ? { ...u, is_roommate: isRoommate } : u
        );
        try {
          localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(next));
        } catch {}
        return next;
      });
      if (currentUser && currentUser.id === userId) {
        setCurrentUser({ ...currentUser, is_roommate: isRoommate });
      }
      updateUserResidentStatusInDb(userId, isRoommate);
    },
    [currentUser, setCurrentUser]
  );

  const addUser = React.useCallback((newUser: Omit<User, "id">) => {
    const createdUser: User = {
      ...newUser,
      id: `user-${Date.now()}`,
      role: newUser.role || "member",
      is_roommate: newUser.is_roommate !== false,
    };
    setUsers((prev) => {
      const next = [...prev, createdUser];
      try {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(next));
      } catch {}
      return next;
    });
    createProfileInDb(createdUser);
  }, []);

  const claimAdminAccess = React.useCallback(
    (adminKey: string): boolean => {
      const normalized = adminKey.trim().toUpperCase();
      const validKey = householdSettings.adminInviteCode || APARTMENT_ADMIN_KEY;
      if (normalized === validKey.toUpperCase()) {
        if (currentUser) {
          updateUserRole(currentUser.id, "admin");
          addNotification({
            action_type: "admin_claimed",
            title: "Admin Access Claimed",
            description: `${currentUser.name} claimed Household Admin rights`,
          });
        }
        return true;
      }
      return false;
    },
    [householdSettings.adminInviteCode, currentUser, updateUserRole, addNotification]
  );

  const resetToDefaults = React.useCallback(() => {
    if (isSupabaseConfigured()) {
      syncWithSupabase();
      return;
    }
    setExpenses(INITIAL_EXPENSES);
    setSettlements(INITIAL_SETTLEMENTS);
    setRecurringBills(INITIAL_RECURRING_BILLS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setUsers(INITIAL_USERS);
    setHouseholdSettings(INITIAL_HOUSEHOLD_SETTINGS);
    setCurrentUser(INITIAL_USERS[0]);
    localStorage.removeItem(STORAGE_KEYS.EXPENSES);
    localStorage.removeItem(STORAGE_KEYS.SETTLEMENTS);
    localStorage.removeItem(STORAGE_KEYS.RECURRING_BILLS);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.HOUSEHOLD_SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }, [setCurrentUser, syncWithSupabase]);

  const value = React.useMemo(
    () => ({
      users,
      currentUser,
      setCurrentUser,
      isAdmin,
      householdSettings,
      expenses: filteredExpenses,
      allExpenses: expenses,
      settlements,
      ledger,
      monthlySummaries,
      categoryBreakdown,
      recurringBills,
      recurringBillStatuses,
      recurringMetrics,
      selectedCategory,
      setSelectedCategory,
      selectedMonth,
      setSelectedMonth,
      isLoaded,
      isCloudConnected,
      isSyncing,
      notifications,
      unreadNotificationCount,
      latestLiveToast,
      dismissLiveToast,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      clearAllNotifications,
      addExpense,
      editExpense,
      deleteExpense,
      addSettlement,
      addRecurringBill,
      editRecurringBill,
      deleteRecurringBill,
      logRecurringBillExpense,
      updateHouseholdSettings,
      updateUserRole,
      updateUserResidentStatus,
      addUser,
      claimAdminAccess,
      resetToDefaults,
    }),
    [
      users,
      currentUser,
      setCurrentUser,
      isAdmin,
      householdSettings,
      filteredExpenses,
      expenses,
      settlements,
      ledger,
      monthlySummaries,
      categoryBreakdown,
      recurringBills,
      recurringBillStatuses,
      recurringMetrics,
      selectedCategory,
      selectedMonth,
      isLoaded,
      isCloudConnected,
      isSyncing,
      notifications,
      unreadNotificationCount,
      latestLiveToast,
      dismissLiveToast,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      clearAllNotifications,
      addExpense,
      editExpense,
      deleteExpense,
      addSettlement,
      addRecurringBill,
      editRecurringBill,
      deleteRecurringBill,
      logRecurringBillExpense,
      updateHouseholdSettings,
      updateUserRole,
      updateUserResidentStatus,
      addUser,
      claimAdminAccess,
      resetToDefaults,
    ]
  );

  return (
    <ExpenseContext.Provider value={value}>{children}</ExpenseContext.Provider>
  );
}

export function useExpenses() {
  const context = React.useContext(ExpenseContext);
  if (!context) {
    throw new Error("useExpenses must be used within an ExpenseProvider");
  }
  return context;
}
