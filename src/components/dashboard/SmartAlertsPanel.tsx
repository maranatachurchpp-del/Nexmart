import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertTriangle, TrendingUp, AlertCircle, Lightbulb, Loader2, RefreshCw, HelpCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Alert {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: 'margin' | 'rupture' | 'pricing' | 'opportunity';
  actionable_insight: string;
  generated_at: string;
}

const priorityConfig = {
  high: { color: 'destructive', label: 'Alta' },
  medium: { color: 'default', label: 'Média' },
  low: { color: 'secondary', label: 'Baixa' }
};

const categoryIcons = {
  margin: TrendingUp,
  rupture: AlertTriangle,
  pricing: AlertCircle,
  opportunity: Lightbulb
};

const categoryLabels = {
  margin: 'Margem',
  rupture: 'Ruptura',
  pricing: 'Precificação',
  opportunity: 'Oportunidade'
};

export default function SmartAlertsPanel() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  const fetchAlerts = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const { data, error } = await supabase.functions.invoke('generate-smart-alerts');

      if (error) {
        console.error('Error fetching alerts:', error);
        const errorMessage = error.message || 'Não foi possível conectar ao servidor';
        toast({
          title: '❌ Erro ao carregar alertas inteligentes',
          description: `${errorMessage}. Por favor, verifique sua conexão e tente novamente.`,
          variant: 'destructive',
        });
        return;
      }

      if (data?.alerts) {
        setAlerts(data.alerts);
        if (isRefresh) {
          toast({
            title: '✅ Alertas atualizados com sucesso',
            description: `${data.alerts.length} insight${data.alerts.length !== 1 ? 's' : ''} gerado${data.alerts.length !== 1 ? 's' : ''} pela IA Gemini`,
          });
        }
      }
    } catch (error) {
      console.error('Error in fetchAlerts:', error);
      const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: '⚠️ Erro inesperado ao carregar alertas',
        description: `Detalhes: ${errorMsg}. Nossa equipe foi notificada. Por favor, tente novamente em alguns instantes.`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  if (loading) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            Alertas Inteligentes (IA)
          </CardTitle>
          <CardDescription>
            Insights gerados por IA para otimizar seu negócio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground animate-pulse">Analisando seus dados e gerando insights personalizados...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <Card className="col-span-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  Alertas Inteligentes (IA)
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Alertas gerados por IA analisando seus dados de negócio em tempo real para identificar oportunidades e problemas críticos.</p>
                    </TooltipContent>
                  </Tooltip>
                </CardTitle>
                <CardDescription>
                  Insights gerados por IA Gemini • Atualizado agora
                </CardDescription>
              </div>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchAlerts(true)}
                  disabled={refreshing}
                >
                  {refreshing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  <span className="ml-2">Atualizar</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Gerar novos insights com base nos dados mais recentes</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <Lightbulb className="h-12 w-12 text-muted-foreground/50 mx-auto" />
            <p className="text-muted-foreground font-medium">Nenhum alerta disponível no momento</p>
            <p className="text-sm text-muted-foreground">Os alertas são gerados automaticamente com base na análise dos seus dados</p>
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            {alerts.map((alert) => {
              const Icon = categoryIcons[alert.category];
              const priorityInfo = priorityConfig[alert.priority];

              return (
                <Card key={alert.id} className="border-l-4 border-l-primary">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2">
                        <Icon className="h-5 w-5 mt-0.5 text-primary flex-shrink-0" />
                        <div>
                          <CardTitle className="text-base">{alert.title}</CardTitle>
                          <div className="flex gap-2 mt-2">
                            <Badge variant={priorityInfo.color as any} className="text-xs">
                              {priorityInfo.label}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {categoryLabels[alert.category]}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      {alert.description}
                    </p>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-sm font-medium text-foreground">
                        💡 {alert.actionable_insight}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
    </TooltipProvider>
  );
}
