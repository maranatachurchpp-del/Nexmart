-- Add explicit restrictive SELECT policies to block anonymous access (defense-in-depth)

-- notifications
CREATE POLICY "Require auth for notifications select"
ON public.notifications
AS RESTRICTIVE
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- alert_configurations
CREATE POLICY "Require auth for alert configurations select"
ON public.alert_configurations
AS RESTRICTIVE
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- alert_history
CREATE POLICY "Require auth for alert history select"
ON public.alert_history
AS RESTRICTIVE
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- scheduled_reports
CREATE POLICY "Require auth for scheduled reports select"
ON public.scheduled_reports
AS RESTRICTIVE
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- report_history
CREATE POLICY "Require auth for report history select"
ON public.report_history
AS RESTRICTIVE
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- product_snapshots
CREATE POLICY "Require auth for product snapshots select"
ON public.product_snapshots
AS RESTRICTIVE
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- audit_logs
CREATE POLICY "Require auth for audit logs select"
ON public.audit_logs
AS RESTRICTIVE
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- user_roles
CREATE POLICY "Require auth for user roles select"
ON public.user_roles
AS RESTRICTIVE
FOR SELECT
USING (auth.uid() IS NOT NULL);