-- Create product_snapshots table for historical data (sparklines, trends)
CREATE TABLE public.product_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.produtos(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  snapshot_date DATE NOT NULL,
  margem_atual NUMERIC,
  quebra_atual NUMERIC,
  ruptura_atual NUMERIC,
  marcas_atuais INTEGER,
  participacao_faturamento NUMERIC,
  giro_ideal_mes INTEGER,
  preco_medio NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create unique index to prevent duplicate snapshots per product per day
CREATE UNIQUE INDEX idx_product_snapshots_unique ON public.product_snapshots(product_id, snapshot_date);

-- Create index for efficient querying by user and date
CREATE INDEX idx_product_snapshots_user_date ON public.product_snapshots(user_id, snapshot_date);

-- Enable RLS
ALTER TABLE public.product_snapshots ENABLE ROW LEVEL SECURITY;

-- Users can view their own snapshots
CREATE POLICY "Users can view own snapshots"
ON public.product_snapshots FOR SELECT
USING (auth.uid() = user_id);

-- Only service role can insert snapshots (for scheduled jobs)
CREATE POLICY "Only service role can insert snapshots"
ON public.product_snapshots FOR INSERT
WITH CHECK (auth.uid() IS NULL);

-- Admins can view all snapshots
CREATE POLICY "Admins can view all snapshots"
ON public.product_snapshots FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create function to generate daily snapshots
CREATE OR REPLACE FUNCTION public.generate_daily_snapshots()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.product_snapshots (
    product_id,
    user_id,
    snapshot_date,
    margem_atual,
    quebra_atual,
    ruptura_atual,
    marcas_atuais,
    participacao_faturamento,
    giro_ideal_mes,
    preco_medio
  )
  SELECT 
    p.id,
    p.user_id,
    CURRENT_DATE,
    (p.margem_a_min + p.margem_a_max) / 2,
    p.quebra_atual,
    p.ruptura_atual,
    p.marcas_atuais,
    p.participacao_faturamento,
    p.giro_ideal_mes,
    (p.preco_medio_min + p.preco_medio_max) / 2
  FROM public.produtos p
  ON CONFLICT (product_id, snapshot_date) DO UPDATE SET
    margem_atual = EXCLUDED.margem_atual,
    quebra_atual = EXCLUDED.quebra_atual,
    ruptura_atual = EXCLUDED.ruptura_atual,
    marcas_atuais = EXCLUDED.marcas_atuais,
    participacao_faturamento = EXCLUDED.participacao_faturamento,
    giro_ideal_mes = EXCLUDED.giro_ideal_mes,
    preco_medio = EXCLUDED.preco_medio;
END;
$$;

-- Generate initial snapshot for existing data
SELECT public.generate_daily_snapshots();