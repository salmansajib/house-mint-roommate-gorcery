import { createClient } from "./client";
import { Expense, ExpenseItem, Settlement, User, RecurringBill, HouseholdSettings, AppNotification, GroceryCatalogItem } from "@/types";

export const DEFAULT_HOUSEHOLD_ID =
  process.env.NEXT_PUBLIC_DEFAULT_HOUSEHOLD_ID || "housemint-flat-4b";

export const APARTMENT_INVITE_CODE = "MINT-4B";
export const APARTMENT_ADMIN_KEY =
  process.env.NEXT_PUBLIC_APARTMENT_ADMIN_KEY || "MINT-ADMIN-4B";

export interface InviteValidationResult {
  householdId: string;
  isAdminKey: boolean;
}

/**
 * Validate that an invite code belongs to an existing apartment
 * Checks both regular roommate invite code and admin master key
 */
export async function validateHouseholdInviteCode(
  code: string
): Promise<InviteValidationResult | null> {
  const normalized = code.trim().toUpperCase();
  const supabase = createClient();

  const isConfiguredAdmin = normalized === APARTMENT_ADMIN_KEY;
  const isConfiguredRoommate = normalized === APARTMENT_INVITE_CODE;

  if (!supabase) {
    if (isConfiguredAdmin) {
      return { householdId: DEFAULT_HOUSEHOLD_ID, isAdminKey: true };
    }
    if (isConfiguredRoommate) {
      return { householdId: DEFAULT_HOUSEHOLD_ID, isAdminKey: false };
    }
    return null;
  }

  try {
    // Check admin invite code first
    const { data: adminHouse, error: adminErr } = await supabase
      .from("households")
      .select("id")
      .eq("admin_invite_code", normalized)
      .maybeSingle();

    if (!adminErr && adminHouse) {
      return { householdId: adminHouse.id, isAdminKey: true };
    }

    if (isConfiguredAdmin) {
      return { householdId: DEFAULT_HOUSEHOLD_ID, isAdminKey: true };
    }

    // Check standard roommate invite code
    const { data: memberHouse, error: memberErr } = await supabase
      .from("households")
      .select("id")
      .eq("invite_code", normalized)
      .maybeSingle();

    if (!memberErr && memberHouse) {
      return { householdId: memberHouse.id, isAdminKey: false };
    }

    if (isConfiguredRoommate) {
      return { householdId: DEFAULT_HOUSEHOLD_ID, isAdminKey: false };
    }

    return null;
  } catch {
    if (isConfiguredAdmin) {
      return { householdId: DEFAULT_HOUSEHOLD_ID, isAdminKey: true };
    }
    if (isConfiguredRoommate) {
      return { householdId: DEFAULT_HOUSEHOLD_ID, isAdminKey: false };
    }
    return null;
  }
}

export interface HouseholdData {
  users: User[];
  expenses: Expense[];
  settlements: Settlement[];
  recurringBills: RecurringBill[];
  notifications?: AppNotification[];
  settings?: HouseholdSettings;
}

/**
 * Fetch full household dataset from Supabase
 */
