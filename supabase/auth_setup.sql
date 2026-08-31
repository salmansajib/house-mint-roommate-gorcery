-- ==============================================================================
-- HouseMint — Supabase Auth Automatic Profile Linking Trigger
-- Run this in your Supabase SQL Editor to auto-create roommate profiles on sign-up
-- ==============================================================================

-- Trigger function that runs every time a user signs up via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_household_id TEXT;
  v_name TEXT;
  v_accent TEXT;
  v_role TEXT;
  v_is_roommate BOOLEAN;
BEGIN
  -- Extract name, household code, role, and resident status from user metadata
  v_name := COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1));
  v_household_id := COALESCE(new.raw_user_meta_data->>'household_id', 'housemint-flat-4b');
  v_accent := 'user-' || ((floor(random() * 8) + 1)::text);
  v_role := COALESCE(new.raw_user_meta_data->>'role', 'member');
  v_is_roommate := COALESCE((new.raw_user_meta_data->>'is_roommate')::boolean, TRUE);

  -- Ensure target household exists
  INSERT INTO public.households (id, name, invite_code, admin_invite_code)
  VALUES (v_household_id, 'HouseMint Flat 4B', 'MINT-4B', 'MINT-ADMIN-4B')
  ON CONFLICT (id) DO NOTHING;

  -- Create or link the profile with role and resident status
  INSERT INTO public.profiles (id, household_id, name, email, accent_color, role, is_roommate)
  VALUES (new.id::text, v_household_id, v_name, new.email, v_accent, v_role, v_is_roommate)
  ON CONFLICT (id) DO UPDATE
  SET name = EXCLUDED.name, email = EXCLUDED.email, role = EXCLUDED.role, is_roommate = EXCLUDED.is_roommate;

  RETURN new;
END;
$$;

-- Create the trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
