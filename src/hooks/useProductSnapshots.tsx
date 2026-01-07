import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ProductSnapshot {
  id: string;
  productId: string;
  userId: string;
  snapshotDate: string;
  margemAtual: number | null;
  quebraAtual: number | null;
  rupturaAtual: number | null;
  marcasAtuais: number | null;
  participacaoFaturamento: number | null;
  giroIdealMes: number | null;
  precoMedio: number | null;
}

export interface AggregatedSnapshot {
  date: string;
  avgMargem: number;
  avgQuebra: number;
  avgRuptura: number;
  totalFaturamento: number;
  avgPreco: number;
}

export const useProductSnapshots = () => {
  const [snapshots, setSnapshots] = useState<ProductSnapshot[]>([]);
  const [aggregatedData, setAggregatedData] = useState<AggregatedSnapshot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch snapshots for the last N days
  const fetchSnapshots = useCallback(async (days: number = 30) => {
    try {
      setIsLoading(true);
      
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const { data, error } = await supabase
        .from('product_snapshots')
        .select('*')
        .gte('snapshot_date', startDate.toISOString().split('T')[0])
        .order('snapshot_date', { ascending: true });

      if (error) throw error;

      const transformed: ProductSnapshot[] = (data || []).map(item => ({
        id: item.id,
        productId: item.product_id,
        userId: item.user_id,
        snapshotDate: item.snapshot_date,
        margemAtual: item.margem_atual,
        quebraAtual: item.quebra_atual,
        rupturaAtual: item.ruptura_atual,
        marcasAtuais: item.marcas_atuais,
        participacaoFaturamento: item.participacao_faturamento,
        giroIdealMes: item.giro_ideal_mes,
        precoMedio: item.preco_medio
      }));

      setSnapshots(transformed);
      
      // Aggregate by date
      const aggregated = aggregateByDate(transformed);
      setAggregatedData(aggregated);
      
      return transformed;
    } catch (error) {
      console.error('Error fetching snapshots:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Aggregate snapshots by date for charts
  const aggregateByDate = (data: ProductSnapshot[]): AggregatedSnapshot[] => {
    const byDate = new Map<string, ProductSnapshot[]>();
    
    data.forEach(snapshot => {
      const existing = byDate.get(snapshot.snapshotDate) || [];
      existing.push(snapshot);
      byDate.set(snapshot.snapshotDate, existing);
    });

    return Array.from(byDate.entries()).map(([date, snapshots]) => {
      const count = snapshots.length || 1;
      return {
        date,
        avgMargem: snapshots.reduce((s, p) => s + (p.margemAtual || 0), 0) / count,
        avgQuebra: snapshots.reduce((s, p) => s + (p.quebraAtual || 0), 0) / count,
        avgRuptura: snapshots.reduce((s, p) => s + (p.rupturaAtual || 0), 0) / count,
        totalFaturamento: snapshots.reduce((s, p) => s + (p.participacaoFaturamento || 0) * 1000, 0),
        avgPreco: snapshots.reduce((s, p) => s + (p.precoMedio || 0), 0) / count
      };
    });
  };

  // Get sparkline data for a specific metric (last 7 days)
  const getSparklineData = (metric: 'faturamento' | 'margem' | 'quebra' | 'ruptura', currentValue: number = 0) => {
    // If we have real data, use it
    if (aggregatedData.length >= 2) {
      const last7 = aggregatedData.slice(-7);
      return last7.map(d => ({
        value: metric === 'faturamento' ? d.totalFaturamento :
               metric === 'margem' ? d.avgMargem :
               metric === 'quebra' ? d.avgQuebra :
               d.avgRuptura
      }));
    }
    
    // Fallback to simulated data based on current value
    const seed = currentValue * 1000;
    return Array.from({ length: 7 }, (_, i) => {
      const pseudoRandom = Math.sin(seed + i) * 0.5 + 0.5;
      return {
        value: currentValue * (1 + (pseudoRandom - 0.5) * 0.2)
      };
    });
  };

  // Calculate trend (percentage change from first to last)
  const calculateTrend = (metric: 'faturamento' | 'margem' | 'quebra' | 'ruptura') => {
    if (aggregatedData.length < 2) {
      return { value: 0, isPositive: true };
    }
    
    const first = aggregatedData[0];
    const last = aggregatedData[aggregatedData.length - 1];
    
    const firstValue = metric === 'faturamento' ? first.totalFaturamento :
                       metric === 'margem' ? first.avgMargem :
                       metric === 'quebra' ? first.avgQuebra :
                       first.avgRuptura;
    
    const lastValue = metric === 'faturamento' ? last.totalFaturamento :
                      metric === 'margem' ? last.avgMargem :
                      metric === 'quebra' ? last.avgQuebra :
                      last.avgRuptura;
    
    if (firstValue === 0) return { value: 0, isPositive: true };
    
    const change = ((lastValue - firstValue) / firstValue) * 100;
    
    // For quebra and ruptura, decreasing is positive
    const isPositive = (metric === 'quebra' || metric === 'ruptura') 
      ? change < 0 
      : change > 0;
    
    return {
      value: Math.abs(change),
      isPositive
    };
  };

  useEffect(() => {
    fetchSnapshots(30);
  }, [fetchSnapshots]);

  return {
    snapshots,
    aggregatedData,
    isLoading,
    fetchSnapshots,
    getSparklineData,
    calculateTrend
  };
};
