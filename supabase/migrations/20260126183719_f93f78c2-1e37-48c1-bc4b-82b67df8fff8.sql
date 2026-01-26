-- Create a safe view for client-side plan display (excludes stripe_price_id)
CREATE OR REPLACE VIEW public.subscription_plans_public AS
SELECT
  id,
  name,
  description,
  price_monthly,
  features,
  max_users,
  trial_days,
  is_active,
  created_at,
  updated_at
FROM public.subscription_plans
WHERE is_active = true;

ALTER VIEW public.subscription_plans_public SET (security_invoker = on);

COMMENT ON VIEW public.subscription_plans_public IS 'Client-safe view of active subscription plans. Excludes stripe_price_id to avoid exposing payment integration identifiers.';

-- Allow service role to manage lead rate limits table explicitly
CREATE POLICY "Service role can manage lead rate limits"
ON public.lead_rate_limits
FOR ALL
USING (current_setting('role', true) = 'service_role')
WITH CHECK (current_setting('role', true) = 'service_role');

COMMENT ON TABLE public.lead_rate_limits IS 'Internal table for lead form rate limiting. Intended for service role / backend functions only.';