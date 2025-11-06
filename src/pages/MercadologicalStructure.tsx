import { useState, useMemo } from 'react';
import { Search, Plus, Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TreeView } from '@/components/structure/TreeView';
import { DetailPanel } from '@/components/structure/DetailPanel';
import { ItemEditor } from '@/components/structure/ItemEditor';
import { CSVUploadDialog } from '@/components/structure/CSVUploadDialog';
import { useProducts } from '@/hooks/useProducts';
import { Produto } from '@/types/mercadologico';

export default function MercadologicalStructure() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [showCSVUpload, setShowCSVUpload] = useState(false);
  const { produtos, isLoading, saveProduct, deleteProduct, refreshProducts } = useProducts();

  // Organize data into hierarchy
  const hierarchy = useMemo(() => {
    const filteredProdutos = searchTerm 
      ? produtos.filter(p => 
          p.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.departamento.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.subcategoria.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : produtos;

    const departamentos = new Map();
    
    filteredProdutos.forEach(produto => {
      if (!departamentos.has(produto.departamento)) {
        departamentos.set(produto.departamento, {
          nome: produto.departamento,
          tipo: 'departamento',
          categorias: new Map(),
          produtos: []
        });
      }
      
      const dept = departamentos.get(produto.departamento);
      
      if (!dept.categorias.has(produto.categoria)) {
        dept.categorias.set(produto.categoria, {
          nome: produto.categoria,
          tipo: 'categoria',
          departamento: produto.departamento,
          subcategorias: new Map(),
          produtos: []
        });
      }
      
      const cat = dept.categorias.get(produto.categoria);
      
      if (!cat.subcategorias.has(produto.subcategoria)) {
        cat.subcategorias.set(produto.subcategoria, {
          nome: produto.subcategoria,
          tipo: 'subcategoria',
          departamento: produto.departamento,
          categoria: produto.categoria,
          produtos: []
        });
      }
      
      const subcat = cat.subcategorias.get(produto.subcategoria);
      subcat.produtos.push({
        ...produto,
        tipo: 'produto'
      });
    });

      return Array.from(departamentos.values()).map((dept: any) => ({
        nome: dept.nome,
        tipo: dept.tipo,
        produtos: dept.produtos,
        categorias: Array.from(dept.categorias.values()).map((cat: any) => ({
          nome: cat.nome,
          tipo: cat.tipo,
          departamento: cat.departamento,
          produtos: cat.produtos,
          subcategorias: Array.from(cat.subcategorias.values())
        }))
      }));
  }, [produtos, searchTerm]);

  const handleAddItem = (type: string, parent?: any) => {
    const newItem = {
      tipo: type,
      nome: '',
      departamento: parent?.departamento || parent?.nome || '',
      categoria: type === 'categoria' ? '' : parent?.categoria || parent?.nome || '',
      subcategoria: type === 'subcategoria' ? '' : parent?.subcategoria || parent?.nome || '',
      ...(type === 'produto' && {
        codigo: `NEW_${Date.now()}`,
        descricao: '',
        quebraEsperada: 2,
        margemA: { min: 15, max: 20 },
        margemB: { min: 12, max: 18 },
        margemC: { min: 8, max: 15 },
        marcasMin: 2,
        marcasMax: 5,
        giroIdealMes: 30,
        participacaoFaturamento: 1,
        precoMedioReferencia: { min: 10, max: 50 },
        classificacaoKVI: 'Baixa' as const,
        margemAtual: 15,
        marcasAtuais: 2,
        quebraAtual: 1.5,
        status: 'success' as const
      })
    };
    setEditingItem(newItem);
  };

  const handleSaveItem = async (item: any) => {
    if (item.tipo === 'produto') {
      await saveProduct(item);
    }
    setEditingItem(null);
  };

  const handleDeleteItem = async (item: any) => {
    if (item.tipo === 'produto' && item.id) {
      await deleteProduct(item.id);
    }
    setSelectedItem(null);
  };

  const exportCSV = () => {
    const csvContent = [
      'Departamento,Categoria,Subcategoria,Produto,Código,Margem Atual,Quebra Atual,Marcas Atuais,Marcas Min,Marcas Max,KVI,Status',
      ...produtos.map(p => [
        p.departamento,
        p.categoria,
        p.subcategoria,
        p.descricao,
        p.codigo,
        p.margemAtual || 0,
        p.quebraAtual || 0,
        p.marcasAtuais || 0,
        p.marcasMin,
        p.marcasMax,
        p.classificacaoKVI,
        p.status
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'estrutura_mercadologica.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    const total = produtos.length;
    const success = produtos.filter(p => p.status === 'success').length;
    const warning = produtos.filter(p => p.status === 'warning').length;
    const critical = produtos.filter(p => p.status === 'destructive').length;
    
    return {
      total,
      successRate: Math.round((success / total) * 100),
      warningRate: Math.round((warning / total) * 100),
      criticalRate: Math.round((critical / total) * 100)
    };
  }, [produtos]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando produtos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Estrutura Mercadológica</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie a hierarquia e parâmetros do seu supermercado
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => handleAddItem('departamento')} className="gap-2">
              <Plus className="w-4 h-4" />
              Adicionar Departamento
            </Button>
            <Button variant="outline" onClick={exportCSV} className="gap-2">
              <Download className="w-4 h-4" />
              Exportar CSV
            </Button>
            <Button variant="outline" onClick={() => setShowCSVUpload(true)} className="gap-2">
              <Upload className="w-4 h-4" />
              Importar CSV
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="text-2xl font-bold text-foreground">{summaryStats.total}</div>
            <div className="text-sm text-muted-foreground">Total de Produtos</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-success">{summaryStats.successRate}%</div>
            <div className="text-sm text-muted-foreground">Dentro da Meta</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-warning">{summaryStats.warningRate}%</div>
            <div className="text-sm text-muted-foreground">Atenção</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-destructive">{summaryStats.criticalRate}%</div>
            <div className="text-sm text-muted-foreground">Crítico</div>
          </Card>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar por produto, categoria ou departamento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tree View */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <TreeView
                hierarchy={hierarchy}
                onItemClick={setSelectedItem}
                onAddItem={handleAddItem}
                onEditItem={setEditingItem}
                onDeleteItem={handleDeleteItem}
                selectedItem={selectedItem}
              />
            </Card>
          </div>

          {/* Detail Panel */}
          <div className="lg:col-span-1">
            <DetailPanel
              item={selectedItem}
              onEdit={setEditingItem}
              onDelete={handleDeleteItem}
            />
          </div>
        </div>
      </div>

      {/* Item Editor Modal */}
      {editingItem && (
        <ItemEditor
          item={editingItem}
          onSave={handleSaveItem}
          onCancel={() => setEditingItem(null)}
        />
      )}

      {/* CSV Upload Dialog */}
      <CSVUploadDialog
        open={showCSVUpload}
        onOpenChange={setShowCSVUpload}
        onSuccess={refreshProducts}
      />
    </div>
  );
}