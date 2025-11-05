-- Corrigir security warnings: Function Search Path Mutable

-- Recriar função de update com search_path configurado
CREATE OR REPLACE FUNCTION public.update_produtos_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;