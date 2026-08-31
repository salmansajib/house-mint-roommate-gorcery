-- ==============================================================================
-- HouseMint — Complete Supabase PostgreSQL Schema & Realtime Setup
-- ==============================================================================

-- 1. Households (Shared Apartment Unit)
CREATE TABLE IF NOT EXISTS households (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  invite_code TEXT UNIQUE,
  admin_invite_code TEXT UNIQUE DEFAULT 'MINT-ADMIN-4B',
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Profiles (Roommates & Managers in the household)
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  household_id TEXT NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  accent_color TEXT DEFAULT 'user-1',
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'member', -- 'admin' or 'member'
  is_roommate BOOLEAN NOT NULL DEFAULT TRUE, -- true = splits costs; false = external manager only
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Expenses (Itemized groceries, bills, shared costs)
CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  household_id TEXT NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL, -- 'groceries', 'rent', 'internet', 'gas', 'electricity', 'other'
  amount NUMERIC(12, 2) NOT NULL,
  quantity NUMERIC(10, 2),
  unit TEXT,
  paid_by TEXT REFERENCES profiles(id) ON DELETE SET NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  split_type TEXT NOT NULL DEFAULT 'equal', -- 'equal', 'full', 'ratio', 'custom'
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_bill_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- 4. Expense Items (Itemized grocery line items)
CREATE TABLE IF NOT EXISTS expense_items (
  id TEXT PRIMARY KEY,
  expense_id TEXT NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity NUMERIC(10, 2),
  unit TEXT,
  unit_price NUMERIC(12, 2) NOT NULL,
  total_price NUMERIC(12, 2) NOT NULL,
  assigned_to TEXT REFERENCES profiles(id) ON DELETE SET NULL
);

-- 5. Expense Splits (Exact debt shares per user)
CREATE TABLE IF NOT EXISTS expense_splits (
  id TEXT PRIMARY KEY,
  expense_id TEXT NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL,
  percentage NUMERIC(5, 2)
);

-- 6. Settlements (Debt repayment records between roommates)
CREATE TABLE IF NOT EXISTS settlements (
  id TEXT PRIMARY KEY,
  household_id TEXT NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  payer_id TEXT REFERENCES profiles(id) ON DELETE SET NULL,
  receiver_id TEXT REFERENCES profiles(id) ON DELETE SET NULL,
  amount NUMERIC(12, 2) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Recurring Bills (Monthly utilities & fixed templates)
CREATE TABLE IF NOT EXISTS recurring_bills (
  id TEXT PRIMARY KEY,
  household_id TEXT NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  default_amount NUMERIC(12, 2) NOT NULL,
  billing_cycle TEXT NOT NULL DEFAULT 'monthly',
  due_day_of_month INT NOT NULL DEFAULT 1,
  default_payer_id TEXT REFERENCES profiles(id) ON DELETE SET NULL,
  split_type TEXT NOT NULL DEFAULT 'equal',
  participant_ids TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- 8. Notifications (In-app real-time activity notifications for all roommates)
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  household_id TEXT NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  actor_id TEXT REFERENCES profiles(id) ON DELETE SET NULL,
  actor_name TEXT NOT NULL,
  action_type TEXT NOT NULL, -- 'expense_created', 'expense_updated', 'expense_deleted', 'settlement_created', etc.
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC(12, 2),
  category TEXT,
  target_id TEXT,
  target_title TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_by TEXT[] NOT NULL DEFAULT '{}'
);

-- ==============================================================================
-- 9. Row Level Security (RLS) Configuration
-- ==============================================================================

ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Allow public access for anon client key (permits shared apartment access)
CREATE POLICY "Allow anon all on households" ON households FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all on profiles" ON profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all on expenses" ON expenses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all on expense_items" ON expense_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all on expense_splits" ON expense_splits FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all on settlements" ON settlements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all on recurring_bills" ON recurring_bills FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all on notifications" ON notifications FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- 10. Realtime Publication Setup
-- ==============================================================================

-- Enable Realtime events for tables that change dynamically
ALTER PUBLICATION supabase_realtime ADD TABLE expenses;
ALTER PUBLICATION supabase_realtime ADD TABLE expense_items;
ALTER PUBLICATION supabase_realtime ADD TABLE expense_splits;
ALTER PUBLICATION supabase_realtime ADD TABLE settlements;
ALTER PUBLICATION supabase_realtime ADD TABLE recurring_bills;
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- ==============================================================================
-- 10. Seed Initial Household & Roommates Data
-- ==============================================================================

-- Insert Default Household
INSERT INTO households (id, name, invite_code)
VALUES ('housemint-flat-4b', 'HouseMint Flat 4B', 'MINT-4B')
ON CONFLICT (id) DO NOTHING;

-- Insert 4 Roommate Profiles
INSERT INTO profiles (id, household_id, name, email, accent_color)
VALUES
  ('user-salman', 'housemint-flat-4b', 'Salman', 'salman@housemint.local', 'user-1'),
  ('user-alex', 'housemint-flat-4b', 'Alex', 'alex@housemint.local', 'user-2'),
  ('user-tanvir', 'housemint-flat-4b', 'Tanvir', 'tanvir@housemint.local', 'user-1'),
  ('user-rahim', 'housemint-flat-4b', 'Rahim', 'rahim@housemint.local', 'user-2')
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name, email = EXCLUDED.email;

-- Insert Default Recurring Bills
INSERT INTO recurring_bills (id, household_id, title, category, default_amount, billing_cycle, due_day_of_month, default_payer_id, split_type, participant_ids, is_active, notes)
VALUES
  ('rec-rent', 'housemint-flat-4b', 'Apartment Rent', 'rent', 24000, 'monthly', 1, 'user-salman', 'equal', ARRAY['user-salman', 'user-alex', 'user-tanvir', 'user-rahim'], true, 'Monthly 3-bedroom apartment rent paid to landlord'),
  ('rec-internet', 'housemint-flat-4b', 'Fiber Internet Bill', 'internet', 2000, 'monthly', 8, 'user-tanvir', 'equal', ARRAY['user-salman', 'user-alex', 'user-tanvir', 'user-rahim'], true, '100 Mbps shared fiber optical line'),
  ('rec-gas', 'housemint-flat-4b', 'Gas Cylinder Refill (LPG)', 'gas', 1400, 'monthly', 15, 'user-salman', 'equal', ARRAY['user-salman', 'user-alex', 'user-tanvir', 'user-rahim'], true, '12kg cylinder delivery for kitchen stove'),
  ('rec-electricity', 'housemint-flat-4b', 'DESCO Electricity Bill', 'electricity', 3200, 'monthly', 25, 'user-rahim', 'equal', ARRAY['user-salman', 'user-alex', 'user-tanvir', 'user-rahim'], true, 'Postpaid building electric meter bill'),
  ('rec-service', 'housemint-flat-4b', 'Apartment Building Service & Guard Fee', 'other', 2500, 'monthly', 30, 'user-alex', 'equal', ARRAY['user-salman', 'user-alex', 'user-tanvir', 'user-rahim'], true, 'Elevator maintenance, security guard, waste disposal'),
  ('rec-maid', 'housemint-flat-4b', 'Housekeeper / Cook Salary', 'other', 6000, 'monthly', 5, 'user-rahim', 'equal', ARRAY['user-salman', 'user-alex', 'user-tanvir', 'user-rahim'], true, 'Monthly cooking and cleaning service')
ON CONFLICT (id) DO NOTHING;

-- Insert Initial Expenses
INSERT INTO expenses (id, household_id, title, category, amount, paid_by, date, split_type, is_recurring, recurring_bill_id, notes, created_at)
VALUES
  ('exp-1', 'housemint-flat-4b', 'Apartment Rent — August', 'rent', 24000, 'user-salman', '2026-08-01', 'equal', true, 'rec-rent', 'Monthly 3-bed apartment rent paid to landlord', '2026-08-01T10:00:00Z'),
  ('exp-2', 'housemint-flat-4b', 'Weekly Grocery Haul (Shwapno)', 'groceries', 4800, 'user-alex', '2026-08-05', 'equal', false, null, 'Rice, chicken, vegetables, milk, cooking oil for apartment', '2026-08-05T14:30:00Z'),
  ('exp-3', 'housemint-flat-4b', 'Fiber Internet Bill (100 Mbps)', 'internet', 2000, 'user-tanvir', '2026-08-08', 'equal', true, 'rec-internet', null, '2026-08-08T11:15:00Z'),
  ('exp-4', 'housemint-flat-4b', 'Electricity (DPDC Prepaid Meter Recharge)', 'electricity', 3200, 'user-rahim', '2026-08-14', 'equal', false, null, 'Living room & bedroom AC usage', '2026-08-14T16:45:00Z'),
  ('exp-5', 'housemint-flat-4b', 'Gas Cylinder Refill (LPG 12kg)', 'gas', 1400, 'user-salman', '2026-08-18', 'equal', false, null, null, '2026-08-18T09:20:00Z'),
  ('exp-6', 'housemint-flat-4b', 'Mid-month Fresh Market & Snacks', 'groceries', 2400, 'user-alex', '2026-08-22', 'equal', false, null, null, '2026-08-22T18:10:00Z')
ON CONFLICT (id) DO NOTHING;

-- Insert Expense Items for Groceries (exp-2)
INSERT INTO expense_items (id, expense_id, name, quantity, unit, unit_price, total_price)
VALUES
  ('item-1', 'exp-2', 'Miniket Rice (10kg)', 2, 'pack', 420, 840),
  ('item-2', 'exp-2', 'Broiler Chicken', 4, 'kg', 220, 880),
  ('item-3', 'exp-2', 'Rupchanda Soybean Oil (5L)', 1, 'bottle', 980, 980),
  ('item-4', 'exp-2', 'Fresh Milk & Yogurt', 6, 'litre', 100, 600),
  ('item-5', 'exp-2', 'Mixed Fresh Vegetables & Spices', 1, NULL, 1500, 1500)
ON CONFLICT (id) DO NOTHING;

-- Insert Expense Splits for Initial Expenses
INSERT INTO expense_splits (id, expense_id, user_id, amount, percentage)
VALUES
  -- exp-1 splits
  ('spl-1-1', 'exp-1', 'user-salman', 6000, 25),
  ('spl-1-2', 'exp-1', 'user-alex', 6000, 25),
  ('spl-1-3', 'exp-1', 'user-tanvir', 6000, 25),
  ('spl-1-4', 'exp-1', 'user-rahim', 6000, 25),
  -- exp-2 splits
  ('spl-2-1', 'exp-2', 'user-salman', 1200, 25),
  ('spl-2-2', 'exp-2', 'user-alex', 1200, 25),
  ('spl-2-3', 'exp-2', 'user-tanvir', 1200, 25),
  ('spl-2-4', 'exp-2', 'user-rahim', 1200, 25),
  -- exp-3 splits
  ('spl-3-1', 'exp-3', 'user-salman', 500, 25),
  ('spl-3-2', 'exp-3', 'user-alex', 500, 25),
  ('spl-3-3', 'exp-3', 'user-tanvir', 500, 25),
  ('spl-3-4', 'exp-3', 'user-rahim', 500, 25),
  -- exp-4 splits
  ('spl-4-1', 'exp-4', 'user-salman', 800, 25),
  ('spl-4-2', 'exp-4', 'user-alex', 800, 25),
  ('spl-4-3', 'exp-4', 'user-tanvir', 800, 25),
  ('spl-4-4', 'exp-4', 'user-rahim', 800, 25),
  -- exp-5 splits
  ('spl-5-1', 'exp-5', 'user-salman', 350, 25),
  ('spl-5-2', 'exp-5', 'user-alex', 350, 25),
  ('spl-5-3', 'exp-5', 'user-tanvir', 350, 25),
  ('spl-5-4', 'exp-5', 'user-rahim', 350, 25),
  -- exp-6 splits
  ('spl-6-1', 'exp-6', 'user-salman', 600, 25),
  ('spl-6-2', 'exp-6', 'user-alex', 600, 25),
  ('spl-6-3', 'exp-6', 'user-tanvir', 600, 25),
  ('spl-6-4', 'exp-6', 'user-rahim', 600, 25)
ON CONFLICT (id) DO NOTHING;

-- Insert Initial Settlements
INSERT INTO settlements (id, household_id, payer_id, receiver_id, amount, date, notes, created_at)
VALUES
  ('set-1', 'housemint-flat-4b', 'user-tanvir', 'user-salman', 5000, '2026-08-10', 'Rent share settlement via bKash', '2026-08-10T19:00:00Z')
ON CONFLICT (id) DO NOTHING;
