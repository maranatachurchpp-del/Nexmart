import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface RealtimeMetrics {
  totalProducts: number;
  averageMargin: number;
  alertCount: number;
  revenueParticipation: number;
  criticalProducts: number;
  warningProducts: number;
  successProducts: number;
  lastUpdate: Date;
}

interface ProductChange {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  product: any;
  timestamp: Date;
}

export const useRealtimeMetrics = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<RealtimeMetrics>({
    totalProducts: 0,
    averageMargin: 0,
    alertCount: 0,
    revenueParticipation: 0,
    criticalProducts: 0,
    warningProducts: 0,
    successProducts: 0,
    lastUpdate: new Date()
  });
  const [recentChanges, setRecentChanges] = useState<ProductChange[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const calculateMetrics = useCallback((products: any[]) => {
    if (!products || products.length === 0) {
      return {
        totalProducts: 0,
        averageMargin: 0,
        alertCount: 0,
        revenueParticipation: 0,
        criticalProducts: 0,
        warningProducts: 0,
        successProducts: 0,
        lastUpdate: new Date()
      };
    }

    const totalProducts = products.length;
    const margins = products.map(p => ((p.margem_a_min || 0) + (p.margem_a_max || 0)) / 2);
    const averageMargin = margins.reduce((a, b) => a + b, 0) / margins.length;
    const revenueParticipation = products.reduce((sum, p) => sum + (p.participacao_faturamento || 0), 0);
    
    const criticalProducts = products.filter(p => p.status === 'destructive').length;
    const warningProducts = products.filter(p => p.status === 'warning').length;
    const successProducts = products.filter(p => p.status === 'success').length;
    const alertCount = criticalProducts + warningProducts;

    return {
      totalProducts,
      averageMargin: Math.round(averageMargin * 10) / 10,
      alertCount,
      revenueParticipation: Math.round(revenueParticipation * 10) / 10,
      criticalProducts,
      warningProducts,
      successProducts,
      lastUpdate: new Date()
    };
  }, []);

  const fetchInitialMetrics = useCallback(async () => {
    if (!user) return;

    try {
      const { data: products, error } = await supabase
        .from('produtos')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      const calculatedMetrics = calculateMetrics(products || []);
      setMetrics(calculatedMetrics);
    } catch (error) {
      console.error('Error fetching initial metrics:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, calculateMetrics]);

  useEffect(() => {
    if (!user) return;

    fetchInitialMetrics();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('realtime-metrics')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'produtos',
          filter: `user_id=eq.${user.id}`
        },
        async (payload) => {
          console.log('Realtime update received:', payload.eventType);
          
          // Add to recent changes
          const change: ProductChange = {
            type: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
            product: payload.new || payload.old,
            timestamp: new Date()
          };
          
          setRecentChanges(prev => [change, ...prev.slice(0, 9)]);

          // Refetch metrics for accuracy
          const { data: products } = await supabase
            .from('produtos')
            .select('*')
            .eq('user_id', user.id);

          if (products) {
            const calculatedMetrics = calculateMetrics(products);
            setMetrics(calculatedMetrics);
          }
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchInitialMetrics, calculateMetrics]);

  return {
    metrics,
    recentChanges,
    isConnected,
    isLoading,
    refreshMetrics: fetchInitialMetrics
  };
};
