import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Filter, X } from 'lucide-react';
import { DashboardFilters } from '@/types/mercadologico';
import { departamentosSummary, categoriasSummary } from '@/data/mercadologico-data';

interface FilterBarProps {
  filters: DashboardFilters;
  onFiltersChange: (filters: DashboardFilters) => void;
}

export const FilterBar = ({ filters, onFiltersChange }: FilterBarProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (key: keyof DashboardFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
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

  const availableCategories = filters.departamento 
    ? categoriasSummary.filter(cat => cat.departamento === filters.departamento)
    : categoriasSummary;

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <Select defaultValue="30d">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 pt-4 border-t">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Loja</label>
              <Select value={filters.loja || ''} onValueChange={(value) => handleFilterChange('loja', value || undefined)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as lojas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as lojas</SelectItem>
                  <SelectItem value="loja1">Loja Centro</SelectItem>
                  <SelectItem value="loja2">Loja Bairro</SelectItem>
                  <SelectItem value="loja3">Loja Shopping</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Departamento</label>
              <Select value={filters.departamento || ''} onValueChange={(value) => handleFilterChange('departamento', value || undefined)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  {departamentosSummary.map(dept => (
                    <SelectItem key={dept.codigo} value={dept.nome}>{dept.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Categoria</label>
              <Select 
                value={filters.categoria || ''} 
                onValueChange={(value) => handleFilterChange('categoria', value || undefined)}
                disabled={!filters.departamento}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas</SelectItem>
                  {availableCategories.map(cat => (
                    <SelectItem key={cat.codigo} value={cat.nome}>{cat.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Subcategoria</label>
              <Select 
                value={filters.subcategoria || ''} 
                onValueChange={(value) => handleFilterChange('subcategoria', value || undefined)}
                disabled={!filters.categoria}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas</SelectItem>
                  <SelectItem value="sub1">Açúcar Cristal</SelectItem>
                  <SelectItem value="sub2">Chocolate em Pó</SelectItem>
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