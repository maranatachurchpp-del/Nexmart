-- Create leads table for landing page lead capture
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  source TEXT DEFAULT 'landing',
  metadata JSONB DEFAULT '{}',
  converted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT leads_email_unique UNIQUE (email)
);

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Policies for leads - anyone can insert (public form), only admins can read
CREATE POLICY "Anyone can submit leads" ON public.leads
FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all leads" ON public.leads
FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage leads" ON public.leads
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Add dashboard_layout column to profiles for widget positions
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS dashboard_layout JSONB DEFAULT '{}';

-- Fix overly permissive RLS policies
DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;
CREATE POLICY "Service role can insert audit logs" ON public.audit_logs
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL OR current_setting('role', true) = 'service_role');

DROP POLICY IF EXISTS "System can insert report history" ON public.report_history;
CREATE POLICY "Authenticated users can insert own report history" ON public.report_history
FOR INSERT WITH CHECK (auth.uid() = user_id);