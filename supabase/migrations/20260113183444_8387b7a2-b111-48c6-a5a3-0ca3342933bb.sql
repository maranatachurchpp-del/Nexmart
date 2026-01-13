-- Remove the overly permissive public INSERT policy on leads table
-- The Edge Function now handles inserts with rate limiting using service role
DROP POLICY IF EXISTS "Anyone can submit leads" ON public.leads;