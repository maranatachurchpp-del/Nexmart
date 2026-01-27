-- Ensure no public lead submission policies exist (defensive hardening)
DO $$
BEGIN
  -- Drop any legacy permissive INSERT policy if it exists
  EXECUTE 'DROP POLICY IF EXISTS "Anyone can submit leads" ON public.leads';
  EXECUTE 'DROP POLICY IF EXISTS "Anyone can submit leads" ON public.leads';
EXCEPTION WHEN undefined_table THEN
  -- Table does not exist in some environments
  NULL;
END $$;

-- Revoke table privileges from anon/authenticated to prevent any accidental direct table writes
REVOKE ALL ON TABLE public.leads FROM anon;
REVOKE ALL ON TABLE public.leads FROM authenticated;

-- Keep admin access through RLS policies + role checks (no additional grants needed)
