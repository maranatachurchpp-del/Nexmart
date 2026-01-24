-- Atomic rate limit upsert function for persistent throttling
-- Returns TRUE if rate limited, FALSE if allowed

CREATE OR REPLACE FUNCTION public.upsert_rate_limit(
  p_key TEXT,
  p_max_count INTEGER,
  p_reset_at TIMESTAMPTZ
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
  v_reset_at TIMESTAMPTZ;
BEGIN
  -- Try to get existing record
  SELECT count, reset_at INTO v_count, v_reset_at
  FROM public.lead_rate_limits
  WHERE key = p_key
  FOR UPDATE;

  IF NOT FOUND THEN
    -- First request for this key
    INSERT INTO public.lead_rate_limits (key, count, reset_at)
    VALUES (p_key, 1, p_reset_at);
    RETURN FALSE; -- Not rate limited
  END IF;

  -- Check if window has expired
  IF v_reset_at < NOW() THEN
    -- Reset the counter
    UPDATE public.lead_rate_limits
    SET count = 1, reset_at = p_reset_at, updated_at = NOW()
    WHERE key = p_key;
    RETURN FALSE; -- Not rate limited
  END IF;

  -- Window still active, check count
  IF v_count >= p_max_count THEN
    RETURN TRUE; -- Rate limited
  END IF;

  -- Increment counter
  UPDATE public.lead_rate_limits
  SET count = count + 1, updated_at = NOW()
  WHERE key = p_key;

  RETURN FALSE; -- Not rate limited
END;
$$;