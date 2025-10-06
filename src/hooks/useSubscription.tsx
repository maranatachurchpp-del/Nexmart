import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price_monthly: number;
  features: string[];
  max_users: number;
  trial_days: number;
  is_active: boolean;
  stripe_price_id?: string;
}

interface UserSubscription {
  id: string;
  plan_id: string;
  status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid';
  current_period_start: string;
  current_period_end: string;
  trial_end: string;
  canceled_at: string | null;
  plan: SubscriptionPlan;
}

interface SubscriptionContextType {
  subscription: UserSubscription | null;
  plans: SubscriptionPlan[];
  loading: boolean;
  hasAccess: boolean;
  isTrialing: boolean;
  trialDaysLeft: number;
  refreshSubscription: () => Promise<void>;
  checkFeatureAccess: (feature: string) => boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price_monthly', { ascending: true });

      if (error) throw error;
      
      const typedPlans: SubscriptionPlan[] = (data || []).map(plan => ({
        id: plan.id,
        name: plan.name,
        description: plan.description || '',
        price_monthly: plan.price_monthly,
        features: Array.isArray(plan.features) ? plan.features.filter((f): f is string => typeof f === 'string') : [],
        max_users: plan.max_users || 1,
        trial_days: plan.trial_days || 0,
        is_active: plan.is_active || false,
        stripe_price_id: plan.stripe_price_id || undefined
      }));
      
      setPlans(typedPlans);
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };

  const fetchSubscription = async () => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    try {
      // Use secure view that excludes sensitive Stripe IDs
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          plan:subscription_plans(*)
        `)
        .eq('user_id', user.id)
        .in('status', ['trialing', 'active'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setSubscription({
          ...data,
          plan: data.plan
        } as UserSubscription);
      } else {
        // Create trial subscription for new users
        await createTrialSubscription();
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTrialSubscription = async () => {
    if (!user) return;

    try {
      const trialPlan = plans.find(p => p.name === 'Teste Gratuito');
      if (!trialPlan) return;

      const trialEnd = new Date();
      trialEnd.setDate(trialEnd.getDate() + 7);

      const { data, error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
          plan_id: trialPlan.id,
          status: 'trialing',
          trial_end: trialEnd.toISOString(),
          current_period_end: trialEnd.toISOString()
        })
        .select(`
          *,
          plan:subscription_plans(*)
        `)
        .single();

      if (error) throw error;
      
      setSubscription({
        ...data,
        plan: data.plan
      } as UserSubscription);
    } catch (error) {
      console.error('Error creating trial subscription:', error);
    }
  };

  const refreshSubscription = async () => {
    await fetchSubscription();
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  useEffect(() => {
    if (user && plans.length > 0) {
      fetchSubscription();
    } else if (!user) {
      setSubscription(null);
      setLoading(false);
    }
  }, [user, plans.length]);

  const hasAccess = subscription?.status === 'active' || subscription?.status === 'trialing';
  const isTrialing = subscription?.status === 'trialing';
  
  const trialDaysLeft = subscription?.trial_end 
    ? Math.max(0, Math.ceil((new Date(subscription.trial_end).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  const checkFeatureAccess = (feature: string): boolean => {
    if (!subscription?.plan) return false;
    return subscription.plan.features.includes(feature);
  };

  const value = {
    subscription,
    plans,
    loading,
    hasAccess,
    isTrialing,
    trialDaysLeft,
    refreshSubscription,
    checkFeatureAccess
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
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}