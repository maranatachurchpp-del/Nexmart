import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useProducts } from '@/hooks/useProducts';
import { useAuditLogs } from '@/hooks/useAuditLogs';
import { useRealtimeMetrics } from '@/hooks/useRealtimeMetrics';
import { AccessControl, TrialWarning } from '@/components/AccessControl';
import { TrialBanner } from '@/components/TrialBanner';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart3, LogOut, User, Settings, Upload, TrendingUp, DollarSign, AlertTriangle, ShoppingCart, Package, Star, Shield } from 'lucide-react';
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
import { CSVUploadDialog } from '@/components/structure/CSVUploadDialog';
import { RealtimeIndicator } from '@/components/dashboard/RealtimeIndicator';
import { RecentChangesPanel } from '@/components/dashboard/RecentChangesPanel';
import { RealtimeMetricsChart } from '@/components/dashboard/RealtimeMetricsChart';
import { ThemeToggle } from '@/components/ThemeToggle';
import { PushNotificationToggle } from '@/components/PushNotificationToggle';
import { DashboardFilters, Produto } from '@/types/mercadologico';
const Dashboard = () => {
  const {
    user,
    signOut
  } = useAuth();
  const { isAdmin } = useUserRoles();
  const { produtos, isLoading, refreshProducts } = useProducts();
  const { createLog } = useAuditLogs();
  const { metrics, recentChanges, isConnected } = useRealtimeMetrics();
  const navigate = useNavigate();
  const [csvDialogOpen, setCsvDialogOpen] = useState(false);
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

  const handleCsvImportSuccess = () => {
    setCsvDialogOpen(false);
    refreshProducts();
  };

  const handleRowClick = (produto: Produto) => {
    // Implement drill-down logic
    console.log('Produto clicado:', produto);
    // Could navigate to detailed view or update filters
  };

  // Calculate KPIs from real data
  const calculateKPIs = (data: Produto[]) => {
    if (data.length === 0) {
      return {
        faturamento: 0,
        margemBruta: 0,
        ruptura: 0,
        ticketMedio: 0,
        mixMarcas: 0,
        itensKVI: 0
      };
    }
    
    const totalRevenue = data.reduce((sum, p) => sum + p.participacaoFaturamento * 1000, 0);
    const avgMargin = data.reduce((sum, p) => sum + (p.margemAtual || 0), 0) / data.length;
    const avgBreakage = data.reduce((sum, p) => sum + (p.quebraAtual || 0), 0) / data.length;
    const kviProducts = data.filter(p => p.classificacaoKVI === 'Alta');
    const avgBrands = data.reduce((sum, p) => sum + (p.marcasAtuais || 0), 0) / data.length;
    return {
      faturamento: totalRevenue,
      margemBruta: avgMargin,
      ruptura: avgBreakage,
      ticketMedio: 85.50,
      mixMarcas: avgBrands,
      itensKVI: kviProducts.length
    };
  };
  const kpis = calculateKPIs(produtos);
  return <AccessControl>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-3 md:py-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-0">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground text-xl md:text-2xl">Nexmart</span>
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
                <ExportMenu produtos={produtos} filters={filters} />
                <Button variant="outline" size="sm" onClick={() => setCsvDialogOpen(true)}>
                  <Upload className="w-4 h-4 md:mr-2" />
                  <span className="hidden md:inline">Importar</span>
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigate('/settings')}>
                  <Settings className="w-4 h-4 md:mr-2" />
                  <span className="hidden md:inline">Configurações</span>
                </Button>
                {isAdmin && (
                  <Button variant="outline" size="sm" onClick={() => navigate('/admin')}>
                    <Shield className="w-4 h-4 md:mr-2" />
                    <span className="hidden md:inline">Admin</span>
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={handleLogout}>
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

          {/* KPI Cards */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
              <KPICard 
                title="Faturamento" 
                value={`R$ ${kpis.faturamento.toLocaleString('pt-BR')}`} 
                subtitle="Período selecionado" 
                trend={{ value: 8.2, isPositive: true }} 
                icon={DollarSign}
                tooltip="Receita total gerada no período selecionado"
              />
              <KPICard 
                title="Margem Bruta" 
                value={`${kpis.margemBruta.toFixed(1)}%`} 
                subtitle="Meta: 18%" 
                trend={{ value: 2.1, isPositive: false }} 
                icon={TrendingUp}
                tooltip="Percentual de lucro bruto sobre as vendas. Meta ideal: acima de 18%"
              />
              <KPICard 
                title="Ruptura/Quebra" 
                value={`${kpis.ruptura.toFixed(1)}%`} 
                subtitle="Meta: <2%" 
                trend={{ value: 0.5, isPositive: false }} 
                icon={AlertTriangle}
                tooltip="Produtos fora de estoque ou com perdas. Objetivo: manter abaixo de 2%"
              />
              <KPICard 
                title="Ticket Médio" 
                value={`R$ ${kpis.ticketMedio.toFixed(2)}`} 
                subtitle="Por transação" 
                trend={{ value: 5.3, isPositive: true }} 
                icon={ShoppingCart}
                tooltip="Valor médio gasto por cliente em cada compra"
              />
              <KPICard 
                title="Mix de Marcas" 
                value={`${kpis.mixMarcas.toFixed(0)} marcas`} 
                subtitle="Média atual" 
                trend={{ value: 1.2, isPositive: true }} 
                icon={Package}
                tooltip="Quantidade média de marcas diferentes por categoria de produto"
              />
              <KPICard 
                title="Itens KVI" 
                value={`${kpis.itensKVI}`} 
                subtitle={`${produtos.length > 0 ? (kpis.itensKVI / produtos.length * 100).toFixed(0) : 0}% do portfólio`} 
                icon={Star}
                tooltip="Key Value Items - Produtos-chave que mais impactam a percepção de preço do consumidor"
              />
            </div>
          )}

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
            <RevenueChart />
            <MarginChart />
          </div>

          <div className="mb-4 md:mb-6">
            <TimeSeriesChart />
          </div>

          {/* Realtime Metrics Chart */}
          <div className="mb-4 md:mb-6">
            <RealtimeMetricsChart metrics={metrics} isConnected={isConnected} />
          </div>

          {/* Smart AI Alerts */}
          <div className="mb-4 md:mb-6">
            <SmartAlertsPanel />
          </div>

          {/* Realtime Activity and Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-4 md:mb-6">
            <div className="lg:col-span-2">
              <RecentChangesPanel changes={recentChanges} />
            </div>
            <div className="lg:col-span-1">
              <AlertsPanel produtos={produtos} />
            </div>
          </div>

          {/* Data Table */}
          <div className="overflow-x-auto">
            <DataTable produtos={produtos} isLoading={isLoading} onRowClick={handleRowClick} />
          </div>
        </main>

        {/* CSV Upload Dialog */}
        <CSVUploadDialog 
          open={csvDialogOpen} 
          onOpenChange={setCsvDialogOpen}
          onSuccess={handleCsvImportSuccess}
        />
      </div>
    </AccessControl>;
};
export default Dashboard;