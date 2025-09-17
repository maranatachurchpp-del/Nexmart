import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

export type AppRole = 'admin' | 'user' | 'moderator';

interface UseUserRolesReturn {
  roles: AppRole[];
  hasRole: (role: AppRole) => boolean;
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
}

export const useUserRoles = (): UseUserRolesReturn => {
  const { user } = useAuth();
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserRoles = async () => {
      if (!user) {
        setRoles([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const { data, error: queryError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        if (queryError) {
          throw queryError;
        }

        const userRoles = data?.map(item => item.role as AppRole) || [];
        setRoles(userRoles);
      } catch (err) {
        console.error('Error fetching user roles:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch roles');
        setRoles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRoles();
  }, [user]);

  const hasRole = (role: AppRole): boolean => {
    return roles.includes(role);
  };

  const isAdmin = hasRole('admin');

  return {
    roles,
    hasRole,
    isAdmin,
    loading,
    error
  };
};