import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface ScheduledReport {
  id: string;
  user_id: string;
  name: string;
  report_type: 'pdf' | 'excel' | 'both';
  frequency: 'daily' | 'weekly' | 'monthly';
  day_of_week: number | null;
  day_of_month: number | null;
  time_of_day: string;
  recipients: string[];
  filters: Record<string, any>;
  is_active: boolean;
  last_run_at: string | null;
  next_run_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReportHistory {
  id: string;
  scheduled_report_id: string;
  user_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  report_type: string;
  file_url: string | null;
  error_message: string | null;
  recipients_notified: string[] | null;
  created_at: string;
  completed_at: string | null;
}

interface UseScheduledReportsReturn {
  reports: ScheduledReport[];
  history: ReportHistory[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  createReport: (report: Omit<ScheduledReport, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'last_run_at' | 'next_run_at'>) => Promise<void>;
  updateReport: (id: string, updates: Partial<ScheduledReport>) => Promise<void>;
  deleteReport: (id: string) => Promise<void>;
  toggleActive: (id: string) => Promise<void>;
  refreshReports: () => Promise<void>;
  refreshHistory: (reportId?: string) => Promise<void>;
}

export const useScheduledReports = (): UseScheduledReportsReturn => {
  const { user } = useAuth();
  const [reports, setReports] = useState<ScheduledReport[]>([]);
  const [history, setHistory] = useState<ReportHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateNextRun = (frequency: string, dayOfWeek?: number | null, dayOfMonth?: number | null, timeOfDay?: string): string => {
    const now = new Date();
    const [hours, minutes] = (timeOfDay || '08:00').split(':').map(Number);
    
    let nextRun = new Date(now);
    nextRun.setHours(hours, minutes, 0, 0);

    if (nextRun <= now) {
      switch (frequency) {
        case 'daily':
          nextRun.setDate(nextRun.getDate() + 1);
          break;
        case 'weekly':
          nextRun.setDate(nextRun.getDate() + 7);
          break;
        case 'monthly':
          nextRun.setMonth(nextRun.getMonth() + 1);
          break;
      }
    }

    return nextRun.toISOString();
  };

  const fetchReports = useCallback(async () => {
    if (!user) {
      setReports([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: queryError } = await supabase
        .from('scheduled_reports')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (queryError) throw queryError;
      setReports((data as ScheduledReport[]) || []);
    } catch (err) {
      console.error('Error fetching scheduled reports:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchHistory = useCallback(async (reportId?: string) => {
    if (!user) {
      setHistory([]);
      return;
    }

    try {
      let query = supabase
        .from('report_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (reportId) {
        query = query.eq('scheduled_report_id', reportId);
      }

      const { data, error: queryError } = await query;

      if (queryError) throw queryError;
      setHistory((data as ReportHistory[]) || []);
    } catch (err) {
      console.error('Error fetching report history:', err);
    }
  }, [user]);

  useEffect(() => {
    fetchReports();
    fetchHistory();
  }, [fetchReports, fetchHistory]);

  const createReport = async (report: Omit<ScheduledReport, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'last_run_at' | 'next_run_at'>) => {
    if (!user) return;

    try {
      setSaving(true);
      const nextRun = calculateNextRun(report.frequency, report.day_of_week, report.day_of_month, report.time_of_day);

      const { data, error: insertError } = await supabase
        .from('scheduled_reports')
        .insert({ 
          ...report, 
          user_id: user.id,
          next_run_at: nextRun
        })
        .select()
        .single();

      if (insertError) throw insertError;

      setReports(prev => [data as ScheduledReport, ...prev]);

      toast({
        title: 'Relatório agendado',
        description: 'O relatório foi configurado com sucesso'
      });
    } catch (err) {
      console.error('Error creating scheduled report:', err);
      toast({
        title: 'Erro',
        description: 'Não foi possível agendar o relatório',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const updateReport = async (id: string, updates: Partial<ScheduledReport>) => {
    try {
      setSaving(true);
      
      let nextRun: string | undefined;
      if (updates.frequency || updates.day_of_week !== undefined || updates.day_of_month !== undefined || updates.time_of_day) {
        const report = reports.find(r => r.id === id);
        if (report) {
          nextRun = calculateNextRun(
            updates.frequency || report.frequency,
            updates.day_of_week !== undefined ? updates.day_of_week : report.day_of_week,
            updates.day_of_month !== undefined ? updates.day_of_month : report.day_of_month,
            updates.time_of_day || report.time_of_day
          );
        }
      }

      const { error: updateError } = await supabase
        .from('scheduled_reports')
        .update({ 
          ...updates, 
          updated_at: new Date().toISOString(),
          ...(nextRun && { next_run_at: nextRun })
        })
        .eq('id', id);

      if (updateError) throw updateError;

      setReports(prev =>
        prev.map(r => r.id === id ? { ...r, ...updates, ...(nextRun && { next_run_at: nextRun }) } : r)
      );

      toast({
        title: 'Relatório atualizado',
        description: 'As configurações foram salvas'
      });
    } catch (err) {
      console.error('Error updating report:', err);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o relatório',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteReport = async (id: string) => {
    try {
      setSaving(true);
      const { error: deleteError } = await supabase
        .from('scheduled_reports')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setReports(prev => prev.filter(r => r.id !== id));

      toast({
        title: 'Relatório excluído',
        description: 'O agendamento foi removido'
      });
    } catch (err) {
      console.error('Error deleting report:', err);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o relatório',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (id: string) => {
    const report = reports.find(r => r.id === id);
    if (!report) return;

    await updateReport(id, { is_active: !report.is_active });
  };

  return {
    reports,
    history,
    loading,
    saving,
    error,
    createReport,
    updateReport,
    deleteReport,
    toggleActive,
    refreshReports: fetchReports,
    refreshHistory: fetchHistory
  };
};
