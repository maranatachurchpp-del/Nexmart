-- Remover políticas RLS redundantes que expõem estrutura do banco desnecessariamente
-- Essas políticas são redundantes porque já existem políticas específicas por usuário

-- 1. user_roles - remover política genérica
DROP POLICY IF EXISTS "Require auth for user roles select" ON public.user_roles;

-- 2. audit_logs - remover política genérica
DROP POLICY IF EXISTS "Require auth for audit logs select" ON public.audit_logs;

-- 3. notifications - remover política genérica  
DROP POLICY IF EXISTS "Require auth for notifications select" ON public.notifications;

-- 4. product_snapshots - remover política genérica
DROP POLICY IF EXISTS "Require auth for product snapshots select" ON public.product_snapshots;

-- 5. alert_configurations - remover política genérica
DROP POLICY IF EXISTS "Require auth for alert configurations select" ON public.alert_configurations;

-- 6. alert_history - remover política genérica
DROP POLICY IF EXISTS "Require auth for alert history select" ON public.alert_history;

-- 7. report_history - remover política genérica
DROP POLICY IF EXISTS "Require auth for report history select" ON public.report_history;

-- 8. scheduled_reports - remover política genérica
DROP POLICY IF EXISTS "Require auth for scheduled reports select" ON public.scheduled_reports;