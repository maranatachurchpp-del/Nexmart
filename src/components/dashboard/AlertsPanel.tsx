import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertTriangle, TrendingDown, Package, Star, HelpCircle } from 'lucide-react';
import { Produto } from '@/types/mercadologico';

interface AlertsPanelProps {
  produtos: Produto[];
}

export const AlertsPanel = ({ produtos }: AlertsPanelProps) => {
  // Generate alerts based on product data
  const generateAlerts = () => {
    const alerts = [];

    // Margin alerts
    const lowMarginProducts = produtos.filter(p => 
      p.status === 'destructive' || (p.margemAtual && p.margemAtual < p.margemA.min)
    );

    if (lowMarginProducts.length > 0) {
      alerts.push({
        id: 1,
        tipo: 'margem',
        severidade: 'destructive',
        icon: TrendingDown,
        titulo: 'Margem Crítica',
        mensagem: `${lowMarginProducts.length} produtos com margem abaixo da meta`,
        detalhes: lowMarginProducts.slice(0, 2).map(p => p.descricao).join(', ')
      });
    }

    // Breakage alerts
    const highBreakageProducts = produtos.filter(p => 
      p.quebraAtual && p.quebraAtual > p.quebraEsperada * 1.5
    );

    if (highBreakageProducts.length > 0) {
      alerts.push({
        id: 2,
        tipo: 'quebra',
        severidade: 'warning',
        icon: Package,
        titulo: 'Quebra Elevada',
        mensagem: `${highBreakageProducts.length} produtos com quebra acima do esperado`,
        detalhes: highBreakageProducts.slice(0, 2).map(p => p.descricao).join(', ')
      });
    }

    // Stockout/Rupture alerts
    const highRuptureProducts = produtos.filter(p => 
      p.rupturaAtual !== undefined && 
      p.rupturaEsperada !== undefined &&
      p.rupturaAtual > p.rupturaEsperada * 1.5
    );

    if (highRuptureProducts.length > 0) {
      alerts.push({
        id: 6,
        tipo: 'ruptura',
        severidade: 'destructive',
        icon: AlertTriangle,
        titulo: 'Ruptura Crítica',
        mensagem: `${highRuptureProducts.length} produtos com ruptura acima do esperado`,
        detalhes: highRuptureProducts.slice(0, 2).map(p => `${p.descricao} (${p.rupturaAtual?.toFixed(1)}%)`).join(', ')
      });
    }

    // KVI price alerts
    const kviProducts = produtos.filter(p => p.classificacaoKVI === 'Alta');
    if (kviProducts.length > 0) {
      alerts.push({
        id: 3,
        tipo: 'kvi',
        severidade: 'warning',
        icon: Star,
        titulo: 'Produtos KVI',
        mensagem: `${kviProducts.length} produtos KVI necessitam monitoramento de preços`,
        detalhes: 'Itens estratégicos para competitividade'
      });
    }

    // Brand mix alerts
    const brandMixIssues = produtos.filter(p => 
      p.marcasAtuais && (p.marcasAtuais < p.marcasMin || p.marcasAtuais > p.marcasMax)
    );

    if (brandMixIssues.length > 0) {
      alerts.push({
        id: 4,
        tipo: 'marcas',
        severidade: 'warning',
        icon: AlertTriangle,
        titulo: 'Mix de Marcas',
        mensagem: `${brandMixIssues.length} produtos fora do mix recomendado`,
        detalhes: 'Revisar portfólio de marcas'
      });
    }

    // General performance alert
    const warningProducts = produtos.filter(p => p.status === 'warning');
    if (warningProducts.length > 0) {
      alerts.push({
        id: 5,
        tipo: 'performance',
        severidade: 'warning',
        icon: AlertTriangle,
        titulo: 'Performance Geral',
        mensagem: `${warningProducts.length} produtos necessitam atenção`,
        detalhes: 'Revisar estratégia de precificação e sortimento'
      });
    }

    return alerts.slice(0, 5); // Return top 5 alerts
  };

  const alerts = generateAlerts();

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'destructive': return 'destructive';
      case 'warning': return 'secondary';
      case 'success': return 'default';
      default: return 'outline';
    }
  };

  const getSeverityBg = (severity: string) => {
    switch (severity) {
      case 'destructive': return 'bg-destructive/10 border-destructive/20';
      case 'warning': return 'bg-warning/10 border-warning/20';
      case 'success': return 'bg-success/10 border-success/20';
      default: return 'bg-muted/10 border-border';
    }
  };

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Alertas & Insights
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Alertas automáticos baseados nos seus dados de produtos, margens e performance</p>
                </TooltipContent>
              </Tooltip>
            </CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            {alerts.length} {alerts.length === 1 ? 'alerta necessita' : 'alertas necessitam'} atenção
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {alerts.length === 0 ? (
            <div className="text-center py-8 space-y-2">
              <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6 text-success" />
              </div>
              <p className="font-medium text-foreground">Tudo sob controle!</p>
              <p className="text-sm text-muted-foreground">Nenhum alerta no momento</p>
              <p className="text-xs text-muted-foreground">Todos os indicadores estão dentro dos parâmetros</p>
            </div>
          ) : (
            alerts.map((alert) => {
              const IconComponent = alert.icon;
              return (
                <div
                  key={alert.id}
                  className={`p-3 md:p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${getSeverityBg(alert.severidade)}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <IconComponent className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1 gap-2">
                        <h4 className="text-sm font-medium text-foreground truncate">
                          {alert.titulo}
                        </h4>
                        <Badge variant={getSeverityColor(alert.severidade)} className="text-xs shrink-0">
                          {alert.severidade === 'destructive' ? 'Crítico' : 
                           alert.severidade === 'warning' ? 'Atenção' : 'OK'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {alert.mensagem}
                      </p>
                      {alert.detalhes && (
                        <p className="text-xs text-muted-foreground/80">
                          {alert.detalhes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};