export async function fetchHouseholdData(
  householdId = DEFAULT_HOUSEHOLD_ID
): Promise<HouseholdData | null> {
  const supabase = createClient();
  if (!supabase) return null;

  try {
    // 1. Fetch profiles (roommates & managers)
    const { data: profiles, error: profileErr } = await supabase
      .from("profiles")
      .select("*")
      .eq("household_id", householdId);

    if (profileErr) {
      console.warn("Supabase profiles query returned error:", profileErr?.message);
      return null;
    }

    const users: User[] = ((profiles as any[]) || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      email: p.email,
      avatar_url: p.avatar_url,
      accent_color: p.accent_color,
      role: (p.role as "admin" | "member") || "member",
      is_roommate: p.is_roommate !== false,
    }));

    // 2. Fetch expenses with splits & items
    const { data: expensesData, error: expErr } = await supabase
      .from("expenses")
      .select(`
        *,
        items:expense_items(*),
        splits:expense_splits(*)
      `)
      .eq("household_id", householdId)
      .order("created_at", { ascending: false });

    if (expErr) {
      console.warn("Supabase expenses query error:", expErr.message);
      return null;
    }

    const expenses: Expense[] = ((expensesData as any[]) || []).map((e: any) => ({
      id: e.id,
      title: e.title,
      category: e.category,
      amount: Number(e.amount),
      quantity: e.quantity ? Number(e.quantity) : undefined,
      unit: e.unit || undefined,
      paid_by: e.paid_by,
      date: e.date,
      split_type: e.split_type,
      is_recurring: e.is_recurring,
      recurring_bill_id: e.recurring_bill_id,
      notes: e.notes || undefined,
      created_at: e.created_at,
      updated_at: e.updated_at,
      items: (e.items || []).map((item: any) => ({
        id: item.id,
        expense_id: item.expense_id,
        name: item.name,
        quantity: item.quantity ? Number(item.quantity) : undefined,
        unit: item.unit || undefined,
        unit_price: Number(item.unit_price),
        total_price: Number(item.total_price),
        assigned_to: item.assigned_to,
      })),
      splits: (e.splits || []).map((s: any) => ({
        user_id: s.user_id,
        amount: Number(s.amount),
        percentage: s.percentage ? Number(s.percentage) : undefined,
      })),
    }));

    // 3. Fetch settlements
    const { data: settsData, error: settErr } = await supabase
      .from("settlements")
      .select("*")
      .eq("household_id", householdId)
      .order("date", { ascending: false });

    if (settErr) {
      console.warn("Supabase settlements query error:", settErr.message);
      return null;
    }

    const settlements: Settlement[] = ((settsData as any[]) || []).map((s: any) => ({
      id: s.id,
      payer_id: s.payer_id,
      receiver_id: s.receiver_id,
      amount: Number(s.amount),
      date: s.date,
      notes: s.notes || undefined,
      created_at: s.created_at,
    }));

    // 4. Fetch recurring bills
    const { data: recData, error: recErr } = await supabase
      .from("recurring_bills")
      .select("*")
      .eq("household_id", householdId);

    if (recErr) {
      console.warn("Supabase recurring bills query error:", recErr.message);
      return null;
    }

    const recurringBills: RecurringBill[] = ((recData as any[]) || []).map((r: any) => ({
      id: r.id,
      title: r.title,
      category: r.category,
      default_amount: Number(r.default_amount),
      billing_cycle: r.billing_cycle,
      due_day_of_month: Number(r.due_day_of_month),
      default_payer_id: r.default_payer_id,
      split_type: r.split_type,
      participant_ids: r.participant_ids || [],
      is_active: r.is_active,
      notes: r.notes || undefined,
      created_at: r.created_at,
      updated_at: r.updated_at,
    }));

    // 5. Fetch household settings
    let settings: HouseholdSettings | undefined = undefined;
    const { data: houseData } = await supabase
      .from("households")
      .select("name, invite_code, admin_invite_code, settings")
      .eq("id", householdId)
      .maybeSingle();

    if (houseData) {
      const dbSettings = (houseData.settings as any) || {};
      settings = {
        householdName: houseData.name || "HouseMint Flat 4B",
        inviteCode: houseData.invite_code || APARTMENT_INVITE_CODE,
        adminInviteCode: houseData.admin_invite_code || APARTMENT_ADMIN_KEY,
        defaultSplitMode: dbSettings.defaultSplitMode || "equal",
        defaultSplitRatios: dbSettings.defaultSplitRatios,
        lockedMonths: dbSettings.lockedMonths || [],
        landlordName: dbSettings.landlordName,
        landlordPhone: dbSettings.landlordPhone,
        landlordPaymentMethod: dbSettings.landlordPaymentMethod,
        electricityMeterNo: dbSettings.electricityMeterNo,
        internetClientId: dbSettings.internetClientId,
        emergencyFundEnabled: dbSettings.emergencyFundEnabled ?? false,
        emergencyFundBalance: dbSettings.emergencyFundBalance ?? 0,
      };
    }

    // 6. Fetch recent in-app notifications (safely graceful if table is missing)
    let notifications: AppNotification[] | undefined = undefined;
    try {
      const { data: notifData, error: notifErr } = await supabase
        .from("notifications")
        .select("*")
        .eq("household_id", householdId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (!notifErr && notifData) {
        notifications = notifData.map((n: any) => ({
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
        }));
      }
    } catch {
      // Notifications table may not be initialized yet
    }

    return {
      users,
      expenses,
      settlements,
      recurringBills,
      notifications,
      settings,
    };
  } catch (error) {
    console.error("fetchHouseholdData exception:", error);
    return null;
  }
}

