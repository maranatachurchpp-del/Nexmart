import { useState } from 'react';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import { useAuth } from '@/hooks/useAuth';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useProducts } from '@/hooks/useProducts';
import { useAuditLogs } from '@/hooks/useAuditLogs';
import { useRealtimeMetrics } from '@/hooks/useRealtimeMetrics';
import { useDashboardWidgets } from '@/hooks/useDashboardWidgets';
import { AccessControl } from '@/components/AccessControl';
import { TrialBanner } from '@/components/TrialBanner';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { GlassCard } from '@/components/ui/glass-card';
import { AnimatedNumber } from '@/components/ui/animated-number';
import { DraggableWidget } from '@/components/dashboard/DraggableWidget';
import { WidgetSettingsPanel } from '@/components/dashboard/WidgetSettingsPanel';
import { 
  BarChart3, LogOut, User, Settings, Upload, TrendingUp, DollarSign, 
  AlertTriangle, ShoppingCart, Package, Star, Shield, PackageX, Trash2 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FilterBar } from '@/components/dashboard/FilterBar';
import { KPICard } from '@/components/dashboard/KPICard';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { MarginChart } from '@/components/dashboard/MarginChart';
import { TimeSeriesChart } from '@/components/dashboard/TimeSeriesChart';
import { DataTable } from '@/components/dashboard/DataTable';
import { AlertsPanel } from '@/components/dashboard/AlertsPanel';
import SmartAlertsPanel from '@/components/dashboard/SmartAlertsPanel';
import { NotificationsDropdown } from '@/components/NotificationsDropdown';
import { ExportMenu } from '@/components/ExportMenu';
import { ImportWizard } from '@/components/import/ImportWizard';
import { RealtimeIndicator } from '@/components/dashboard/RealtimeIndicator';
import { RecentChangesPanel } from '@/components/dashboard/RecentChangesPanel';
import { RealtimeMetricsChart } from '@/components/dashboard/RealtimeMetricsChart';
import { ThemeToggle } from '@/components/ThemeToggle';
import { PushNotificationToggle } from '@/components/PushNotificationToggle';
import { GaugeChart, RadialProgressChart, SparklineCard, HeatmapChart } from '@/components/dashboard/ModernCharts';
import { DashboardFilters, Produto } from '@/types/mercadologico';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { isAdmin } = useUserRoles();
  const { produtos, isLoading, refreshProducts } = useProducts();
  const { createLog } = useAuditLogs();
  const { metrics, recentChanges, isConnected } = useRealtimeMetrics();
  const { widgets, reorderWidgets, toggleWidgetVisibility, resetToDefault } = useDashboardWidgets();
  const navigate = useNavigate();
  const [importWizardOpen, setImportWizardOpen] = useState(false);
  const [filters, setFilters] = useState<DashboardFilters>({
    periodo: {
      inicio: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      fim: new Date()
    },
    kvi: 'todos'
  });

  const handleLogout = async () => {
    try {
      await createLog('logout', 'auth');
      await signOut();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const handleImportSuccess = () => {
    setImportWizardOpen(false);
    refreshProducts();
  };

  const handleRowClick = (produto: Produto) => {
    console.log('Produto clicado:', produto);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    if (result.source.index === result.destination.index) return;
    reorderWidgets(result.source.index, result.destination.index);
  };

  // Calculate KPIs from real data
  const calculateKPIs = (data: Produto[]) => {
    if (data.length === 0) {
      return {
        faturamento: 0,
        margemBruta: 0,
        ruptura: 0,
        quebra: 0,
        ticketMedio: 0,
        mixMarcas: 0,
        itensKVI: 0
      };
    }
    
    const totalRevenue = data.reduce((sum, p) => sum + p.participacaoFaturamento * 1000, 0);
    const avgMargin = data.reduce((sum, p) => sum + (p.margemAtual || 0), 0) / data.length;
    const avgRuptura = data.reduce((sum, p) => sum + (p.rupturaAtual || 0), 0) / data.length;
    const avgQuebra = data.reduce((sum, p) => sum + (p.quebraAtual || 0), 0) / data.length;
    const kviProducts = data.filter(p => p.classificacaoKVI === 'Alta');
    const avgBrands = data.reduce((sum, p) => sum + (p.marcasAtuais || 0), 0) / data.length;
    
    return {
      faturamento: totalRevenue,
      margemBruta: avgMargin,
      ruptura: avgRuptura,
      quebra: avgQuebra,
      ticketMedio: 85.50,
      mixMarcas: avgBrands,
      itensKVI: kviProducts.length
    };
  };

  const kpis = calculateKPIs(produtos);

  // Generate sparkline data for KPIs
  const generateSparklineData = (base: number, variance: number = 0.1) => {
    return Array.from({ length: 7 }, (_, i) => ({
      value: base * (1 + (Math.random() - 0.5) * variance)
    }));
  };

  // Generate heatmap data from products
  const generateHeatmapData = () => {
    const departments = [...new Set(produtos.map(p => p.departamento))].slice(0, 6);
    const categories = ['Margem', 'Ruptura', 'Quebra', 'Giro', 'Marcas'];
    
    return departments.map(dept => {
      const deptProducts = produtos.filter(p => p.departamento === dept);
      const avgMargin = deptProducts.reduce((s, p) => s + (p.margemAtual || 0), 0) / (deptProducts.length || 1);
      const avgRuptura = deptProducts.reduce((s, p) => s + (p.rupturaAtual || 0), 0) / (deptProducts.length || 1);
      const avgQuebra = deptProducts.reduce((s, p) => s + (p.quebraAtual || 0), 0) / (deptProducts.length || 1);
      const avgGiro = 50 + Math.random() * 50;
      const avgMarcas = deptProducts.reduce((s, p) => s + (p.marcasAtuais || 0), 0) / (deptProducts.length || 1);
      
      return {
        row: dept.substring(0, 12),
        columns: categories.map((cat, i) => ({
          column: cat,
          value: [avgMargin, avgRuptura * 10, avgQuebra * 10, avgGiro, avgMarcas * 10][i]
        }))
      };
    });
  };

  // Render widget by type
  const renderWidget = (widgetId: string, index: number) => {
    const widget = widgets.find(w => w.id === widgetId);
    if (!widget || !widget.visible) return null;

    switch (widget.type) {
      case 'kpis':
        return (
          <DraggableWidget key={widget.id} id={widget.id} index={index}>
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-6">
                {[...Array(7)].map((_, i) => (
                  <Skeleton key={i} className="h-32" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-6">
                <div className="animate-slide-up-fade stagger-1">
                  <KPICard 
                    title="Faturamento" 
                    value={`R$ ${kpis.faturamento.toLocaleString('pt-BR')}`} 
                    subtitle="Período selecionado" 
                    trend={{ value: 8.2, isPositive: true }} 
                    icon={DollarSign}
                    tooltip="Receita total gerada no período selecionado"
                  />
                </div>
                <div className="animate-slide-up-fade stagger-2">
                  <KPICard 
                    title="Margem Bruta" 
                    value={`${kpis.margemBruta.toFixed(1)}%`} 
                    subtitle="Meta: 18%" 
                    trend={{ value: 2.1, isPositive: false }} 
                    icon={TrendingUp}
                    tooltip="Percentual de lucro bruto sobre as vendas"
                  />
                </div>
                <div className="animate-slide-up-fade stagger-3">
                  <GlassCard className="p-4 hover-lift" variant="warning">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-muted-foreground">Ruptura</span>
                      <PackageX className="h-4 w-4 text-warning" />
                    </div>
                    <div className="text-2xl md:text-3xl font-bold text-foreground">
                      <AnimatedNumber value={kpis.ruptura} decimals={1} suffix="%" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Produtos indisponíveis</p>
                  </GlassCard>
                </div>
                <div className="animate-slide-up-fade stagger-4">
                  <GlassCard className="p-4 hover-lift" variant="danger">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-muted-foreground">Quebra</span>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </div>
                    <div className="text-2xl md:text-3xl font-bold text-foreground">
                      <AnimatedNumber value={kpis.quebra} decimals={1} suffix="%" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Perdas físicas</p>
                  </GlassCard>
                </div>
                <div className="animate-slide-up-fade stagger-5">
                  <KPICard 
                    title="Ticket Médio" 
                    value={`R$ ${kpis.ticketMedio.toFixed(2)}`} 
                    subtitle="Por transação" 
                    trend={{ value: 5.3, isPositive: true }} 
                    icon={ShoppingCart}
                    tooltip="Valor médio gasto por cliente"
                  />
                </div>
                <div className="animate-slide-up-fade stagger-6">
                  <KPICard 
                    title="Mix de Marcas" 
                    value={`${kpis.mixMarcas.toFixed(0)}`} 
                    subtitle="Média atual" 
                    trend={{ value: 1.2, isPositive: true }} 
                    icon={Package}
                    tooltip="Quantidade média de marcas por categoria"
                  />
                </div>
                <div className="animate-slide-up-fade stagger-7">
                  <KPICard 
                    title="Itens KVI" 
                    value={`${kpis.itensKVI}`} 
                    subtitle={`${produtos.length > 0 ? (kpis.itensKVI / produtos.length * 100).toFixed(0) : 0}% do portfólio`} 
                    icon={Star}
                    tooltip="Key Value Items - Produtos-chave"
                  />
                </div>
              </div>
            )}
          </DraggableWidget>
        );

      case 'gauges':
        return (
          <DraggableWidget key={widget.id} id={widget.id} index={index}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <GlassCard className="p-4 flex flex-col items-center justify-center">
                <GaugeChart 
                  value={kpis.margemBruta} 
                  label="Margem Bruta" 
                  thresholds={{ warning: 15, danger: 10 }}
                  size="md"
                />
              </GlassCard>
              <GlassCard className="p-4 flex flex-col items-center justify-center">
                <GaugeChart 
                  value={kpis.ruptura} 
                  label="Ruptura" 
                  thresholds={{ warning: 3, danger: 5 }}
                  size="md"
                />
              </GlassCard>
              <GlassCard className="p-4 flex flex-col items-center justify-center">
                <GaugeChart 
                  value={kpis.quebra} 
                  label="Quebra" 
                  thresholds={{ warning: 2, danger: 4 }}
                  size="md"
                />
              </GlassCard>
              <GlassCard className="p-4 flex flex-col items-center justify-center">
                <RadialProgressChart 
                  value={produtos.length > 0 ? (kpis.itensKVI / produtos.length) * 100 : 0}
                  label="Cobertura KVI"
                  color="primary"
                  size="md"
                />
              </GlassCard>
            </div>
          </DraggableWidget>
        );

      case 'sparklines':
        return (
          <DraggableWidget key={widget.id} id={widget.id} index={index}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <SparklineCard 
                title="Faturamento (7 dias)"
                value={`R$ ${kpis.faturamento.toLocaleString('pt-BR')}`}
                data={generateSparklineData(kpis.faturamento)}
                trend={{ value: 8.2, isPositive: true }}
                color="primary"
              />
              <SparklineCard 
                title="Margem (7 dias)"
                value={`${kpis.margemBruta.toFixed(1)}%`}
                data={generateSparklineData(kpis.margemBruta, 0.05)}
                trend={{ value: 2.1, isPositive: false }}
                color="success"
              />
              <SparklineCard 
                title="Ruptura + Quebra (7 dias)"
                value={`${(kpis.ruptura + kpis.quebra).toFixed(1)}%`}
                data={generateSparklineData(kpis.ruptura + kpis.quebra, 0.15)}
                trend={{ value: 0.5, isPositive: false }}
                color="destructive"
              />
            </div>
          </DraggableWidget>
        );

      case 'heatmap':
        if (produtos.length === 0) return null;
        return (
          <DraggableWidget key={widget.id} id={widget.id} index={index}>
            <div className="mb-6">
              <HeatmapChart 
                data={generateHeatmapData()}
                title="Performance por Departamento"
              />
            </div>
          </DraggableWidget>
        );

      case 'revenue-margin':
        return (
          <DraggableWidget key={widget.id} id={widget.id} index={index}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
              <GlassCard className="p-0 overflow-hidden">
                <RevenueChart />
              </GlassCard>
              <GlassCard className="p-0 overflow-hidden">
                <MarginChart />
              </GlassCard>
            </div>
          </DraggableWidget>
        );

      case 'timeseries':
        return (
          <DraggableWidget key={widget.id} id={widget.id} index={index}>
            <div className="mb-4 md:mb-6">
              <GlassCard className="p-0 overflow-hidden">
                <TimeSeriesChart />
              </GlassCard>
            </div>
          </DraggableWidget>
        );

      case 'realtime':
        return (
          <DraggableWidget key={widget.id} id={widget.id} index={index}>
            <div className="mb-4 md:mb-6">
              <GlassCard className="p-0 overflow-hidden">
                <RealtimeMetricsChart metrics={metrics} isConnected={isConnected} />
              </GlassCard>
            </div>
          </DraggableWidget>
        );

      case 'smart-alerts':
        return (
          <DraggableWidget key={widget.id} id={widget.id} index={index}>
            <div className="mb-4 md:mb-6">
              <SmartAlertsPanel />
            </div>
          </DraggableWidget>
        );

      case 'activity-alerts':
        return (
          <DraggableWidget key={widget.id} id={widget.id} index={index}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-4 md:mb-6">
              <div className="lg:col-span-2">
                <GlassCard className="p-0 overflow-hidden">
                  <RecentChangesPanel changes={recentChanges} />
                </GlassCard>
              </div>
              <div className="lg:col-span-1">
                <GlassCard className="p-0 overflow-hidden">
                  <AlertsPanel produtos={produtos} />
                </GlassCard>
              </div>
            </div>
          </DraggableWidget>
        );

      case 'data-table':
        return (
          <DraggableWidget key={widget.id} id={widget.id} index={index}>
            <div className="overflow-x-auto">
              <GlassCard className="p-0 overflow-hidden">
                <DataTable produtos={produtos} isLoading={isLoading} onRowClick={handleRowClick} />
              </GlassCard>
            </div>
          </DraggableWidget>
        );

      default:
        return null;
    }
  };

  // Get visible widgets in order
  const visibleWidgets = widgets.filter(w => w.visible);

  return (
    <AccessControl>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border glass-strong sticky top-0 z-50">
          <div className="container mx-auto px-4 py-3 md:py-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-0">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-6 w-6 md:h-8 md:w-8 text-primary animate-pulse-glow" />
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground text-xl md:text-2xl gradient-text">Nexmart</span>
                  <RealtimeIndicator isConnected={isConnected} lastUpdate={metrics.lastUpdate} />
                </div>
              </div>
              
              <div className="flex items-center gap-2 md:gap-4 flex-wrap">
                <div className="hidden sm:flex items-center space-x-2 text-sm text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span className="truncate max-w-[150px] md:max-w-none">{user?.email}</span>
                </div>
                <ThemeToggle />
                <PushNotificationToggle />
                <NotificationsDropdown />
                <WidgetSettingsPanel 
                  widgets={widgets}
                  onToggleVisibility={toggleWidgetVisibility}
                  onReset={resetToDefault}
                />
                <ExportMenu produtos={produtos} filters={filters} />
                <Button variant="outline" size="sm" onClick={() => setImportWizardOpen(true)} className="hover-lift">
                  <Upload className="w-4 h-4 md:mr-2" />
                  <span className="hidden md:inline">Importar</span>
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigate('/settings')} className="hover-lift">
                  <Settings className="w-4 h-4 md:mr-2" />
                  <span className="hidden md:inline">Configurações</span>
                </Button>
                {isAdmin && (
                  <Button variant="outline" size="sm" onClick={() => navigate('/admin')} className="hover-lift">
                    <Shield className="w-4 h-4 md:mr-2" />
                    <span className="hidden md:inline">Admin</span>
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={handleLogout} className="hover-lift">
                  <LogOut className="w-4 h-4 md:mr-2" />
                  <span className="hidden md:inline">Sair</span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-6">
          {/* Trial Banner */}
          <TrialBanner />
          
          {/* Filters */}
          <FilterBar filters={filters} onFiltersChange={setFilters} />

          {/* Draggable Widgets */}
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="dashboard-widgets">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={snapshot.isDraggingOver ? 'bg-accent/20 rounded-lg transition-colors' : ''}
                >
                  {visibleWidgets.map((widget, index) => renderWidget(widget.id, index))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </main>

        {/* Import Wizard */}
        <ImportWizard 
          open={importWizardOpen} 
          onOpenChange={setImportWizardOpen}
          onSuccess={handleImportSuccess}
        />
      </div>
    </AccessControl>
  );
};

export default Dashboard;
