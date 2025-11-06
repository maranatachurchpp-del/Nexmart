import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Produto } from '@/types/mercadologico';

export const useProducts = () => {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform database format to app format
      const transformedData: Produto[] = (data || []).map(item => ({
        codigo: item.codigo,
        descricao: item.descricao,
        departamento: item.departamento,
        categoria: item.categoria,
        subcategoria: item.subcategoria,
        quebraEsperada: item.quebra_esperada || 0,
        quebraAtual: item.quebra_atual || 0,
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
      }));

      setProdutos(transformedData);
    } catch (error: any) {
      console.error('Error fetching products:', error);
      toast({
        title: 'Erro ao carregar produtos',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();

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
          fetchProducts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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
        // Update existing
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
        // Insert new
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

  return {
    produtos,
    isLoading,
    saveProduct,
    deleteProduct,
    refreshProducts: fetchProducts
  };
};
