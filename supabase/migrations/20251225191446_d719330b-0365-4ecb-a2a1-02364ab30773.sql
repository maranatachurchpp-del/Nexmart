-- Create table for alert configurations
CREATE TABLE IF NOT EXISTS public.alert_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    alert_type TEXT NOT NULL,
    enabled BOOLEAN DEFAULT true,
    threshold_value NUMERIC,
    notification_channels TEXT[] DEFAULT ARRAY['in_app'],
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.alert_configurations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own alert configurations"
ON public.alert_configurations FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own alert configurations"
ON public.alert_configurations FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own alert configurations"
ON public.alert_configurations FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own alert configurations"
ON public.alert_configurations FOR DELETE
USING (auth.uid() = user_id);

-- Create table for alert history
CREATE TABLE IF NOT EXISTS public.alert_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    alert_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    priority TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
    category TEXT NOT NULL,
    actionable_insight TEXT,
    is_resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.alert_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for alert history
CREATE POLICY "Users can view own alert history"
ON public.alert_history FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can insert alert history"
ON public.alert_history FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update own alert history"
ON public.alert_history FOR UPDATE
USING (auth.uid() = user_id);

-- Create table for scheduled reports
CREATE TABLE IF NOT EXISTS public.scheduled_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    report_type TEXT NOT NULL CHECK (report_type IN ('pdf', 'excel', 'both')),
    frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly')),
    day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6),
    day_of_month INTEGER CHECK (day_of_month >= 1 AND day_of_month <= 28),
    time_of_day TIME DEFAULT '08:00:00',
    recipients TEXT[] NOT NULL,
    filters JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    last_run_at TIMESTAMPTZ,
    next_run_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.scheduled_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for scheduled reports
CREATE POLICY "Users can view own scheduled reports"
ON public.scheduled_reports FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scheduled reports"
ON public.scheduled_reports FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scheduled reports"
ON public.scheduled_reports FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own scheduled reports"
ON public.scheduled_reports FOR DELETE
USING (auth.uid() = user_id);

-- Create table for report execution history
CREATE TABLE IF NOT EXISTS public.report_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scheduled_report_id UUID REFERENCES public.scheduled_reports(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    report_type TEXT NOT NULL,
    file_url TEXT,
    error_message TEXT,
    recipients_notified TEXT[],
    created_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.report_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for report history
CREATE POLICY "Users can view own report history"
ON public.report_history FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can insert report history"
ON public.report_history FOR INSERT
WITH CHECK (true);

CREATE POLICY "System can update report history"
ON public.report_history FOR UPDATE
USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_alert_configurations_user ON public.alert_configurations(user_id);
CREATE INDEX IF NOT EXISTS idx_alert_history_user ON public.alert_history(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scheduled_reports_user ON public.scheduled_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_reports_next_run ON public.scheduled_reports(next_run_at) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_report_history_scheduled ON public.report_history(scheduled_report_id, created_at DESC);