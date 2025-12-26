import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Activity, Plus, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductChange {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  product: any;
  timestamp: Date;
}

interface RecentChangesPanelProps {
  changes: ProductChange[];
}

export const RecentChangesPanel = ({ changes }: RecentChangesPanelProps) => {
  const getChangeIcon = (type: string) => {
    switch (type) {
      case 'INSERT':
        return <Plus className="h-4 w-4 text-success" />;
      case 'UPDATE':
        return <Pencil className="h-4 w-4 text-warning" />;
      case 'DELETE':
        return <Trash2 className="h-4 w-4 text-destructive" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getChangeBadge = (type: string) => {
    switch (type) {
      case 'INSERT':
        return <Badge variant="outline" className="bg-success/10 text-success border-success/20">Novo</Badge>;
      case 'UPDATE':
        return <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">Atualizado</Badge>;
      case 'DELETE':
        return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">Removido</Badge>;
      default:
        return null;
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <Card className="shadow-soft">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Activity className="h-5 w-5 text-primary" />
          Atividade em Tempo Real
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px]">
          {changes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-8">
              <Activity className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">Aguardando atualizações...</p>
              <p className="text-xs mt-1">Alterações aparecerão aqui instantaneamente</p>
            </div>
          ) : (
            <div className="space-y-3">
              {changes.map((change, index) => (
                <div
                  key={`${change.timestamp.getTime()}-${index}`}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg border transition-all",
                    "bg-card hover:bg-accent/5",
                    index === 0 && "animate-in slide-in-from-top-2 duration-300"
                  )}
                >
                  <div className="mt-0.5">
                    {getChangeIcon(change.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getChangeBadge(change.type)}
                      <span className="text-xs text-muted-foreground">
                        {formatTime(change.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm font-medium truncate">
                      {change.product?.descricao || 'Produto'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Código: {change.product?.codigo || 'N/A'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