/**
 * Insert new expense into Supabase
 */
export async function createExpenseInDb(
  expense: Expense,
  householdId = DEFAULT_HOUSEHOLD_ID
): Promise<boolean> {
  const supabase = createClient();
  if (!supabase) return false;

  try {
    const { error: expErr } = await supabase.from("expenses").insert({
      id: expense.id,
      household_id: householdId,
      title: expense.title,
      category: expense.category,
      amount: expense.amount,
      quantity: expense.quantity ?? null,
      unit: expense.unit ?? null,
      paid_by: expense.paid_by,
      date: expense.date.includes("T") ? expense.date.split("T")[0] : expense.date,
      split_type: expense.split_type,
      is_recurring: expense.is_recurring ?? false,
      recurring_bill_id: expense.recurring_bill_id ?? null,
      notes: expense.notes ?? null,
      created_at: expense.created_at,
    });

    if (expErr) throw expErr;

    // Insert line items if any
    if (expense.items && expense.items.length > 0) {
      const itemsToInsert = expense.items.map((item) => ({
        id: item.id,
        expense_id: expense.id,
        name: item.name,
        quantity: item.quantity ?? null,
        unit: item.unit ?? null,
        unit_price: item.unit_price,
        total_price: item.total_price,
        assigned_to: item.assigned_to ?? null,
      }));

      const { error: itemErr } = await supabase
        .from("expense_items")
        .insert(itemsToInsert);
      if (itemErr) throw itemErr;
    }

    // Insert split shares
    if (expense.splits && expense.splits.length > 0) {
      const splitsToInsert = expense.splits.map((s, idx) => ({
        id: `spl-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 5)}`,
        expense_id: expense.id,
        user_id: s.user_id,
        amount: s.amount,
        percentage: s.percentage ?? null,
      }));

      const { error: splitErr } = await supabase
        .from("expense_splits")
        .insert(splitsToInsert);
      if (splitErr) throw splitErr;
    }

    return true;
  } catch (error) {
    console.error("createExpenseInDb error:", error);
    return false;
  }
}

/**
 * Update an existing expense in Supabase
 */
export async function updateExpenseInDb(
  expense: Expense,
  householdId = DEFAULT_HOUSEHOLD_ID
): Promise<boolean> {
  const supabase = createClient();
  if (!supabase) return false;

  try {
    const rawDate = expense.date.includes("T")
      ? expense.date.split("T")[0]
      : expense.date;
    const updatedAt = new Date().toISOString();

    const { error: expErr } = await supabase
      .from("expenses")
      .update({
        title: expense.title,
        category: expense.category,
        amount: expense.amount,
        quantity: expense.quantity ?? null,
        unit: expense.unit ?? null,
        paid_by: expense.paid_by,
        date: rawDate,
        split_type: expense.split_type,
        is_recurring: expense.is_recurring ?? false,
        recurring_bill_id: expense.recurring_bill_id ?? null,
        notes: expense.notes ?? null,
        created_at: expense.created_at,
        updated_at: updatedAt,
      })
      .eq("id", expense.id);

    if (expErr) throw expErr;

    // Update splits: delete existing splits and reinsert
    await supabase.from("expense_splits").delete().eq("expense_id", expense.id);
    if (expense.splits && expense.splits.length > 0) {
      const splitsToInsert = expense.splits.map((s, idx) => ({
        id: `spl-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 5)}`,
        expense_id: expense.id,
        user_id: s.user_id,
        amount: s.amount,
        percentage: s.percentage ?? null,
      }));
      const { error: splitErr } = await supabase
        .from("expense_splits")
        .insert(splitsToInsert);
      if (splitErr) throw splitErr;
    }

    // Update line items: if items provided, delete existing and reinsert
    if (expense.items && expense.items.length > 0) {
      await supabase.from("expense_items").delete().eq("expense_id", expense.id);
      const itemsToInsert = expense.items.map((item, idx) => ({
        id: item.id || `item-${Date.now()}-${idx}`,
        expense_id: expense.id,
        name: item.name,
        quantity: item.quantity ?? null,
        unit: item.unit ?? null,
        unit_price: item.unit_price,
        total_price: item.total_price,
        assigned_to: item.assigned_to ?? null,
      }));
      const { error: itemErr } = await supabase
        .from("expense_items")
        .insert(itemsToInsert);
      if (itemErr) throw itemErr;
    }

    return true;
  } catch (error) {
    console.error("updateExpenseInDb error:", error);
    return false;
  }
}

