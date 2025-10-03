import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, TrendingUp, AlertCircle, Lightbulb, Loader2, RefreshCw } from 'lucide-react';
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
        toast({
          title: 'Erro ao gerar alertas',
          description: error.message || 'Tente novamente mais tarde',
          variant: 'destructive',
        });
        return;
      }

      if (data?.alerts) {
        setAlerts(data.alerts);
        if (isRefresh) {
          toast({
            title: 'Alertas atualizados',
            description: `${data.alerts.length} novos insights gerados pela IA`,
          });
        }
      }
    } catch (error) {
      console.error('Error in fetchAlerts:', error);
      toast({
        title: 'Erro ao carregar alertas',
        description: 'Ocorreu um erro inesperado',
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
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              Alertas Inteligentes (IA)
            </CardTitle>
            <CardDescription>
              Insights gerados por IA Gemini • Atualizado agora
            </CardDescription>
          </div>
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
        </div>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum alerta disponível no momento
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
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
  );
}
