import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingDown, Package, Star } from 'lucide-react';
import { produtosSample } from '@/data/mercadologico-data';

export const AlertsPanel = () => {
  // Generate alerts based on product data
  const generateAlerts = () => {
    const alerts = [];

    // Margin alerts
    const lowMarginProducts = produtosSample.filter(p => 
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
    const highBreakageProducts = produtosSample.filter(p => 
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

    // KVI price alerts
    const kviProducts = produtosSample.filter(p => p.classificacaoKVI === 'Alta');
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
    const brandMixIssues = produtosSample.filter(p => 
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
    const warningProducts = produtosSample.filter(p => p.status === 'warning');
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
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2" />
          Alertas & Insights
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {alerts.length} alertas que necessitam atenção
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {alerts.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Nenhum alerta no momento</p>
            <p className="text-xs">Todos os indicadores estão dentro dos parâmetros</p>
          </div>
        ) : (
          alerts.map((alert) => {
            const IconComponent = alert.icon;
            return (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border transition-colors hover:bg-muted/20 ${getSeverityBg(alert.severidade)}`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <IconComponent className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-medium text-foreground">
                        {alert.titulo}
                      </h4>
                      <Badge variant={getSeverityColor(alert.severidade)} className="text-xs">
                        {alert.severidade === 'destructive' ? 'Crítico' : 
                         alert.severidade === 'warning' ? 'Atenção' : 'OK'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {alert.mensagem}
                    </p>
                    {alert.detalhes && (
                      <p className="text-xs text-muted-foreground">
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
  );
};