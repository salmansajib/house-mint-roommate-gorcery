-- ==============================================================================
-- HouseMint — In-App Notifications & Activity Feed Migration
-- Run this in your Supabase SQL Editor to enable collaborative real-time notifications
-- ==============================================================================

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  household_id TEXT NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  actor_id TEXT REFERENCES profiles(id) ON DELETE SET NULL,
  actor_name TEXT NOT NULL,
  action_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC(12, 2),
  category TEXT,
  target_id TEXT,
  target_title TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_by TEXT[] NOT NULL DEFAULT '{}'
);

-- Index for speedy retrieval ordered by newest first
CREATE INDEX IF NOT EXISTS idx_notifications_household ON notifications(household_id, created_at DESC);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Allow anon read and write
DROP POLICY IF EXISTS "Allow anon all on notifications" ON notifications;
CREATE POLICY "Allow anon all on notifications" ON notifications FOR ALL USING (true) WITH CHECK (true);

-- Enable Realtime WebSockets for notifications table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
  END IF;
END $$;
