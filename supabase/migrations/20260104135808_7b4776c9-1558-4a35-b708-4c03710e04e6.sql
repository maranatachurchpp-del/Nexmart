-- Fix create_audit_log RPC to use auth.uid() instead of user-provided parameter
-- This prevents log spoofing attacks

CREATE OR REPLACE FUNCTION public.create_audit_log(
    _action TEXT,
    _entity_type TEXT,
    _entity_id TEXT DEFAULT NULL,
    _old_values JSONB DEFAULT NULL,
    _new_values JSONB DEFAULT NULL,
    _metadata JSONB DEFAULT '{}'::JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    _log_id UUID;
    _user_id UUID;
    _user_email TEXT;
BEGIN
    -- Use authenticated user, not client-provided parameter
    _user_id := auth.uid();
    
    IF _user_id IS NULL THEN
        RAISE EXCEPTION 'Unauthorized: Must be authenticated to create audit logs';
    END IF;
    
    -- Get user email from auth.users
    SELECT email INTO _user_email FROM auth.users WHERE id = _user_id;
    
    INSERT INTO public.audit_logs (
        user_id, user_email, action, entity_type, entity_id, 
        old_values, new_values, metadata
    ) VALUES (
        _user_id, _user_email, _action, _entity_type, _entity_id,
        _old_values, _new_values, _metadata
    )
    RETURNING id INTO _log_id;
    
    RETURN _log_id;
END;
$$;


-- Fix create_sample_produtos RPC to verify the caller has permission
CREATE OR REPLACE FUNCTION public.create_sample_produtos(target_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Explicit authorization check
  IF target_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: Cannot create products for other users';
  END IF;
  
  INSERT INTO public.produtos (
    user_id, codigo, descricao, departamento, categoria, subcategoria,
    quebra_esperada, quebra_atual, margem_a_min, margem_a_max,
    marcas_min, marcas_max, marcas_atuais, giro_ideal_mes,
    participacao_faturamento, preco_medio_min, preco_medio_max,
    classificacao_kvi, status
  ) VALUES
    (target_user_id, 'PROD001', 'Arroz Tipo 1 5kg', 'Alimentos', 'Grãos e Cereais', 'Arroz', 2.5, 3.2, 15.0, 20.0, 5, 8, 6, 50, 12.5, 15.00, 25.00, 'Alta', 'warning'),
    (target_user_id, 'PROD002', 'Feijão Preto 1kg', 'Alimentos', 'Grãos e Cereais', 'Feijão', 1.8, 1.5, 18.0, 25.0, 4, 7, 5, 45, 8.3, 5.00, 10.00, 'Alta', 'success'),
    (target_user_id, 'PROD003', 'Açúcar Cristal 5kg', 'Alimentos', 'Açúcar e Adoçantes', 'Açúcar', 3.0, 2.8, 12.0, 18.0, 3, 6, 4, 60, 10.2, 10.00, 18.00, 'Média', 'success'),
    (target_user_id, 'PROD004', 'Café Torrado 500g', 'Bebidas', 'Café', 'Café Tradicional', 2.2, 4.5, 25.0, 35.0, 6, 10, 8, 40, 15.7, 12.00, 30.00, 'Alta', 'destructive'),
    (target_user_id, 'PROD005', 'Leite Integral 1L', 'Laticínios', 'Leite', 'Leite Integral', 4.0, 3.8, 8.0, 15.0, 5, 8, 6, 80, 18.4, 3.50, 6.00, 'Média', 'success');
END;
$$;


-- Add explicit admin-only write policies for subscription_plans
CREATE POLICY "Only admins can insert subscription plans"
ON public.subscription_plans FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update subscription plans"
ON public.subscription_plans FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can delete subscription plans"
ON public.subscription_plans FOR DELETE
USING (public.has_role(auth.uid(), 'admin'::app_role));


-- Restrict report_history updates to service role only
DROP POLICY IF EXISTS "System can update report history" ON public.report_history;
CREATE POLICY "Only service role can update report history"
ON public.report_history FOR UPDATE
USING (auth.jwt()->>'role' = 'service_role');