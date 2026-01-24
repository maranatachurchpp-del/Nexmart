-- Persistent rate limiting storage for public lead capture
-- This hardens submit-lead against cold starts / multi-instance bypass.

CREATE TABLE IF NOT EXISTS public.lead_rate_limits (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 0,
  reset_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lead_rate_limits_reset_at ON public.lead_rate_limits (reset_at);

-- Enable Row Level Security (deny by default; service role bypasses RLS)
ALTER TABLE public.lead_rate_limits ENABLE ROW LEVEL SECURITY;

-- updated_at trigger helper (idempotent)
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS trg_lead_rate_limits_updated_at ON public.lead_rate_limits;
CREATE TRIGGER trg_lead_rate_limits_updated_at
BEFORE UPDATE ON public.lead_rate_limits
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();
