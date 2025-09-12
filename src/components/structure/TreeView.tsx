import { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/StatusBadge';
import { cn } from '@/lib/utils';

interface TreeViewProps {
  hierarchy: any[];
  onItemClick: (item: any) => void;
  onAddItem: (type: string, parent?: any) => void;
  onEditItem: (item: any) => void;
  onDeleteItem: (item: any) => void;
  selectedItem: any;
}

export const TreeView = ({
  hierarchy,
  onItemClick,
  onAddItem,
  onEditItem,
  onDeleteItem,
  selectedItem
}: TreeViewProps) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const toggleExpanded = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const renderNodeActions = (item: any, type: string) => (
    <div className="flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
      {type === 'departamento' && (
        <Button
          size="sm"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            onAddItem('categoria', item);
          }}
          className="h-6 w-6 p-0"
        >
          <Plus className="w-3 h-3" />
        </Button>
      )}
      {type === 'categoria' && (
        <Button
          size="sm"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            onAddItem('subcategoria', item);
          }}
          className="h-6 w-6 p-0"
        >
          <Plus className="w-3 h-3" />
        </Button>
      )}
      {type === 'subcategoria' && (
        <Button
          size="sm"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            onAddItem('produto', item);
          }}
          className="h-6 w-6 p-0"
        >
          <Plus className="w-3 h-3" />
        </Button>
      )}
      <Button
        size="sm"
        variant="ghost"
        onClick={(e) => {
          e.stopPropagation();
          onEditItem(item);
        }}
        className="h-6 w-6 p-0"
      >
        <Edit className="w-3 h-3" />
      </Button>
      {type === 'produto' && (
        <Button
          size="sm"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            onDeleteItem(item);
          }}
          className="h-6 w-6 p-0"
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      )}
    </div>
  );

  const getNodeStatus = (item: any) => {
    if (item.tipo === 'produto') {
      return item.status || 'success';
    }
    
    // For aggregated nodes, calculate status based on children
    let hasWarning = false;
    let hasCritical = false;
    
    if (item.produtos && item.produtos.length > 0) {
      item.produtos.forEach((produto: any) => {
        if (produto.status === 'destructive') hasCritical = true;
        if (produto.status === 'warning') hasWarning = true;
      });
    }
    
    if (item.subcategorias) {
      item.subcategorias.forEach((subcat: any) => {
        subcat.produtos.forEach((produto: any) => {
          if (produto.status === 'destructive') hasCritical = true;
          if (produto.status === 'warning') hasWarning = true;
        });
      });
    }
    
    if (item.categorias) {
      item.categorias.forEach((cat: any) => {
        cat.subcategorias.forEach((subcat: any) => {
          subcat.produtos.forEach((produto: any) => {
            if (produto.status === 'destructive') hasCritical = true;
            if (produto.status === 'warning') hasWarning = true;
          });
        });
      });
    }
    
    if (hasCritical) return 'destructive';
    if (hasWarning) return 'warning';
    return 'success';
  };

  const renderTreeNode = (item: any, level: number = 0) => {
    const nodeId = `${item.tipo}-${item.nome || item.codigo}`;
    const isExpanded = expandedNodes.has(nodeId);
    const isSelected = selectedItem && 
      ((selectedItem.nome === item.nome && selectedItem.tipo === item.tipo) ||
       (selectedItem.codigo === item.codigo));

    const hasChildren = 
      (item.categorias && item.categorias.length > 0) ||
      (item.subcategorias && item.subcategorias.length > 0) ||
      (item.produtos && item.produtos.length > 0);

    return (
      <div key={nodeId} className="select-none">
        <div
          className={cn(
            "flex items-center gap-2 p-2 rounded cursor-pointer group transition-colors",
            isSelected ? "bg-primary/10 border border-primary/20" : "hover:bg-muted/50",
            level === 0 ? "font-semibold" : "",
            level === 1 ? "ml-4" : "",
            level === 2 ? "ml-8" : "",
            level === 3 ? "ml-12" : ""
          )}
          onClick={() => onItemClick(item)}
        >
          {hasChildren ? (
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                toggleExpanded(nodeId);
              }}
              className="h-4 w-4 p-0"
            >
              {isExpanded ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </Button>
          ) : (
            <div className="w-4" />
          )}
          
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="truncate">{item.nome || item.descricao}</span>
            
            {item.classificacaoKVI === 'Alta' && (
              <Badge variant="secondary" className="text-xs">KVI</Badge>
            )}
            
            <StatusBadge
              status={getNodeStatus(item)}
              label=""
              className="w-3 h-3 rounded-full p-0"
            />
          </div>

          {renderNodeActions(item, item.tipo)}
        </div>

        {hasChildren && isExpanded && (
          <div className="ml-2">
            {item.categorias?.map((categoria: any) => renderTreeNode(categoria, level + 1))}
            {item.subcategorias?.map((subcategoria: any) => renderTreeNode(subcategoria, level + 1))}
            {item.produtos?.map((produto: any) => renderTreeNode(produto, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Estrutura Hierárquica</h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-success" />
            <span>OK</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-warning" />
            <span>Atenção</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-destructive" />
            <span>Crítico</span>
          </div>
        </div>
      </div>
      
      {hierarchy.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
          <p>Nenhum item encontrado</p>
          <Button onClick={() => onAddItem('departamento')} className="mt-2">
            Adicionar Primeiro Departamento
          </Button>
        </div>
      ) : (
        hierarchy.map((departamento) => renderTreeNode(departamento, 0))
      )}
    </div>
  );
};