/**
 * Delete expense from Supabase
 */
export async function deleteExpenseInDb(id: string): Promise<boolean> {
  const supabase = createClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from("expenses").delete().eq("id", id);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("deleteExpenseInDb error:", error);
    return false;
  }
}

/**
 * Insert settlement into Supabase
 */
export async function createSettlementInDb(
  settlement: Settlement,
  householdId = DEFAULT_HOUSEHOLD_ID
): Promise<boolean> {
  const supabase = createClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from("settlements").insert({
      id: settlement.id,
      household_id: householdId,
      payer_id: settlement.payer_id,
      receiver_id: settlement.receiver_id,
      amount: settlement.amount,
      date: settlement.date,
      notes: settlement.notes ?? null,
      created_at: settlement.created_at,
    });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("createSettlementInDb error:", error);
    return false;
  }
}

/**
 * Insert recurring bill into Supabase
 */
export async function createRecurringBillInDb(
  bill: RecurringBill,
  householdId = DEFAULT_HOUSEHOLD_ID
): Promise<boolean> {
  const supabase = createClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from("recurring_bills").insert({
      id: bill.id,
      household_id: householdId,
      title: bill.title,
      category: bill.category,
      default_amount: bill.default_amount,
      billing_cycle: bill.billing_cycle,
      due_day_of_month: bill.due_day_of_month,
      default_payer_id: bill.default_payer_id,
      split_type: bill.split_type,
      participant_ids: bill.participant_ids,
      is_active: bill.is_active,
      notes: bill.notes ?? null,
      created_at: bill.created_at,
    });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("createRecurringBillInDb error:", error);
    return false;
  }
}

/**
 * Delete recurring bill from Supabase
 */
export async function deleteRecurringBillInDb(id: string): Promise<boolean> {
  const supabase = createClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from("recurring_bills")
      .delete()
      .eq("id", id);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("deleteRecurringBillInDb error:", error);
    return false;
  }
}

/**
 * Upsert roommate profile into Supabase
 */
export async function createProfileInDb(
  user: User,
  householdId = DEFAULT_HOUSEHOLD_ID
): Promise<boolean> {
  const supabase = createClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      household_id: householdId,
      name: user.name,
      email: user.email ?? null,
      accent_color: user.accent_color || "user-1",
      avatar_url: user.avatar_url ?? null,
      role: user.role || "member",
      is_roommate: user.is_roommate !== false,
    });
    if (error) throw error;
    return true;
  } catch (err) {
    console.error("createProfileInDb error:", err);
    return false;
  }
}

/**
 * Update household settings in Supabase
 */
