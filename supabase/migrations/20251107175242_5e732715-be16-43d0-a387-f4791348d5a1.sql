-- FASE 1: CORREÇÃO CRÍTICA DO SCHEMA

-- 1.1 Adicionar coluna stripe_customer_id na tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE;

CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id 
ON public.profiles(stripe_customer_id);

-- 1.2 Renomear user_subscriptions para subscriptions
ALTER TABLE IF EXISTS public.user_subscriptions RENAME TO subscriptions;

-- 1.3 Criar tabela payment_history
CREATE TABLE IF NOT EXISTS public.payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'BRL',
  status TEXT NOT NULL CHECK (status IN ('paid', 'failed', 'pending')),
  stripe_invoice_id TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_history_subscription_id 
ON payment_history(subscription_id);

CREATE INDEX IF NOT EXISTS idx_payment_history_stripe_invoice 
ON payment_history(stripe_invoice_id);

-- RLS Policies para payment_history
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payment history"
ON payment_history FOR SELECT
USING (
  subscription_id IN (
    SELECT id FROM subscriptions WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all payment history"
ON payment_history FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- 1.4 Adicionar constraint UNIQUE na coluna name de subscription_plans
ALTER TABLE subscription_plans 
ADD CONSTRAINT subscription_plans_name_unique UNIQUE (name);

-- 1.5 Popular subscription_plans com planos reais
INSERT INTO subscription_plans (name, description, price_monthly, trial_days, features, is_active)
VALUES 
  ('Teste Gratuito', 'Teste gratuito de 7 dias com acesso completo', 0, 7, 
   '["Estrutura Mercadológica", "Dashboard de Análise", "Alertas Inteligentes", "Relatórios", "Suporte por Email"]'::jsonb, true),
  
  ('Básico', 'Plano básico para pequenos mercados', 49.90, 7, 
   '["Estrutura Mercadológica", "Dashboard Básico", "Relatórios", "Suporte Email", "1 Usuário"]'::jsonb, true),
  
  ('Profissional', 'Plano completo com todas funcionalidades', 99.90, 7,
   '["Tudo do Básico", "Alertas Inteligentes AI", "Análise Avançada", "Exportação Ilimitada", "API Access", "3 Usuários", "Suporte Prioritário"]'::jsonb, true),
   
  ('Empresarial', 'Para redes com múltiplas lojas', 199.90, 7,
   '["Tudo do Profissional", "Multi-lojas Ilimitadas", "White Label", "Consultoria Mensal", "Usuários Ilimitados", "Suporte 24/7", "SLA Garantido"]'::jsonb, true)
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  price_monthly = EXCLUDED.price_monthly,
  trial_days = EXCLUDED.trial_days,
  features = EXCLUDED.features,
  is_active = EXCLUDED.is_active;

-- 1.6 Criar trigger para dados sample automáticos
CREATE OR REPLACE FUNCTION create_user_sample_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Criar produtos sample para novo usuário
  PERFORM create_sample_produtos(NEW.user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_profile_created ON profiles;
CREATE TRIGGER on_profile_created
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_user_sample_data();

-- 1.7 Adicionar índices de performance
CREATE INDEX IF NOT EXISTS idx_produtos_user_departamento 
ON produtos(user_id, departamento);

CREATE INDEX IF NOT EXISTS idx_produtos_user_categoria 
ON produtos(user_id, categoria);

CREATE INDEX IF NOT EXISTS idx_produtos_status 
ON produtos(status) WHERE status IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_subscriptions_user 
ON subscriptions(user_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_status 
ON subscriptions(status);