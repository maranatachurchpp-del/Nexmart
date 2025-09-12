import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowUpDown, Download, Star } from 'lucide-react';
import { produtosSample } from '@/data/mercadologico-data';
import { Produto } from '@/types/mercadologico';

interface DataTableProps {
  onRowClick?: (produto: Produto) => void;
}

export const DataTable = ({ onRowClick }: DataTableProps) => {
  const [sortField, setSortField] = useState<keyof Produto>('participacaoFaturamento');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleSort = (field: keyof Produto) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedData = [...produtosSample].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue) 
        : bValue.localeCompare(aValue);
    }
    
    return 0;
  });

  const paginatedData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  const getStatusBadge = (status: string) => {
    const variants = {
      'success': 'default',
      'warning': 'secondary',
      'destructive': 'destructive'
    } as const;
    
    return variants[status as keyof typeof variants] || 'outline';
  };

  const getStatusText = (status: string) => {
    const texts = {
      'success': 'OK',
      'warning': 'Atenção',
      'destructive': 'Crítico'
    };
    
    return texts[status as keyof typeof texts] || 'N/A';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value);
  };

  const exportCSV = () => {
    const headers = [
      'Código',
      'Produto',
      'Departamento',
      'Categoria',
      'Subcategoria',
      'KVI',
      'Receita (%)',
      'Margem Atual (%)',
      'Meta Margem (%)',
      'Quebra (%)',
      'Marcas Atual',
      'Marcas Recomendado',
      'Status'
    ];

    const csvData = sortedData.map(produto => [
      produto.codigo,
      produto.descricao,
      produto.departamento,
      produto.categoria,
      produto.subcategoria,
      produto.classificacaoKVI,
      produto.participacaoFaturamento.toFixed(1),
      produto.margemAtual?.toFixed(1) || 'N/A',
      produto.margemA.min.toFixed(1),
      produto.quebraAtual?.toFixed(1) || 'N/A',
      produto.marcasAtuais || 'N/A',
      `${produto.marcasMin}-${produto.marcasMax}`,
      getStatusText(produto.status)
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'dashboard-mercadologico.csv';
    link.click();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Tabela Analítica</CardTitle>
            <p className="text-sm text-muted-foreground">
              {sortedData.length} produtos • Clique nas linhas para drill-down
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('codigo')} className="p-0 h-auto font-medium">
                    Código <ArrowUpDown className="w-4 h-4 ml-1" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('descricao')} className="p-0 h-auto font-medium">
                    Produto <ArrowUpDown className="w-4 h-4 ml-1" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('departamento')} className="p-0 h-auto font-medium">
                    Departamento <ArrowUpDown className="w-4 h-4 ml-1" />
                  </Button>
                </TableHead>
                <TableHead>KVI</TableHead>
                <TableHead className="text-right">
                  <Button variant="ghost" onClick={() => handleSort('participacaoFaturamento')} className="p-0 h-auto font-medium">
                    Receita (%) <ArrowUpDown className="w-4 h-4 ml-1" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  <Button variant="ghost" onClick={() => handleSort('margemAtual')} className="p-0 h-auto font-medium">
                    Margem (%) <ArrowUpDown className="w-4 h-4 ml-1" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">Quebra (%)</TableHead>
                <TableHead className="text-right">Marcas</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((produto) => (
                <TableRow 
                  key={produto.codigo}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onRowClick?.(produto)}
                >
                  <TableCell>
                    {produto.classificacaoKVI === 'Alta' && (
                      <Star className="w-4 h-4 text-warning fill-warning" />
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-sm">{produto.codigo}</TableCell>
                  <TableCell className="font-medium">{produto.descricao}</TableCell>
                  <TableCell>{produto.departamento}</TableCell>
                  <TableCell>
                    <Badge variant={produto.classificacaoKVI === 'Alta' ? 'default' : 'outline'}>
                      {produto.classificacaoKVI}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{produto.participacaoFaturamento.toFixed(1)}%</TableCell>
                  <TableCell className="text-right">
                    {produto.margemAtual ? `${produto.margemAtual.toFixed(1)}%` : 'N/A'}
                  </TableCell>
                  <TableCell className="text-right">
                    {produto.quebraAtual ? `${produto.quebraAtual.toFixed(1)}%` : 'N/A'}
                  </TableCell>
                  <TableCell className="text-right">
                    {produto.marcasAtuais || 'N/A'} / {produto.marcasMin}-{produto.marcasMax}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadge(produto.status)}>
                      {getStatusText(produto.status)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="text-sm text-muted-foreground">
            Mostrando {(currentPage - 1) * itemsPerPage + 1} a{' '}
            {Math.min(currentPage * itemsPerPage, sortedData.length)} de {sortedData.length} produtos
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Próxima
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};