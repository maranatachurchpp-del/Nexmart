-- Remove the public INSERT policy on leads table since all submissions go through the submit-lead Edge Function
DROP POLICY IF EXISTS "Anyone can submit leads" ON public.leads;