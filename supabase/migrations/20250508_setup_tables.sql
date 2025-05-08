
-- First, ensure we're using the auth schema
SET search_path TO auth, public;

-- For Supabase auth settings, we need a more direct approach to disable email validation
DO $$
BEGIN
  -- Create the auth schema if it doesn't exist
  CREATE SCHEMA IF NOT EXISTS auth;
  
  -- Check if auth.config exists, if not, we'll create a simplified version for our needs
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'auth' AND tablename = 'config') THEN
    -- Create a simple config table for auth settings
    CREATE TABLE auth.config (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  END IF;
  
  -- IMPORTANT: Try multiple approaches to disable email validation
  -- First approach: Insert configuration options
  INSERT INTO auth.config (key, value) 
  VALUES 
    ('DISABLE_EMAIL_VALIDATION', 'true'),
    ('ENABLE_EMAIL_CONFIRMATIONS', 'false'),
    ('EMAIL_REGEX', '.*')  -- Most permissive regex possible
  ON CONFLICT (key) DO UPDATE 
    SET value = EXCLUDED.value;

  -- Second approach: Try to directly modify any existing email validation settings in the database
  -- This may differ based on Supabase version, but we'll attempt it
  BEGIN
    -- Attempt to modify email validation settings in auth.config if they exist
    UPDATE auth.config SET value = 'false' WHERE key = 'ENABLE_EMAIL_VALIDATION';
    UPDATE auth.config SET value = '.*' WHERE key = 'EMAIL_REGEX';
    
    -- Attempt to modify any potential instance configuration
    EXECUTE 'ALTER SYSTEM SET disable_email_validation = TRUE';
    EXECUTE 'ALTER SYSTEM SET enable_email_confirmations = FALSE';
  EXCEPTION 
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not modify system settings: %', SQLERRM;
  END;

EXCEPTION
  WHEN OTHERS THEN
    -- If we encounter errors, log them but continue
    RAISE NOTICE 'Error configuring auth settings: %', SQLERRM;
END;
$$;

-- Create the users table if it doesn't exist yet
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  name TEXT,
  role TEXT,
  contact_info JSONB,
  assigned_zones TEXT[],
  last_login TIMESTAMP WITH TIME ZONE
);

-- Set up RLS policies for the users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read and update their own data
CREATE POLICY users_self_access ON public.users 
  FOR ALL 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow public access for signup process
CREATE POLICY users_insert ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);
