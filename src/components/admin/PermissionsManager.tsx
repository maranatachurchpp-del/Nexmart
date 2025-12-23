import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Save, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Permission {
  id: string;
  role: string;
  feature: string;
  can_read: boolean;
  can_write: boolean;
  can_delete: boolean;
  can_export: boolean;
}

const roleLabels: Record<string, string> = {
  admin: 'Administrador',
  moderator: 'Moderador',
  user: 'Usuário'
};

const featureLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  products: 'Produtos',
  reports: 'Relatórios',
  structure: 'Estrutura',
  users: 'Usuários',
  settings: 'Configurações'
};

export const PermissionsManager = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('feature_permissions')
        .select('*')
        .order('role', { ascending: true })
        .order('feature', { ascending: true });

      if (error) throw error;
      setPermissions(data || []);
    } catch (err) {
      console.error('Error fetching permissions:', err);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as permissões',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (id: string, field: keyof Permission, value: boolean) => {
    setPermissions(prev => 
      prev.map(p => p.id === id ? { ...p, [field]: value } : p)
    );
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      for (const permission of permissions) {
        const { error } = await supabase
          .from('feature_permissions')
          .update({
            can_read: permission.can_read,
            can_write: permission.can_write,
            can_delete: permission.can_delete,
            can_export: permission.can_export
          })
          .eq('id', permission.id);

        if (error) throw error;
      }

      toast({
        title: 'Sucesso',
        description: 'Permissões atualizadas com sucesso'
      });
      setHasChanges(false);
    } catch (err) {
      console.error('Error saving permissions:', err);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar as permissões',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  // Group permissions by role
  const groupedPermissions = permissions.reduce((acc, perm) => {
    if (!acc[perm.role]) {
      acc[perm.role] = [];
    }
    acc[perm.role].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Gestão de Permissões</CardTitle>
            <CardDescription>
              Configure as permissões para cada role do sistema
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchPermissions} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            <Button size="sm" onClick={handleSave} disabled={!hasChanges || saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : Object.keys(groupedPermissions).length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhuma permissão configurada. As permissões serão criadas automaticamente.
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedPermissions).map(([role, perms]) => (
              <div key={role} className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant={role === 'admin' ? 'default' : 'secondary'}>
                    {roleLabels[role] || role}
                  </Badge>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Funcionalidade</TableHead>
                      <TableHead className="text-center">Leitura</TableHead>
                      <TableHead className="text-center">Escrita</TableHead>
                      <TableHead className="text-center">Exclusão</TableHead>
                      <TableHead className="text-center">Exportação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {perms.map((perm) => (
                      <TableRow key={perm.id}>
                        <TableCell>{featureLabels[perm.feature] || perm.feature}</TableCell>
                        <TableCell className="text-center">
                          <Switch
                            checked={perm.can_read}
                            onCheckedChange={(checked) => handleToggle(perm.id, 'can_read', checked)}
                            disabled={role === 'admin'}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Switch
                            checked={perm.can_write}
                            onCheckedChange={(checked) => handleToggle(perm.id, 'can_write', checked)}
                            disabled={role === 'admin'}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Switch
                            checked={perm.can_delete}
                            onCheckedChange={(checked) => handleToggle(perm.id, 'can_delete', checked)}
                            disabled={role === 'admin'}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Switch
                            checked={perm.can_export}
                            onCheckedChange={(checked) => handleToggle(perm.id, 'can_export', checked)}
                            disabled={role === 'admin'}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
