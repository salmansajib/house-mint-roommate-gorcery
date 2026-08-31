"use client";

import * as React from "react";
import { GroceryCatalogItem } from "@/types";
import { DEFAULT_GROCERY_CATALOG, searchGrocerySuggestions } from "@/lib/grocery-catalog";
import {
  DEFAULT_HOUSEHOLD_ID,
  fetchGroceryCatalogFromDb,
  recordGroceryItemUsageInDb,
  addGroceryCatalogItemInDb,
  deleteGroceryCatalogItemInDb,
} from "@/lib/supabase/db";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

// Global in-memory singleton cache to prevent duplicate fetches & channel collisions across multiple inputs
let globalCatalog: GroceryCatalogItem[] = [...DEFAULT_GROCERY_CATALOG];
let isInitialized = false;
let activeChannel: ReturnType<NonNullable<ReturnType<typeof createClient>>["channel"]> | null = null;
const listeners = new Set<(catalog: GroceryCatalogItem[]) => void>();

function notifyListeners() {
  listeners.forEach((listener) => listener([...globalCatalog]));
}

function updateGlobalCatalog(dbItems: GroceryCatalogItem[]) {
  if (!dbItems || dbItems.length === 0) return;

  const itemMap = new Map<string, GroceryCatalogItem>();

  // 1. Existing items
  for (const item of globalCatalog) {
    itemMap.set(item.name_bn, { ...item });
  }

  // 2. Overlay items
  for (const item of dbItems) {
    const existing = itemMap.get(item.name_bn);
    if (existing) {
      itemMap.set(item.name_bn, {
        ...existing,
        ...item,
        usage_count: Math.max(existing.usage_count || 0, item.usage_count || 0),
        banglish_aliases: Array.from(
          new Set([...(existing.banglish_aliases || []), ...(item.banglish_aliases || [])])
        ),
      });
    } else {
      itemMap.set(item.name_bn, item);
    }
  }

  globalCatalog = Array.from(itemMap.values()).sort(
    (a, b) => (b.usage_count || 0) - (a.usage_count || 0)
  );

  notifyListeners();
}

export function useGroceryCatalog(householdId: string = DEFAULT_HOUSEHOLD_ID) {
  const [catalog, setCatalog] = React.useState<GroceryCatalogItem[]>(globalCatalog);
  const [isLoading, setIsLoading] = React.useState(!isInitialized);

  React.useEffect(() => {
    // Register listener for this hook instance
    const handleUpdate = (updated: GroceryCatalogItem[]) => {
      setCatalog(updated);
    };
    listeners.add(handleUpdate);

    // If already initialized, use current global catalog
    if (isInitialized) {
      setCatalog([...globalCatalog]);
      setIsLoading(false);
    } else {
      isInitialized = true;
      setIsLoading(true);

      async function init() {
        if (isSupabaseConfigured()) {
          try {
            const dbItems = await fetchGroceryCatalogFromDb(householdId);
            if (dbItems && dbItems.length > 0) {
              updateGlobalCatalog(dbItems);
            }
          } catch (err) {
            console.warn("Failed to load catalog from Supabase:", err);
          }
        }
        setIsLoading(false);
      }

      init();

      // Start singleton Supabase Realtime channel
      const supabase = createClient();
      if (supabase && isSupabaseConfigured() && !activeChannel) {
        // Clean up any stale channel before subscribing
        const channelName = `realtime_grocery_${householdId}_${Date.now()}`;
        activeChannel = supabase
          .channel(channelName)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "grocery_catalog",
            },
            (payload: { new?: unknown }) => {
              if (payload && payload.new) {
                const newItem = payload.new as GroceryCatalogItem;
                if (!newItem.household_id || newItem.household_id === householdId) {
                  updateGlobalCatalog([newItem]);
                }
              }
            }
          )
          .subscribe();
      }
    }

    return () => {
      listeners.delete(handleUpdate);
    };
  }, [householdId]);

  // Fast in-memory search
  const search = React.useCallback(
    (query: string, limit = 8) => {
      return searchGrocerySuggestions(catalog, query, limit);
    },
    [catalog]
  );

  // Record usage when a grocery item is logged
  const recordUsage = React.useCallback(
    async (name: string, unit?: string) => {
      if (!name.trim()) return;
      const clean = name.trim();

      // Optimistically update global catalog
      globalCatalog = globalCatalog.map((item) => {
        if (
          item.name_bn === clean ||
          item.name_en.toLowerCase() === clean.toLowerCase()
        ) {
          return { ...item, usage_count: (item.usage_count || 0) + 1 };
        }
        return item;
      });
      notifyListeners();

      // Persist to Supabase
      if (isSupabaseConfigured()) {
        try {
          await recordGroceryItemUsageInDb(clean, unit, householdId);
        } catch (err) {
          console.warn("recordGroceryItemUsage error:", err);
        }
      }
    },
    [householdId]
  );

  // Add a new grocery item to catalog
  const addItem = React.useCallback(
    async (item: Omit<GroceryCatalogItem, "id" | "created_at">) => {
      const newItem: GroceryCatalogItem = {
        id: `custom-${Date.now()}`,
        household_id: householdId,
        ...item,
        created_at: new Date().toISOString(),
      };

      // Optimistically add to top of global catalog
      globalCatalog = [newItem, ...globalCatalog];
      notifyListeners();

      if (isSupabaseConfigured()) {
        try {
          const res = await addGroceryCatalogItemInDb(item, householdId);
          if (res) {
            globalCatalog = globalCatalog.map((it) => (it.id === newItem.id ? res : it));
            notifyListeners();
            return res;
          }
        } catch (err) {
          console.warn("addItem error:", err);
        }
      }
      return newItem;
    },
    [householdId]
  );

  // Delete an item from catalog
  const deleteItem = React.useCallback(
    async (id: string) => {
      // Optimistically remove
      globalCatalog = globalCatalog.filter((it) => it.id !== id);
      notifyListeners();

      if (isSupabaseConfigured()) {
        try {
          await deleteGroceryCatalogItemInDb(id);
        } catch (err) {
          console.warn("deleteItem error:", err);
        }
      }
    },
    []
  );

  return {
    catalog,
    isLoading,
    search,
    recordUsage,
    addItem,
    deleteItem,
  };
}

