import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Trash2, Database, AlertTriangle, Loader2 } from 'lucide-react';

interface DataManagementDialogProps {
  onDataCleared?: () => void;
}

export const DataManagementDialog = ({ onDataCleared }: DataManagementDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedTables, setSelectedTables] = useState({
    produtos: true,
    notifications: false,
    alertHistory: false,
    reportHistory: false,
    snapshots: false
  });

  const toggleTable = (table: keyof typeof selectedTables) => {
    setSelectedTables(prev => ({ ...prev, [table]: !prev[table] }));
  };

  const selectedCount = Object.values(selectedTables).filter(Boolean).length;

  const handleClearData = async () => {
    setIsClearing(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const errors: string[] = [];

      // Clear each selected table
      if (selectedTables.snapshots) {
        const { error } = await supabase
          .from('product_snapshots')
          .delete()
          .eq('user_id', user.id);
        if (error) errors.push(`Snapshots: ${error.message}`);
      }

      if (selectedTables.produtos) {
        const { error } = await supabase
          .from('produtos')
          .delete()
          .eq('user_id', user.id);
        if (error) errors.push(`Produtos: ${error.message}`);
      }

      if (selectedTables.notifications) {
        const { error } = await supabase
          .from('notifications')
          .delete()
          .eq('user_id', user.id);
        if (error) errors.push(`Notificações: ${error.message}`);
      }

      if (selectedTables.alertHistory) {
        const { error } = await supabase
          .from('alert_history')
          .delete()
          .eq('user_id', user.id);
        if (error) errors.push(`Histórico de Alertas: ${error.message}`);
      }

      if (selectedTables.reportHistory) {
        const { error } = await supabase
          .from('report_history')
          .delete()
          .eq('user_id', user.id);
        if (error) errors.push(`Histórico de Relatórios: ${error.message}`);
      }

      // Clear localStorage filters
      localStorage.removeItem('dashboard-filters');

      if (errors.length > 0) {
        toast({
          title: 'Alguns dados não puderam ser removidos',
          description: errors.join('; '),
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Dados removidos com sucesso!',
          description: 'Os dados selecionados foram limpos do sistema.',
        });
        onDataCleared?.();
      }

      setShowConfirmDialog(false);
      setIsOpen(false);
    } catch (error: any) {
      console.error('Error clearing data:', error);
      toast({
        title: 'Erro ao limpar dados',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
          <Database className="w-4 h-4 mr-2" />
          Gerenciar Dados
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Gerenciamento de Dados
          </DialogTitle>
          <DialogDescription>
            Selecione quais dados você deseja limpar do sistema. Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 rounded-lg border bg-background hover:bg-muted/50 transition-colors">
              <Checkbox 
                id="produtos" 
                checked={selectedTables.produtos}
                onCheckedChange={() => toggleTable('produtos')}
              />
              <div className="flex-1">
                <Label htmlFor="produtos" className="font-medium cursor-pointer">Produtos</Label>
                <p className="text-xs text-muted-foreground">Todos os produtos cadastrados</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 rounded-lg border bg-background hover:bg-muted/50 transition-colors">
              <Checkbox 
                id="snapshots" 
                checked={selectedTables.snapshots}
                onCheckedChange={() => toggleTable('snapshots')}
              />
              <div className="flex-1">
                <Label htmlFor="snapshots" className="font-medium cursor-pointer">Histórico de Métricas</Label>
                <p className="text-xs text-muted-foreground">Snapshots diários para gráficos de tendência</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 rounded-lg border bg-background hover:bg-muted/50 transition-colors">
              <Checkbox 
                id="notifications" 
                checked={selectedTables.notifications}
                onCheckedChange={() => toggleTable('notifications')}
              />
              <div className="flex-1">
                <Label htmlFor="notifications" className="font-medium cursor-pointer">Notificações</Label>
                <p className="text-xs text-muted-foreground">Todas as notificações recebidas</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 rounded-lg border bg-background hover:bg-muted/50 transition-colors">
              <Checkbox 
                id="alertHistory" 
                checked={selectedTables.alertHistory}
                onCheckedChange={() => toggleTable('alertHistory')}
              />
              <div className="flex-1">
                <Label htmlFor="alertHistory" className="font-medium cursor-pointer">Histórico de Alertas</Label>
                <p className="text-xs text-muted-foreground">Alertas inteligentes gerados</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 rounded-lg border bg-background hover:bg-muted/50 transition-colors">
              <Checkbox 
                id="reportHistory" 
                checked={selectedTables.reportHistory}
                onCheckedChange={() => toggleTable('reportHistory')}
              />
              <div className="flex-1">
                <Label htmlFor="reportHistory" className="font-medium cursor-pointer">Histórico de Relatórios</Label>
                <p className="text-xs text-muted-foreground">Relatórios gerados anteriormente</p>
              </div>
            </div>
          </div>

          {selectedCount > 0 && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <p className="text-sm">
                {selectedCount} {selectedCount === 1 ? 'categoria selecionada' : 'categorias selecionadas'} para exclusão
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancelar
          </Button>
          <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive" 
                disabled={selectedCount === 0}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Limpar Dados Selecionados
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="w-5 h-5" />
                  Confirmar Exclusão
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir permanentemente os dados selecionados? 
                  Esta ação não pode ser desfeita e todos os dados serão perdidos.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isClearing}>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleClearData}
                  disabled={isClearing}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isClearing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Excluindo...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Confirmar Exclusão
                    </>
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </DialogContent>
    </Dialog>
  );
};
