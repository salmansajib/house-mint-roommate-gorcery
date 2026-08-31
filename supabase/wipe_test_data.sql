-- ==============================================================================
-- HouseMint — Wipe ALL Test Data (Expenses, Bills & Sample Roommates)
-- Run this in your Supabase SQL Editor to start with a 100% clean, empty apartment!
-- ==============================================================================

-- 1. Wipe all test expenses, items, and debt splits
TRUNCATE TABLE expense_items, expense_splits, expenses CASCADE;

-- 2. Wipe all test settlements
TRUNCATE TABLE settlements CASCADE;

-- 3. Wipe all recurring bill templates
TRUNCATE TABLE recurring_bills CASCADE;

-- 4. Wipe sample roommates (Salman, Alex, Tanvir, Rahim)
TRUNCATE TABLE profiles CASCADE;
