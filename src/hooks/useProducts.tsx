import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Produto } from '@/types/mercadologico';

export interface PaginationState {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface ProductFilters {
  departamento?: string;
  categoria?: string;
  subcategoria?: string;
  kvi?: 'todos' | 'sim' | 'nao';
  search?: string;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
}

const transformProduct = (item: any): Produto => ({
  codigo: item.codigo,
  descricao: item.descricao,
  departamento: item.departamento,
  categoria: item.categoria,
  subcategoria: item.subcategoria,
  quebraEsperada: item.quebra_esperada || 0,
  quebraAtual: item.quebra_atual || 0,
  rupturaEsperada: item.ruptura_esperada || 0,
  rupturaAtual: item.ruptura_atual || 0,
  margemA: {
    min: item.margem_a_min || 0,
    max: item.margem_a_max || 0
  },
  margemAtual: ((item.margem_a_min || 0) + (item.margem_a_max || 0)) / 2,
  marcasMin: item.marcas_min || 0,
  marcasMax: item.marcas_max || 0,
  marcasAtuais: item.marcas_atuais || 0,
  giroIdealMes: item.giro_ideal_mes || 0,
  participacaoFaturamento: item.participacao_faturamento || 0,
  precoMedioReferencia: {
    min: item.preco_medio_min || 0,
    max: item.preco_medio_max || 0
  },
  classificacaoKVI: item.classificacao_kvi || 'Média',
  status: item.status || 'success',
  id: item.id
});

export const useProducts = (initialFilters?: ProductFilters) => {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [allProdutos, setAllProdutos] = useState<Produto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentFilters, setCurrentFilters] = useState<ProductFilters | undefined>(initialFilters);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize: 25,
    totalCount: 0,
    totalPages: 0
  });

  // Fetch all products for KPIs and charts (without pagination)
  const fetchAllProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10000);

      if (error) throw error;
      
      const transformed = (data || []).map(transformProduct);
      setAllProdutos(transformed);
      return transformed;
    } catch (error: any) {
      console.error('Error fetching all products:', error);
      return [];
    }
  };

  // Fetch paginated products for DataTable
  const fetchPaginatedProducts = useCallback(async (
    page: number = 1,
    pageSize: number = 25,
    filters?: ProductFilters
  ) => {
    try {
      setIsLoading(true);
      
      let query = supabase
        .from('produtos')
        .select('*', { count: 'exact' });

      // Apply filters
      if (filters?.departamento) {
        query = query.eq('departamento', filters.departamento);
      }
      if (filters?.categoria) {
        query = query.eq('categoria', filters.categoria);
      }
      if (filters?.subcategoria) {
        query = query.eq('subcategoria', filters.subcategoria);
      }
      if (filters?.kvi === 'sim') {
        query = query.eq('classificacao_kvi', 'Alta');
      } else if (filters?.kvi === 'nao') {
        query = query.neq('classificacao_kvi', 'Alta');
      }
      if (filters?.search) {
        query = query.or(`descricao.ilike.%${filters.search}%,codigo.ilike.%${filters.search}%`);
      }

      // Apply sorting
      const sortField = filters?.sortField || 'created_at';
      const sortDirection = filters?.sortDirection || 'desc';
      const dbField = sortField === 'participacaoFaturamento' ? 'participacao_faturamento' :
                      sortField === 'margemAtual' ? 'margem_a_max' :
                      sortField === 'quebraAtual' ? 'quebra_atual' :
                      sortField === 'rupturaAtual' ? 'ruptura_atual' :
                      sortField === 'descricao' ? 'descricao' :
                      sortField === 'codigo' ? 'codigo' :
                      sortField === 'departamento' ? 'departamento' :
                      'created_at';
      
      query = query.order(dbField, { ascending: sortDirection === 'asc' });

      // Apply pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      const transformedData = (data || []).map(transformProduct);
      const totalCount = count || 0;
      const totalPages = Math.ceil(totalCount / pageSize);

      setProdutos(transformedData);
      setPagination({
        page,
        pageSize,
        totalCount,
        totalPages
      });

      return { data: transformedData, totalCount, totalPages };
    } catch (error: any) {
      console.error('Error fetching paginated products:', error);
      toast({
        title: 'Erro ao carregar produtos',
        description: error.message,
        variant: 'destructive',
      });
      return { data: [], totalCount: 0, totalPages: 0 };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load - apply saved filters
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchAllProducts(),
        fetchPaginatedProducts(1, pagination.pageSize, initialFilters)
      ]);
    };
    
    loadData();

    // Setup realtime subscription
    const channel = supabase
      .channel('produtos-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'produtos'
        },
        () => {
          fetchAllProducts();
          fetchPaginatedProducts(pagination.page, pagination.pageSize, currentFilters);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const setPage = (page: number) => {
    fetchPaginatedProducts(page, pagination.pageSize, currentFilters);
  };

  const setPageSize = (pageSize: number) => {
    fetchPaginatedProducts(1, pageSize, currentFilters);
  };

  // Update current filters when fetching
  const fetchWithFilters = useCallback(async (
    page: number = 1,
    pageSize: number = 25,
    filters?: ProductFilters
  ) => {
    setCurrentFilters(filters);
    return fetchPaginatedProducts(page, pageSize, filters);
  }, [fetchPaginatedProducts]);

  const saveProduct = async (produto: Produto) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const productData = {
        user_id: user.id,
        codigo: produto.codigo,
        descricao: produto.descricao,
        departamento: produto.departamento,
        categoria: produto.categoria,
        subcategoria: produto.subcategoria,
        quebra_esperada: produto.quebraEsperada || 0,
        quebra_atual: produto.quebraAtual || 0,
        ruptura_esperada: produto.rupturaEsperada || 0,
        ruptura_atual: produto.rupturaAtual || 0,
        margem_a_min: produto.margemA?.min || 0,
        margem_a_max: produto.margemA?.max || 0,
        marcas_min: produto.marcasMin || 0,
        marcas_max: produto.marcasMax || 0,
        marcas_atuais: produto.marcasAtuais || 0,
        giro_ideal_mes: produto.giroIdealMes || 0,
        participacao_faturamento: produto.participacaoFaturamento || 0,
        preco_medio_min: produto.precoMedioReferencia?.min || 0,
        preco_medio_max: produto.precoMedioReferencia?.max || 0,
        classificacao_kvi: produto.classificacaoKVI || 'Média',
        status: produto.status || 'success'
      };

      if (produto.id) {
        const { error } = await supabase
          .from('produtos')
          .update(productData)
          .eq('id', produto.id);

        if (error) throw error;

        toast({
          title: 'Produto atualizado!',
          description: 'As alterações foram salvas com sucesso.',
        });
      } else {
        const { error } = await supabase
          .from('produtos')
          .insert([productData]);

        if (error) throw error;

        toast({
          title: 'Produto criado!',
          description: 'O novo produto foi adicionado com sucesso.',
        });
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error saving product:', error);
      toast({
        title: 'Erro ao salvar produto',
        description: error.message,
        variant: 'destructive',
      });
      return { success: false, error: error.message };
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      const { error } = await supabase
        .from('produtos')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      toast({
        title: 'Produto excluído!',
        description: 'O produto foi removido com sucesso.',
      });

      return { success: true };
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast({
        title: 'Erro ao excluir produto',
        description: error.message,
        variant: 'destructive',
      });
      return { success: false, error: error.message };
    }
  };

  const bulkUpdateProducts = async (ids: string[], updates: Partial<Produto>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const updateData: Record<string, unknown> = {};
      
      if (updates.status) updateData.status = updates.status;
      if (updates.classificacaoKVI) updateData.classificacao_kvi = updates.classificacaoKVI;
      if (updates.margemA) {
        updateData.margem_a_min = updates.margemA.min;
        updateData.margem_a_max = updates.margemA.max;
      }
      if (updates.quebraEsperada !== undefined) updateData.quebra_esperada = updates.quebraEsperada;
      if (updates.rupturaEsperada !== undefined) updateData.ruptura_esperada = updates.rupturaEsperada;

      const { error } = await supabase
        .from('produtos')
        .update(updateData)
        .in('id', ids);

      if (error) throw error;
    } catch (error: any) {
      console.error('Error bulk updating products:', error);
      throw error;
    }
  };

  const bulkDeleteProducts = async (ids: string[]) => {
    try {
      const { error } = await supabase
        .from('produtos')
        .delete()
        .in('id', ids);

      if (error) throw error;
    } catch (error: any) {
      console.error('Error bulk deleting products:', error);
      throw error;
    }
  };

  return {
    produtos,
    allProdutos,
    isLoading,
    pagination,
    setPage,
    setPageSize,
    fetchPaginatedProducts: fetchWithFilters,
    saveProduct,
    deleteProduct,
    bulkUpdateProducts,
    bulkDeleteProducts,
    refreshProducts: () => {
      fetchAllProducts();
      fetchPaginatedProducts(pagination.page, pagination.pageSize, currentFilters);
    }
  };
};
