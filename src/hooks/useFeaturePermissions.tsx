import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

export type Feature = 'dashboard' | 'products' | 'reports' | 'structure' | 'users' | 'settings';
export type Permission = 'read' | 'write' | 'delete' | 'export';

interface FeaturePermission {
  feature: string;
  can_read: boolean;
  can_write: boolean;
  can_delete: boolean;
  can_export: boolean;
}

interface UseFeaturePermissionsReturn {
  permissions: FeaturePermission[];
  loading: boolean;
  error: string | null;
  hasPermission: (feature: Feature, permission: Permission) => boolean;
  canRead: (feature: Feature) => boolean;
  canWrite: (feature: Feature) => boolean;
  canDelete: (feature: Feature) => boolean;
  canExport: (feature: Feature) => boolean;
  refreshPermissions: () => Promise<void>;
}

export const useFeaturePermissions = (): UseFeaturePermissionsReturn => {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<FeaturePermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPermissions = useCallback(async () => {
    if (!user) {
      setPermissions([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: queryError } = await supabase
        .from('feature_permissions')
        .select('feature, can_read, can_write, can_delete, can_export');

      if (queryError) throw queryError;

      setPermissions(data || []);
    } catch (err) {
      console.error('Error fetching permissions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch permissions');
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  const hasPermission = useCallback((feature: Feature, permission: Permission): boolean => {
    const featurePerms = permissions.find(p => p.feature === feature);
    if (!featurePerms) return false;
    
    switch (permission) {
      case 'read': return featurePerms.can_read;
      case 'write': return featurePerms.can_write;
      case 'delete': return featurePerms.can_delete;
      case 'export': return featurePerms.can_export;
      default: return false;
    }
  }, [permissions]);

  const canRead = useCallback((feature: Feature) => hasPermission(feature, 'read'), [hasPermission]);
  const canWrite = useCallback((feature: Feature) => hasPermission(feature, 'write'), [hasPermission]);
  const canDelete = useCallback((feature: Feature) => hasPermission(feature, 'delete'), [hasPermission]);
  const canExport = useCallback((feature: Feature) => hasPermission(feature, 'export'), [hasPermission]);

  return {
    permissions,
    loading,
    error,
    hasPermission,
    canRead,
    canWrite,
    canDelete,
    canExport,
    refreshPermissions: fetchPermissions
  };
};
