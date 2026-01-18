-- Fix warn-level security findings: tighten subscription plan visibility, prevent anonymous notification inserts, and explicitly restrict lead deletion

-- 1) subscription_plans: require authentication for SELECT (landing pricing is hardcoded, so no public dependency)
DROP POLICY IF EXISTS "Everyone can view active plans" ON public.subscription_plans;
DROP POLICY IF EXISTS "Anyone can view active subscription plans" ON public.subscription_plans;
DROP POLICY IF EXISTS "Authenticated users can view active subscription plans" ON public.subscription_plans;

CREATE POLICY "Authenticated users can view active subscription plans"
ON public.subscription_plans
FOR SELECT
TO authenticated
USING (is_active = true);

-- 2) notifications: block anonymous inserts from the public API while still allowing system inserts (triggers) and service role
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;

CREATE POLICY "System can insert notifications"
ON public.notifications
FOR INSERT
WITH CHECK (
  (auth.uid() = user_id)
  OR ((auth.jwt() ->> 'role') = 'service_role')
  OR (current_setting('role', true) = 'service_role')
  OR (pg_trigger_depth() > 0)
);

-- 3) leads: add explicit admin-only DELETE policy (defense-in-depth)
DROP POLICY IF EXISTS "Only admins can delete leads" ON public.leads;

CREATE POLICY "Only admins can delete leads"
ON public.leads
FOR DELETE
USING (has_role(auth.uid(), 'admin'::public.app_role));
