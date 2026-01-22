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
        (payload) => {
          // Add to recent changes
          const change: ProductChange = {
            type: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
            product: payload.new || payload.old,
            timestamp: new Date()
          };
          
          setRecentChanges(prev => [change, ...prev.slice(0, 9)]);

          // Incremental update instead of full refetch
          setMetrics(prevMetrics => {
            const newProduct = payload.new as any;
            const oldProduct = payload.old as any;
            
            if (payload.eventType === 'INSERT' && newProduct) {
              const newMargin = ((newProduct.margem_a_min || 0) + (newProduct.margem_a_max || 0)) / 2;
              const newTotal = prevMetrics.totalProducts + 1;
              const newAvgMargin = ((prevMetrics.averageMargin * prevMetrics.totalProducts) + newMargin) / newTotal;
              
              return {
                ...prevMetrics,
                totalProducts: newTotal,
                averageMargin: Math.round(newAvgMargin * 10) / 10,
                revenueParticipation: Math.round((prevMetrics.revenueParticipation + (newProduct.participacao_faturamento || 0)) * 10) / 10,
                criticalProducts: prevMetrics.criticalProducts + (newProduct.status === 'destructive' ? 1 : 0),
                warningProducts: prevMetrics.warningProducts + (newProduct.status === 'warning' ? 1 : 0),
                successProducts: prevMetrics.successProducts + (newProduct.status === 'success' ? 1 : 0),
                alertCount: prevMetrics.alertCount + (newProduct.status === 'destructive' || newProduct.status === 'warning' ? 1 : 0),
                lastUpdate: new Date()
              };
            }
            
            if (payload.eventType === 'DELETE' && oldProduct) {
              const oldMargin = ((oldProduct.margem_a_min || 0) + (oldProduct.margem_a_max || 0)) / 2;
              const newTotal = Math.max(0, prevMetrics.totalProducts - 1);
              const newAvgMargin = newTotal > 0 
                ? ((prevMetrics.averageMargin * prevMetrics.totalProducts) - oldMargin) / newTotal 
                : 0;
              
              return {
                ...prevMetrics,
                totalProducts: newTotal,
                averageMargin: Math.round(newAvgMargin * 10) / 10,
                revenueParticipation: Math.round(Math.max(0, prevMetrics.revenueParticipation - (oldProduct.participacao_faturamento || 0)) * 10) / 10,
                criticalProducts: Math.max(0, prevMetrics.criticalProducts - (oldProduct.status === 'destructive' ? 1 : 0)),
                warningProducts: Math.max(0, prevMetrics.warningProducts - (oldProduct.status === 'warning' ? 1 : 0)),
                successProducts: Math.max(0, prevMetrics.successProducts - (oldProduct.status === 'success' ? 1 : 0)),
                alertCount: Math.max(0, prevMetrics.alertCount - (oldProduct.status === 'destructive' || oldProduct.status === 'warning' ? 1 : 0)),
                lastUpdate: new Date()
              };
            }
            
            if (payload.eventType === 'UPDATE' && newProduct && oldProduct) {
              // For updates, adjust counts based on status changes
              const oldStatus = oldProduct.status;
              const newStatus = newProduct.status;
              
              let criticalDelta = 0, warningDelta = 0, successDelta = 0;
              
              if (oldStatus !== newStatus) {
                if (oldStatus === 'destructive') criticalDelta--;
                if (oldStatus === 'warning') warningDelta--;
                if (oldStatus === 'success') successDelta--;
                
                if (newStatus === 'destructive') criticalDelta++;
                if (newStatus === 'warning') warningDelta++;
                if (newStatus === 'success') successDelta++;
              }
              
              // Recalculate margin
              const oldMargin = ((oldProduct.margem_a_min || 0) + (oldProduct.margem_a_max || 0)) / 2;
              const newMargin = ((newProduct.margem_a_min || 0) + (newProduct.margem_a_max || 0)) / 2;
              const totalMargin = (prevMetrics.averageMargin * prevMetrics.totalProducts) - oldMargin + newMargin;
              const newAvgMargin = prevMetrics.totalProducts > 0 ? totalMargin / prevMetrics.totalProducts : 0;
              
              return {
                ...prevMetrics,
                averageMargin: Math.round(newAvgMargin * 10) / 10,
                revenueParticipation: Math.round((prevMetrics.revenueParticipation - (oldProduct.participacao_faturamento || 0) + (newProduct.participacao_faturamento || 0)) * 10) / 10,
                criticalProducts: prevMetrics.criticalProducts + criticalDelta,
                warningProducts: prevMetrics.warningProducts + warningDelta,
                successProducts: prevMetrics.successProducts + successDelta,
                alertCount: prevMetrics.criticalProducts + criticalDelta + prevMetrics.warningProducts + warningDelta,
                lastUpdate: new Date()
              };
            }
            
            return { ...prevMetrics, lastUpdate: new Date() };
          });
        }
      )
      .subscribe((status) => {
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