export async function updateHouseholdSettingsInDb(
  settings: Partial<HouseholdSettings>,
  householdId = DEFAULT_HOUSEHOLD_ID
): Promise<boolean> {
  const supabase = createClient();
  if (!supabase) return false;

  try {
    const payload: Record<string, any> = {};
    if (settings.householdName) payload.name = settings.householdName;
    if (settings.inviteCode) payload.invite_code = settings.inviteCode;
    if (settings.adminInviteCode) payload.admin_invite_code = settings.adminInviteCode;

    // Save remainder into settings JSONB
    payload.settings = settings;

    const { error } = await supabase
      .from("households")
      .update(payload)
      .eq("id", householdId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error("updateHouseholdSettingsInDb error:", err);
    return false;
  }
}

/**
 * Update user role (admin/member) in Supabase
 */
export async function updateUserRoleInDb(
  userId: string,
  role: "admin" | "member"
): Promise<boolean> {
  const supabase = createClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from("profiles")
      .update({ role })
      .eq("id", userId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error("updateUserRoleInDb error:", err);
    return false;
  }
}

/**
 * Update user resident status (splits vs manager) in Supabase
 */
export async function updateUserResidentStatusInDb(
  userId: string,
  isRoommate: boolean
): Promise<boolean> {
  const supabase = createClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from("profiles")
      .update({ is_roommate: isRoommate })
      .eq("id", userId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error("updateUserResidentStatusInDb error:", err);
    return false;
  }
}

/**
 * Fetch notifications from Supabase
 */
export async function fetchNotificationsFromDb(
  householdId = DEFAULT_HOUSEHOLD_ID
): Promise<AppNotification[]> {
  const supabase = createClient();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("household_id", householdId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error || !data) return [];

    return data.map((n: any) => ({
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
    }));
  } catch {
    return [];
  }
}

/**
 * Broadcast/Insert a new notification in Supabase
 */
export async function createNotificationInDb(
  notification: AppNotification,
  householdId = DEFAULT_HOUSEHOLD_ID
): Promise<boolean> {
  const supabase = createClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from("notifications").insert({
      id: notification.id,
      household_id: householdId,
      actor_id: notification.actor_id,
      actor_name: notification.actor_name,
      action_type: notification.action_type,
      title: notification.title,
      description: notification.description,
      amount: notification.amount ?? null,
      category: notification.category ?? null,
      target_id: notification.target_id ?? null,
      target_title: notification.target_title ?? null,
      created_at: notification.created_at,
      read_by: notification.read_by || [],
    });

    if (error) {
      if (
        error.code === "PGRST205" ||
        error.message?.includes("notifications") ||
        error.message?.includes("schema cache")
      ) {
        console.info(
          "[HouseMint Info] Cloud notification sync requires the notifications table. Run supabase/notifications_migration.sql in Supabase SQL editor."
        );
      } else {
        console.warn("createNotificationInDb warning:", error.message);
      }
      return false;
    }
    return true;
  } catch (err) {
    console.warn("createNotificationInDb exception:", err);
    return false;
  }
}

/**
 * Mark a single notification as read by a user
 */
export async function markNotificationReadInDb(
  notificationId: string,
  userId: string
): Promise<boolean> {
  const supabase = createClient();
  if (!supabase) return false;

  try {
    const { data: existing } = await supabase
      .from("notifications")
      .select("read_by")
      .eq("id", notificationId)
      .maybeSingle();

    if (!existing) return false;
    const currentReadBy: string[] = Array.isArray(existing.read_by)
      ? existing.read_by
      : [];

    if (!currentReadBy.includes(userId)) {
      const updatedReadBy = [...currentReadBy, userId];
      await supabase
        .from("notifications")
        .update({ read_by: updatedReadBy })
        .eq("id", notificationId);
    }
    return true;
  } catch (err) {
    console.warn("markNotificationReadInDb error:", err);
    return false;
  }
}

/**
 * Mark all notifications in the household as read by a user
 */
export async function markAllNotificationsReadInDb(
  householdId = DEFAULT_HOUSEHOLD_ID,
  userId: string
): Promise<boolean> {
  const supabase = createClient();
  if (!supabase) return false;

  try {
    const { data: notifs } = await supabase
      .from("notifications")
      .select("id, read_by")
      .eq("household_id", householdId);

    if (!notifs) return false;

    for (const notif of notifs) {
      const current = Array.isArray(notif.read_by) ? notif.read_by : [];
      if (!current.includes(userId)) {
        await supabase
          .from("notifications")
          .update({ read_by: [...current, userId] })
          .eq("id", notif.id);
      }
    }
    return true;
  } catch (err) {
    console.warn("markAllNotificationsReadInDb error:", err);
    return false;
  }
}

