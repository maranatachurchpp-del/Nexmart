-- Fix security issues by updating function search paths
CREATE OR REPLACE FUNCTION public.has_active_subscription(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.subscriptions 
    WHERE subscriptions.user_id = $1 
    AND status IN ('active', 'trialing')
    AND (current_period_end IS NULL OR current_period_end > now())
  );
$$;

CREATE OR REPLACE FUNCTION public.get_user_plan(user_id UUID)
RETURNS TABLE (
  plan_name TEXT,
  plan_features JSONB,
  status TEXT,
  trial_end TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    sp.name,
    sp.features,
    s.status,
    s.trial_end,
    s.current_period_end
  FROM public.subscriptions s
  JOIN public.subscription_plans sp ON s.plan_id = sp.id
  WHERE s.user_id = $1 
  AND s.status IN ('active', 'trialing')
  ORDER BY s.created_at DESC
  LIMIT 1;
$$;