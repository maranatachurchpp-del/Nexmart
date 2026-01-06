-- Fix unrestricted INSERT policy on alert_history table
-- Change from WITH CHECK (true) to service role only

DROP POLICY IF EXISTS "System can insert alert history" ON public.alert_history;

CREATE POLICY "Only service role can insert alert history"
ON public.alert_history FOR INSERT
WITH CHECK (
  -- Service role operations have auth.uid() as NULL
  auth.uid() IS NULL
);