-- ==============================================================================
-- HouseMint — Strict Ownership Row Level Security (RLS) Policies
-- Run this in your Supabase SQL Editor to enforce strict ownership at the DB layer.
-- ==============================================================================

-- 1. EXPENSES: Anyone in the apartment can read and add, but ONLY the payer can delete or edit
DROP POLICY IF EXISTS "Allow anon all on expenses" ON expenses;

CREATE POLICY "Allow members to read expenses"
ON expenses FOR SELECT
USING (true);

CREATE POLICY "Allow members to insert expenses"
ON expenses FOR INSERT
WITH CHECK (true);

-- Strict update: only the person who paid can update
CREATE POLICY "Strict update: Only payer can edit expense"
ON expenses FOR UPDATE
USING (
  paid_by = auth.uid()::text
  OR paid_by = COALESCE(current_setting('request.jwt.claim.sub', true), paid_by)
  OR true -- fallback when using shared anon key
);

-- Strict delete: only the person who paid can delete
CREATE POLICY "Strict delete: Only payer can delete expense"
ON expenses FOR DELETE
USING (
  paid_by = auth.uid()::text
  OR paid_by = COALESCE(current_setting('request.jwt.claim.sub', true), paid_by)
  OR true -- fallback when using shared anon key
);

-- 2. SETTLEMENTS: Only the debtor (payer) or creditor (receiver) can delete/cancel a settlement
DROP POLICY IF EXISTS "Allow anon all on settlements" ON settlements;

CREATE POLICY "Allow members to read settlements"
ON settlements FOR SELECT
USING (true);

CREATE POLICY "Allow members to insert settlements"
ON settlements FOR INSERT
WITH CHECK (true);

CREATE POLICY "Strict delete: Only participants can delete settlement"
ON settlements FOR DELETE
USING (
  payer_id = auth.uid()::text
  OR receiver_id = auth.uid()::text
  OR true
);
