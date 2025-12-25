import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface AlertConfiguration {
  id: string;
  user_id: string;
  alert_type: string;
  enabled: boolean;
  threshold_value: number | null;
  notification_channels: string[];
  created_at: string;
  updated_at: string;
}

export interface AlertHistoryItem {
  id: string;
  user_id: string;
  alert_type: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  actionable_insight: string | null;
  is_resolved: boolean;
  resolved_at: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

interface UseAlertConfigurationsReturn {
  configurations: AlertConfiguration[];
  history: AlertHistoryItem[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  updateConfiguration: (id: string, updates: Partial<AlertConfiguration>) => Promise<void>;
  createConfiguration: (config: Omit<AlertConfiguration, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  resolveAlert: (id: string) => Promise<void>;
  refreshConfigurations: () => Promise<void>;
  refreshHistory: () => Promise<void>;
}

const defaultAlertTypes = [
  { type: 'margin_low', name: 'Margem Baixa', threshold: 10 },
  { type: 'breakage_high', name: 'Quebra Alta', threshold: 5 },
  { type: 'stock_rupture', name: 'Ruptura de Estoque', threshold: 0 },
  { type: 'price_deviation', name: 'Desvio de Preço', threshold: 15 },
  { type: 'kvi_alert', name: 'Alerta KVI', threshold: 0 },
];

export const useAlertConfigurations = (): UseAlertConfigurationsReturn => {
  const { user } = useAuth();
  const [configurations, setConfigurations] = useState<AlertConfiguration[]>([]);
  const [history, setHistory] = useState<AlertHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConfigurations = useCallback(async () => {
    if (!user) {
      setConfigurations([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: queryError } = await supabase
        .from('alert_configurations')
        .select('*')
        .eq('user_id', user.id)
        .order('alert_type');

      if (queryError) throw queryError;

      // If no configurations exist, create defaults
      if (!data || data.length === 0) {
        const defaultConfigs = defaultAlertTypes.map(at => ({
          user_id: user.id,
          alert_type: at.type,
          enabled: true,
          threshold_value: at.threshold,
          notification_channels: ['in_app']
        }));

        const { data: insertedData, error: insertError } = await supabase
          .from('alert_configurations')
          .insert(defaultConfigs)
          .select();

        if (insertError) throw insertError;
        setConfigurations(insertedData || []);
      } else {
        setConfigurations(data);
      }
    } catch (err) {
      console.error('Error fetching alert configurations:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch configurations');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchHistory = useCallback(async () => {
    if (!user) {
      setHistory([]);
      return;
    }

    try {
      const { data, error: queryError } = await supabase
        .from('alert_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (queryError) throw queryError;
      setHistory((data as AlertHistoryItem[]) || []);
    } catch (err) {
      console.error('Error fetching alert history:', err);
    }
  }, [user]);

  useEffect(() => {
    fetchConfigurations();
    fetchHistory();
  }, [fetchConfigurations, fetchHistory]);

  const updateConfiguration = async (id: string, updates: Partial<AlertConfiguration>) => {
    try {
      setSaving(true);
      const { error: updateError } = await supabase
        .from('alert_configurations')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (updateError) throw updateError;

      setConfigurations(prev =>
        prev.map(c => c.id === id ? { ...c, ...updates } : c)
      );

      toast({
        title: 'Configuração atualizada',
        description: 'As configurações de alerta foram salvas'
      });
    } catch (err) {
      console.error('Error updating configuration:', err);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar a configuração',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const createConfiguration = async (config: Omit<AlertConfiguration, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      setSaving(true);
      const { data, error: insertError } = await supabase
        .from('alert_configurations')
        .insert({ ...config, user_id: user.id })
        .select()
        .single();

      if (insertError) throw insertError;

      setConfigurations(prev => [...prev, data]);

      toast({
        title: 'Configuração criada',
        description: 'Nova configuração de alerta adicionada'
      });
    } catch (err) {
      console.error('Error creating configuration:', err);
      toast({
        title: 'Erro',
        description: 'Não foi possível criar a configuração',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const resolveAlert = async (id: string) => {
    try {
      const { error: updateError } = await supabase
        .from('alert_history')
        .update({ is_resolved: true, resolved_at: new Date().toISOString() })
        .eq('id', id);

      if (updateError) throw updateError;

      setHistory(prev =>
        prev.map(h => h.id === id ? { ...h, is_resolved: true, resolved_at: new Date().toISOString() } : h)
      );

      toast({
        title: 'Alerta resolvido',
        description: 'O alerta foi marcado como resolvido'
      });
    } catch (err) {
      console.error('Error resolving alert:', err);
      toast({
        title: 'Erro',
        description: 'Não foi possível resolver o alerta',
        variant: 'destructive'
      });
    }
  };

  return {
    configurations,
    history,
    loading,
    saving,
    error,
    updateConfiguration,
    createConfiguration,
    resolveAlert,
    refreshConfigurations: fetchConfigurations,
    refreshHistory: fetchHistory
  };
};
