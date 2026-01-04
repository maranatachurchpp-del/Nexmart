import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { useUserRoles } from './useUserRoles';
import { supabase } from '@/integrations/supabase/client';

export interface AuditLog {
  id: string;
  user_id: string | null;
  user_email: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  old_values: Record<string, any> | null;
  new_values: Record<string, any> | null;
  ip_address: string | null;
  user_agent: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

interface UseAuditLogsReturn {
  logs: AuditLog[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  fetchLogs: (options?: FetchLogsOptions) => Promise<void>;
  createLog: (action: string, entityType: string, entityId?: string, metadata?: Record<string, any>) => Promise<void>;
}

interface FetchLogsOptions {
  action?: string;
  entityType?: string;
  entityId?: string;
  limit?: number;
  offset?: number;
}

export const useAuditLogs = (): UseAuditLogsReturn => {
  const { user } = useAuth();
  const { isAdmin } = useUserRoles();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const fetchLogs = useCallback(async (options: FetchLogsOptions = {}) => {
    if (!user) {
      setLogs([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('audit_logs')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .limit(options.limit || 100);

      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 100) - 1);
      }

      if (options.action) {
        query = query.eq('action', options.action);
      }

      if (options.entityType) {
        query = query.eq('entity_type', options.entityType);
      }

      if (options.entityId) {
        query = query.eq('entity_id', options.entityId);
      }

      const { data, error: queryError, count } = await query;

      if (queryError) throw queryError;

      setLogs((data as AuditLog[]) || []);
      setTotalCount(count || 0);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch audit logs');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [user, isAdmin]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const createLog = useCallback(async (
    action: string,
    entityType: string,
    entityId?: string,
    metadata?: Record<string, any>
  ) => {
    if (!user) return;

    try {
      // Note: _user_id is no longer needed as the function uses auth.uid() internally
      const { error } = await supabase.rpc('create_audit_log', {
        _action: action,
        _entity_type: entityType,
        _entity_id: entityId || null,
        _old_values: null,
        _new_values: null,
        _metadata: metadata || {}
      });

      if (error) throw error;
    } catch (err) {
      console.error('Error creating audit log:', err);
    }
  }, [user]);

  return {
    logs,
    loading,
    error,
    totalCount,
    fetchLogs,
    createLog
  };
};
