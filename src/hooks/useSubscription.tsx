import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './useAuth';
import { useUserRoles } from './useUserRoles';
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
  const { isAdmin } = useUserRoles();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlans = async () => {
    // Subscription tables not yet implemented
    setPlans([]);
  };

  const fetchSubscription = async () => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    // Subscription tables not yet implemented - grant access to all authenticated users
    setSubscription(null);
    setLoading(false);
  };

  const createTrialSubscription = async () => {
    // Subscription tables not yet implemented
    return;
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

  // Grant access to all authenticated users (subscription system not yet implemented)
  const hasAccess = !!user || isAdmin;
  const isTrialing = false;
  const trialDaysLeft = 0;

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