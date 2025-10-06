-- Fase 4.1: Correções de Segurança

-- 1. Remover stripe_customer_id da tabela profiles (mantém apenas em subscriptions)
ALTER TABLE public.profiles DROP COLUMN IF EXISTS stripe_customer_id;

-- 2. Criar view segura para subscriptions (oculta IDs Stripe sensíveis)
CREATE OR REPLACE VIEW public.user_subscriptions AS
SELECT 
  id,
  user_id,
  plan_id,
  status,
  current_period_start,
  current_period_end,
  trial_end,
  canceled_at,
  created_at,
  updated_at
FROM public.subscriptions;

-- 3. Política RLS para a view
ALTER VIEW public.user_subscriptions SET (security_invoker = on);

-- 4. Políticas DELETE explícitas

-- profiles: Apenas admins podem deletar perfis (GDPR compliance)
CREATE POLICY "Admins can delete profiles"
ON public.profiles
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- subscriptions: Não permitir DELETE (cancelamento via canceled_at)
CREATE POLICY "No one can delete subscriptions"
ON public.subscriptions
FOR DELETE
USING (false);

-- 5. Comentários para documentação
COMMENT ON TABLE public.subscriptions IS 'Subscription records are never deleted. Cancellations are handled via canceled_at timestamp for audit purposes.';
COMMENT ON VIEW public.user_subscriptions IS 'Secure view of subscriptions that excludes sensitive Stripe identifiers (stripe_customer_id, stripe_subscription_id). Use this view for user-facing queries.';