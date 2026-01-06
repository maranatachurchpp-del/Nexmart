import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ArrowUpDown, Download, Star, Pencil, Trash2, CheckCircle, AlertTriangle, XCircle, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Produto } from '@/types/mercadologico';
import { BulkEditDialog } from './BulkEditDialog';
import { toast } from '@/hooks/use-toast';
import { PaginationState, ProductFilters } from '@/hooks/useProducts';

interface DataTableProps {
  produtos: Produto[];
  isLoading?: boolean;
  onRowClick?: (produto: Produto) => void;
  onBulkUpdate?: (ids: string[], updates: Partial<Produto>) => Promise<void>;
  onBulkDelete?: (ids: string[]) => Promise<void>;
  // Server-side pagination props
  pagination?: PaginationState;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onFiltersChange?: (filters: ProductFilters) => void;
}

export const DataTable = ({ 
  produtos, 
  isLoading = false, 
  onRowClick,
  onBulkUpdate,
  onBulkDelete,
  pagination,
  onPageChange,
  onPageSizeChange,
  onFiltersChange
}: DataTableProps) => {
  const [sortField, setSortField] = useState<keyof Produto>('participacaoFaturamento');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchDebounce, setSearchDebounce] = useState<NodeJS.Timeout | null>(null);

  // Server-side pagination state
  const isServerPagination = !!pagination && !!onPageChange;
  const currentPage = pagination?.page || 1;
  const pageSize = pagination?.pageSize || 25;
  const totalCount = pagination?.totalCount || produtos.length;
  const totalPages = pagination?.totalPages || Math.ceil(produtos.length / pageSize);

  // Handle search with debounce
  useEffect(() => {
    if (searchDebounce) {
      clearTimeout(searchDebounce);
    }
    
    const timeout = setTimeout(() => {
      if (onFiltersChange) {
        onFiltersChange({
          search: searchTerm || undefined,
          sortField: sortField as string,
          sortDirection
        });
      }
    }, 300);
    
    setSearchDebounce(timeout);
    
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [searchTerm]);

  const handleSort = (field: keyof Produto) => {
    const newDirection = sortField === field && sortDirection === 'desc' ? 'asc' : 'desc';
    setSortField(field);
    setSortDirection(newDirection);
    
    if (onFiltersChange) {
      onFiltersChange({
        search: searchTerm || undefined,
        sortField: field as string,
        sortDirection: newDirection
      });
    }
  };

  // Client-side sorting (fallback if no server pagination)
  const sortedData = !isServerPagination ? [...produtos].sort((a, b) => {
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
  }) : produtos;

  // Client-side pagination (fallback if no server pagination)
  const displayData = !isServerPagination 
    ? sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : produtos;

  // Selection handlers
  const toggleSelectAll = () => {
    if (selectedIds.size === displayData.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(displayData.map(p => p.id!).filter(Boolean)));
    }
  };

  const toggleSelectOne = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const isAllSelected = displayData.length > 0 && selectedIds.size === displayData.length;
  const isSomeSelected = selectedIds.size > 0 && selectedIds.size < displayData.length;

  // Bulk actions
  const handleBulkStatusUpdate = async (status: 'success' | 'warning' | 'destructive') => {
    if (!onBulkUpdate || selectedIds.size === 0) return;
    
    setIsProcessing(true);
    try {
      await onBulkUpdate(Array.from(selectedIds), { status });
      setSelectedIds(new Set());
      toast({
        title: 'Status atualizado!',
        description: `${selectedIds.size} produto(s) atualizado(s) com sucesso.`,
      });
    } catch (error) {
      toast({
        title: 'Erro ao atualizar',
        description: 'Não foi possível atualizar os produtos.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkEdit = async (updates: Partial<Produto>) => {
    if (!onBulkUpdate || selectedIds.size === 0) return;
    
    setIsProcessing(true);
    try {
      await onBulkUpdate(Array.from(selectedIds), updates);
      setSelectedIds(new Set());
      setShowEditDialog(false);
      toast({
        title: 'Produtos atualizados!',
        description: `${selectedIds.size} produto(s) editado(s) com sucesso.`,
      });
    } catch (error) {
      toast({
        title: 'Erro ao editar',
        description: 'Não foi possível editar os produtos.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!onBulkDelete || selectedIds.size === 0) return;
    
    setIsProcessing(true);
    try {
      await onBulkDelete(Array.from(selectedIds));
      setSelectedIds(new Set());
      setShowDeleteDialog(false);
      toast({
        title: 'Produtos excluídos!',
        description: `${selectedIds.size} produto(s) removido(s) com sucesso.`,
      });
    } catch (error) {
      toast({
        title: 'Erro ao excluir',
        description: 'Não foi possível excluir os produtos.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

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
      'Ruptura (%)',
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
      produto.rupturaAtual?.toFixed(1) || 'N/A',
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

  // Pagination controls
  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    if (onPageChange) {
      onPageChange(page);
    }
    setSelectedIds(new Set()); // Clear selection on page change
  };

  const handlePageSizeChange = (newSize: string) => {
    const size = parseInt(newSize, 10);
    if (onPageSizeChange) {
      onPageSizeChange(size);
    }
    setSelectedIds(new Set());
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    pages.push(1);
    
    if (currentPage > 3) {
      pages.push('...');
    }
    
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    
    for (let i = start; i <= end; i++) {
      if (!pages.includes(i)) {
        pages.push(i);
      }
    }
    
    if (currentPage < totalPages - 2) {
      pages.push('...');
    }
    
    if (!pages.includes(totalPages)) {
      pages.push(totalPages);
    }
    
    return pages;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="text-lg">Tabela Analítica</CardTitle>
              <p className="text-sm text-muted-foreground">
                {totalCount.toLocaleString('pt-BR')} produtos • Clique nas linhas para drill-down
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Search input */}
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-48"
                />
              </div>
              
              {selectedIds.size > 0 && (
                <>
                  <span className="text-sm text-muted-foreground">
                    {selectedIds.size} selecionado(s)
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleBulkStatusUpdate('success')}
                    disabled={isProcessing || !onBulkUpdate}
                  >
                    <CheckCircle className="w-4 h-4 mr-1 text-green-600" />
                    OK
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleBulkStatusUpdate('warning')}
                    disabled={isProcessing || !onBulkUpdate}
                  >
                    <AlertTriangle className="w-4 h-4 mr-1 text-yellow-600" />
                    Atenção
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleBulkStatusUpdate('destructive')}
                    disabled={isProcessing || !onBulkUpdate}
                  >
                    <XCircle className="w-4 h-4 mr-1 text-red-600" />
                    Crítico
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowEditDialog(true)}
                    disabled={isProcessing || !onBulkUpdate}
                  >
                    <Pencil className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => setShowDeleteDialog(true)}
                    disabled={isProcessing || !onBulkDelete}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Excluir
                  </Button>
                </>
              )}
              <Button variant="outline" size="sm" onClick={exportCSV} disabled={produtos.length === 0}>
                <Download className="w-4 h-4 mr-2" />
                Exportar CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={toggleSelectAll}
                      aria-label="Selecionar todos"
                      className={isSomeSelected ? 'opacity-50' : ''}
                    />
                  </TableHead>
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
                  <TableHead className="text-right">
                    <Button variant="ghost" onClick={() => handleSort('rupturaAtual')} className="p-0 h-auto font-medium">
                      Ruptura (%) <ArrowUpDown className="w-4 h-4 ml-1" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">
                    <Button variant="ghost" onClick={() => handleSort('quebraAtual')} className="p-0 h-auto font-medium">
                      Quebra (%) <ArrowUpDown className="w-4 h-4 ml-1" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">Marcas</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayData.map((produto) => (
                  <TableRow 
                    key={produto.id || produto.codigo}
                    className="cursor-pointer hover:bg-muted/50"
                    data-selected={selectedIds.has(produto.id!)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedIds.has(produto.id!)}
                        onCheckedChange={() => produto.id && toggleSelectOne(produto.id)}
                        aria-label={`Selecionar ${produto.descricao}`}
                      />
                    </TableCell>
                    <TableCell onClick={() => onRowClick?.(produto)}>
                      {produto.classificacaoKVI === 'Alta' && (
                        <Star className="w-4 h-4 text-warning fill-warning" />
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-sm" onClick={() => onRowClick?.(produto)}>
                      {produto.codigo}
                    </TableCell>
                    <TableCell className="font-medium" onClick={() => onRowClick?.(produto)}>
                      {produto.descricao}
                    </TableCell>
                    <TableCell onClick={() => onRowClick?.(produto)}>{produto.departamento}</TableCell>
                    <TableCell onClick={() => onRowClick?.(produto)}>
                      <Badge variant={produto.classificacaoKVI === 'Alta' ? 'default' : 'outline'}>
                        {produto.classificacaoKVI}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right" onClick={() => onRowClick?.(produto)}>
                      {produto.participacaoFaturamento.toFixed(1)}%
                    </TableCell>
                    <TableCell className="text-right" onClick={() => onRowClick?.(produto)}>
                      {produto.margemAtual ? `${produto.margemAtual.toFixed(1)}%` : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right" onClick={() => onRowClick?.(produto)}>
                      {produto.rupturaAtual ? `${produto.rupturaAtual.toFixed(1)}%` : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right" onClick={() => onRowClick?.(produto)}>
                      {produto.quebraAtual ? `${produto.quebraAtual.toFixed(1)}%` : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right" onClick={() => onRowClick?.(produto)}>
                      {produto.marcasAtuais || 'N/A'} / {produto.marcasMin}-{produto.marcasMax}
                    </TableCell>
                    <TableCell onClick={() => onRowClick?.(produto)}>
                      <Badge variant={getStatusBadge(produto.status)}>
                        {getStatusText(produto.status)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Enhanced Pagination */}
          <div className="flex items-center justify-between flex-wrap gap-4 py-4">
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                Mostrando {((currentPage - 1) * pageSize) + 1} a{' '}
                {Math.min(currentPage * pageSize, totalCount)} de {totalCount.toLocaleString('pt-BR')} produtos
              </div>
              
              {/* Page size selector */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Itens por página:</span>
                <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                  <SelectTrigger className="w-20 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Page navigation */}
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(1)}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              {/* Page numbers */}
              <div className="flex items-center gap-1">
                {getPageNumbers().map((page, index) => (
                  typeof page === 'number' ? (
                    <Button
                      key={index}
                      variant={page === currentPage ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => goToPage(page)}
                      className="h-8 w-8 p-0"
                    >
                      {page}
                    </Button>
                  ) : (
                    <span key={index} className="px-2 text-muted-foreground">...</span>
                  )
                ))}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(totalPages)}
                disabled={currentPage === totalPages}
                className="h-8 w-8 p-0"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Edit Dialog */}
      <BulkEditDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        selectedCount={selectedIds.size}
        onConfirm={handleBulkEdit}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir {selectedIds.size} produto(s)? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
