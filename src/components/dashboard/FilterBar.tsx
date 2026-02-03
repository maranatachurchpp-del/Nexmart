import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Filter, X, Store } from 'lucide-react';
import { DashboardFilters, Produto } from '@/types/mercadologico';
import { useStores, Store as StoreType } from '@/hooks/useStores';

interface FilterBarProps {
  filters: DashboardFilters;
  onFiltersChange: (filters: DashboardFilters) => void;
  produtos?: Produto[];
}

export const FilterBar = ({ filters, onFiltersChange, produtos = [] }: FilterBarProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { stores, loading: storesLoading } = useStores();

  // Extrair departamentos únicos dos produtos
  const departamentos = useMemo(() => {
    const unique = [...new Set(produtos.map(p => p.departamento).filter(Boolean))];
    return unique.sort();
  }, [produtos]);

  // Extrair categorias baseado no departamento selecionado
  const categorias = useMemo(() => {
    const filtered = filters.departamento 
      ? produtos.filter(p => p.departamento === filters.departamento)
      : produtos;
    const unique = [...new Set(filtered.map(p => p.categoria).filter(Boolean))];
    return unique.sort();
  }, [produtos, filters.departamento]);

  // Extrair subcategorias baseado na categoria selecionada
  const subcategorias = useMemo(() => {
    const filtered = filters.categoria 
      ? produtos.filter(p => p.categoria === filters.categoria)
      : produtos;
    const unique = [...new Set(filtered.map(p => p.subcategoria).filter(Boolean))];
    return unique.sort();
  }, [produtos, filters.categoria]);

  const handleFilterChange = (key: keyof DashboardFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    
    // Limpar filtros dependentes quando o pai muda
    if (key === 'departamento') {
      newFilters.categoria = undefined;
      newFilters.subcategoria = undefined;
    } else if (key === 'categoria') {
      newFilters.subcategoria = undefined;
    }
    
    onFiltersChange(newFilters);
  };

  const handlePeriodChange = (value: string) => {
    const now = new Date();
    let inicio: Date;
    
    switch (value) {
      case '7d':
        inicio = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        inicio = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        inicio = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'ytd':
        inicio = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        inicio = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    
    onFiltersChange({
      ...filters,
      periodo: { inicio, fim: now }
    });
  };

  const getPeriodValue = () => {
    const diffDays = Math.round((filters.periodo.fim.getTime() - filters.periodo.inicio.getTime()) / (24 * 60 * 60 * 1000));
    if (diffDays <= 7) return '7d';
    if (diffDays <= 30) return '30d';
    if (diffDays <= 90) return '90d';
    return 'ytd';
  };

  const clearFilters = () => {
    onFiltersChange({
      periodo: {
        inicio: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        fim: new Date()
      },
      loja: undefined,
      departamento: undefined,
      categoria: undefined,
      subcategoria: undefined,
      kvi: 'todos'
    });
  };

  const hasActiveFilters = filters.departamento || filters.categoria || filters.subcategoria || filters.loja || filters.kvi !== 'todos';

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <Select value={getPeriodValue()} onValueChange={handlePeriodChange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">7 dias</SelectItem>
                  <SelectItem value="30d">30 dias</SelectItem>
                  <SelectItem value="90d">90 dias</SelectItem>
                  <SelectItem value="ytd">YTD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center space-x-2"
            >
              <Filter className="w-4 h-4" />
              <span>Filtros</span>
              {hasActiveFilters && (
                <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
                  {[filters.departamento, filters.categoria, filters.subcategoria, filters.loja].filter(Boolean).length}
                </span>
              )}
            </Button>
          </div>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="w-4 h-4 mr-2" />
              Limpar Filtros
            </Button>
          )}
        </div>

        {isExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 pt-4 border-t">
            {/* Loja filter */}
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                <Store className="w-3 h-3 inline mr-1" />
                Loja
              </label>
              <Select 
                value={filters.loja || '__all__'} 
                onValueChange={(value) => handleFilterChange('loja', value === '__all__' ? undefined : value)}
                disabled={storesLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={storesLoading ? "Carregando..." : "Todas"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">Todas as Lojas</SelectItem>
                  {stores.map((store) => (
                    <SelectItem key={store.id} value={store.id}>
                      {store.name} ({store.code})
                    </SelectItem>
                  ))}
                  {stores.length === 0 && !storesLoading && (
                    <SelectItem value="__none__" disabled>
                      Nenhuma loja cadastrada
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Departamento</label>
              <Select value={filters.departamento || '__all__'} onValueChange={(value) => handleFilterChange('departamento', value === '__all__' ? undefined : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">Todos</SelectItem>
                  {departamentos.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Categoria</label>
            <Select 
                value={filters.categoria || '__all__'} 
                onValueChange={(value) => handleFilterChange('categoria', value === '__all__' ? undefined : value)}
                disabled={!filters.departamento}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">Todas</SelectItem>
                  {categorias.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Subcategoria</label>
            <Select 
                value={filters.subcategoria || '__all__'} 
                onValueChange={(value) => handleFilterChange('subcategoria', value === '__all__' ? undefined : value)}
                disabled={!filters.categoria}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">Todas</SelectItem>
                  {subcategorias.map(sub => (
                    <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">KVI</label>
              <Select value={filters.kvi || 'todos'} onValueChange={(value) => handleFilterChange('kvi', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="sim">Apenas KVI</SelectItem>
                  <SelectItem value="nao">Não KVI</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};