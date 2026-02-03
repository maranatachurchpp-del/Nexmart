import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface Store {
  id: string;
  user_id: string;
  name: string;
  code: string;
  address?: string;
  city?: string;
  state?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StoreInsert {
  name: string;
  code: string;
  address?: string;
  city?: string;
  state?: string;
  is_active?: boolean;
}

export function useStores() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchStores = async () => {
    if (!user) {
      setStores([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setStores((data as Store[]) || []);
    } catch (error: any) {
      console.error('Error fetching stores:', error);
      toast({
        title: 'Erro ao carregar lojas',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createStore = async (store: StoreInsert): Promise<Store | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('stores')
        .insert({
          ...store,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      const newStore = data as Store;
      setStores((prev) => [...prev, newStore].sort((a, b) => a.name.localeCompare(b.name)));
      
      toast({
        title: 'Loja criada',
        description: `Loja "${store.name}" criada com sucesso.`,
      });

      return newStore;
    } catch (error: any) {
      console.error('Error creating store:', error);
      toast({
        title: 'Erro ao criar loja',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateStore = async (id: string, updates: Partial<StoreInsert>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('stores')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      setStores((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
      );

      toast({
        title: 'Loja atualizada',
        description: 'Alterações salvas com sucesso.',
      });

      return true;
    } catch (error: any) {
      console.error('Error updating store:', error);
      toast({
        title: 'Erro ao atualizar loja',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
  };

  const deleteStore = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('stores')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      setStores((prev) => prev.filter((s) => s.id !== id));

      toast({
        title: 'Loja removida',
        description: 'Loja removida com sucesso.',
      });

      return true;
    } catch (error: any) {
      console.error('Error deleting store:', error);
      toast({
        title: 'Erro ao remover loja',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
  };

  useEffect(() => {
    fetchStores();
  }, [user]);

  return {
    stores,
    loading,
    createStore,
    updateStore,
    deleteStore,
    refetch: fetchStores,
  };
}
