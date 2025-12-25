import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bell, 
  Settings2, 
  History, 
  CheckCircle, 
  AlertTriangle,
  TrendingDown,
  DollarSign,
  Package,
  Star,
  RefreshCw
} from 'lucide-react';
import { useAlertConfigurations } from '@/hooks/useAlertConfigurations';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const alertTypeConfig: Record<string, { icon: any; label: string; description: string }> = {
  margin_low: { 
    icon: TrendingDown, 
    label: 'Margem Baixa', 
    description: 'Alerta quando a margem cai abaixo do limite' 
  },
  breakage_high: { 
    icon: AlertTriangle, 
    label: 'Quebra Alta', 
    description: 'Alerta quando a quebra excede o limite' 
  },
  stock_rupture: { 
    icon: Package, 
    label: 'Ruptura de Estoque', 
    description: 'Alerta quando há falta de produtos' 
  },
  price_deviation: { 
    icon: DollarSign, 
    label: 'Desvio de Preço', 
    description: 'Alerta quando o preço desvia da meta' 
  },
  kvi_alert: { 
    icon: Star, 
    label: 'Alerta KVI', 
    description: 'Alerta para itens de alto valor' 
  }
};

const priorityColors = {
  high: 'bg-red-500',
  medium: 'bg-yellow-500',
  low: 'bg-blue-500'
};

export const AlertConfigPanel = () => {
  const { 
    configurations, 
    history, 
    loading, 
    saving,
    updateConfiguration, 
    resolveAlert,
    refreshConfigurations,
    refreshHistory
  } = useAlertConfigurations();

  const handleToggle = async (id: string, enabled: boolean) => {
    await updateConfiguration(id, { enabled });
  };

  const handleThresholdChange = async (id: string, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      await updateConfiguration(id, { threshold_value: numValue });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Configuração de Alertas</CardTitle>
              <CardDescription>
                Configure quais alertas deseja receber e seus limites
              </CardDescription>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => { refreshConfigurations(); refreshHistory(); }}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="config" className="space-y-4">
          <TabsList>
            <TabsTrigger value="config">
              <Settings2 className="h-4 w-4 mr-2" />
              Configurações
            </TabsTrigger>
            <TabsTrigger value="history">
              <History className="h-4 w-4 mr-2" />
              Histórico
            </TabsTrigger>
          </TabsList>

          <TabsContent value="config" className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-4">
                {configurations.map((config) => {
                  const typeInfo = alertTypeConfig[config.alert_type] || {
                    icon: Bell,
                    label: config.alert_type,
                    description: 'Alerta personalizado'
                  };
                  const Icon = typeInfo.icon;

                  return (
                    <div 
                      key={config.id} 
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${config.enabled ? 'bg-primary/10' : 'bg-muted'}`}>
                          <Icon className={`h-5 w-5 ${config.enabled ? 'text-primary' : 'text-muted-foreground'}`} />
                        </div>
                        <div>
                          <p className="font-medium">{typeInfo.label}</p>
                          <p className="text-sm text-muted-foreground">{typeInfo.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {config.threshold_value !== null && (
                          <div className="flex items-center gap-2">
                            <Label htmlFor={`threshold-${config.id}`} className="text-sm text-muted-foreground">
                              Limite:
                            </Label>
                            <Input
                              id={`threshold-${config.id}`}
                              type="number"
                              value={config.threshold_value}
                              onChange={(e) => handleThresholdChange(config.id, e.target.value)}
                              className="w-20 h-8"
                              disabled={saving || !config.enabled}
                            />
                            <span className="text-sm text-muted-foreground">%</span>
                          </div>
                        )}
                        <Switch
                          checked={config.enabled}
                          onCheckedChange={(checked) => handleToggle(config.id, checked)}
                          disabled={saving}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history">
            <ScrollArea className="h-[400px]">
              {history.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum alerta registrado ainda
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((alert) => (
                    <div 
                      key={alert.id} 
                      className={`p-4 border rounded-lg ${alert.is_resolved ? 'opacity-60' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-2 ${priorityColors[alert.priority]}`} />
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{alert.title}</p>
                              {alert.is_resolved && (
                                <Badge variant="secondary" className="text-xs">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Resolvido
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {alert.description}
                            </p>
                            {alert.actionable_insight && (
                              <p className="text-sm text-primary mt-2">
                                💡 {alert.actionable_insight}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground mt-2">
                              {formatDistanceToNow(new Date(alert.created_at), { 
                                addSuffix: true, 
                                locale: ptBR 
                              })}
                            </p>
                          </div>
                        </div>
                        {!alert.is_resolved && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => resolveAlert(alert.id)}
                          >
                            Resolver
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
