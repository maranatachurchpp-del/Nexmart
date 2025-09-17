import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

// Interfaces para tipagem dos dados
interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price_monthly: number;
  features: string[];
}

interface UserSubscription {
  id: string;
  status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid';
  current_period_end: string;
  trial_end: string | null;
  plan: SubscriptionPlan;
}

interface SubscriptionContextType {
  subscription: UserSubscription | null;
  loading: boolean;
  hasAccess: boolean;
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSubscription = useCallback(async () => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          id,
          status,
          current_period_end,
          trial_end,
          plan:subscription_plans (id, name, description, price_monthly, features)
        `)
        .eq('user_id', user.id)
        .in('status', ['trialing', 'active'])
        .maybeSingle();

      if (error) throw error;
      
      if (data && data.plan) {
         // Corrigido: Garante que data.plan não é uma lista
         const planData = Array.isArray(data.plan) ? data.plan[0] : data.plan;
         setSubscription({ ...data, plan: planData } as UserSubscription);
      } else {
        setSubscription(null);
      }

    } catch (error) {
      console.error('Erro ao buscar assinatura:', error);
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const value = {
    subscription,
    loading,
    hasAccess: !!subscription && (subscription.status === 'active' || subscription.status === 'trialing'),
    refreshSubscription: fetchSubscription,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription deve ser usado dentro de um SubscriptionProvider');
  }
  return context;
}