/**
 * Clear all notifications for the household
 */
export async function clearNotificationsInDb(
  householdId = DEFAULT_HOUSEHOLD_ID
): Promise<boolean> {
  const supabase = createClient();
  if (!supabase) return false;

  try {
    await supabase.from("notifications").delete().eq("household_id", householdId);
    return true;
  } catch (err) {
    console.warn("clearNotificationsInDb error:", err);
    return false;
  }
}

/**
 * Fetch all grocery catalog items (both system-wide and household-specific)
 */
export async function fetchGroceryCatalogFromDb(
  householdId = DEFAULT_HOUSEHOLD_ID
): Promise<GroceryCatalogItem[]> {
  const supabase = createClient();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from("grocery_catalog")
      .select("*")
      .or(`household_id.is.null,household_id.eq.${householdId}`)
      .order("usage_count", { ascending: false });

    if (error) {
      console.warn("fetchGroceryCatalogFromDb error:", error);
      return [];
    }
    return (data as GroceryCatalogItem[]) || [];
  } catch (err) {
    console.warn("fetchGroceryCatalogFromDb exception:", err);
    return [];
  }
}

/**
 * Record usage of a grocery item in the catalog.
 * If the item exists, increments usage_count.
 * If it's a new custom item, creates a new entry for the household.
 */
export async function recordGroceryItemUsageInDb(
  name: string,
  defaultUnit?: string,
  householdId = DEFAULT_HOUSEHOLD_ID
): Promise<void> {
  const supabase = createClient();
  if (!supabase || !name.trim()) return;

  const cleanName = name.trim();

  try {
    // Check if an item with this Bangla or English name already exists in catalog
    const { data: existing } = await supabase
      .from("grocery_catalog")
      .select("id, usage_count")
      .or(`name_bn.eq.${cleanName},name_en.ilike.${cleanName}`)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("grocery_catalog")
        .update({ usage_count: (existing.usage_count || 0) + 1 })
        .eq("id", existing.id);
    } else {
      // Create new custom entry for this apartment
      await supabase.from("grocery_catalog").insert({
        household_id: householdId,
        name_bn: cleanName,
        name_en: cleanName,
        banglish_aliases: [cleanName.toLowerCase()],
        default_unit: defaultUnit || "কেজি",
        category: "other",
        usage_count: 1,
      });
    }
  } catch (err) {
    console.warn("recordGroceryItemUsageInDb exception:", err);
  }
}

/**
 * Admin: Add a new grocery item to the apartment catalog
 */
export async function addGroceryCatalogItemInDb(
  item: Omit<GroceryCatalogItem, "id" | "created_at">,
  householdId = DEFAULT_HOUSEHOLD_ID
): Promise<GroceryCatalogItem | null> {
  const supabase = createClient();
  if (!supabase) return null;

  try {
    const payload = {
      household_id: householdId,
      name_bn: item.name_bn.trim(),
      name_en: item.name_en.trim(),
      banglish_aliases: item.banglish_aliases || [],
      category: item.category || "staples",
      default_unit: item.default_unit || "কেজি",
      usage_count: item.usage_count || 10,
    };

    const { data, error } = await supabase
      .from("grocery_catalog")
      .insert(payload)
      .select("*")
      .single();

    if (error) {
      console.warn("addGroceryCatalogItemInDb error:", error);
      return null;
    }
    return data as GroceryCatalogItem;
  } catch (err) {
    console.warn("addGroceryCatalogItemInDb exception:", err);
    return null;
  }
}

/**
 * Admin: Delete a grocery item from the catalog
 */
export async function deleteGroceryCatalogItemInDb(id: string): Promise<boolean> {
  const supabase = createClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from("grocery_catalog").delete().eq("id", id);
    if (error) {
      console.warn("deleteGroceryCatalogItemInDb error:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("deleteGroceryCatalogItemInDb exception:", err);
    return false;
  }
}



