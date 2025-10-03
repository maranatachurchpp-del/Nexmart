import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserRoles } from '@/hooks/useUserRoles';
import { AccessControl, TrialWarning } from '@/components/AccessControl';
import { TrialBanner } from '@/components/TrialBanner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { DashboardFilters, Produto } from '@/types/mercadologico';
import { produtosSample } from '@/data/mercadologico-data';
const Dashboard = () => {
  const {
    user,
    signOut
  } = useAuth();
  const { isAdmin } = useUserRoles();
  const navigate = useNavigate();
  const [filters, setFilters] = useState<DashboardFilters>({
    periodo: {
      inicio: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      fim: new Date()
    },
    kvi: 'todos'
  });
  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };
  const handleRowClick = (produto: Produto) => {
    // Implement drill-down logic
    console.log('Produto clicado:', produto);
    // Could navigate to detailed view or update filters
  };

  // Calculate KPIs from mock data
  const calculateKPIs = () => {
    const totalRevenue = produtosSample.reduce((sum, p) => sum + p.participacaoFaturamento * 1000, 0);
    const avgMargin = produtosSample.reduce((sum, p) => sum + (p.margemAtual || 0), 0) / produtosSample.length;
    const avgBreakage = produtosSample.reduce((sum, p) => sum + (p.quebraAtual || 0), 0) / produtosSample.length;
    const kviProducts = produtosSample.filter(p => p.classificacaoKVI === 'Alta');
    const avgBrands = produtosSample.reduce((sum, p) => sum + (p.marcasAtuais || 0), 0) / produtosSample.length;
    return {
      faturamento: totalRevenue,
      margemBruta: avgMargin,
      ruptura: avgBreakage,
      ticketMedio: 85.50,
      mixMarcas: avgBrands,
      itensKVI: kviProducts.length
    };
  };
  const kpis = calculateKPIs();
  return <AccessControl>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-8 w-8 text-primary" />
                <div>
                  <span className="font-bold text-foreground text-2xl">Nexmart</span>
                  <Badge variant="outline" className="ml-2 text-xs">
                    Tempo Real
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span>{user?.email}</span>
                </div>
                <Button variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Importar CSV
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigate('/settings')}>
                  <Settings className="w-4 h-4 mr-2" />
                  Configurações
                </Button>
                {isAdmin && (
                  <Button variant="outline" size="sm" onClick={() => navigate('/admin')}>
                    <Shield className="w-4 h-4 mr-2" />
                    Admin
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
            <KPICard title="Faturamento" value={`R$ ${kpis.faturamento.toLocaleString('pt-BR')}`} subtitle="Período selecionado" trend={{
            value: 8.2,
            isPositive: true
          }} icon={DollarSign} />
            <KPICard title="Margem Bruta" value={`${kpis.margemBruta.toFixed(1)}%`} subtitle="Meta: 18%" trend={{
            value: 2.1,
            isPositive: false
          }} icon={TrendingUp} />
            <KPICard title="Ruptura/Quebra" value={`${kpis.ruptura.toFixed(1)}%`} subtitle="Meta: <2%" trend={{
            value: 0.5,
            isPositive: false
          }} icon={AlertTriangle} />
            <KPICard title="Ticket Médio" value={`R$ ${kpis.ticketMedio.toFixed(2)}`} subtitle="Por transação" trend={{
            value: 5.3,
            isPositive: true
          }} icon={ShoppingCart} />
            <KPICard title="Mix de Marcas" value={`${kpis.mixMarcas.toFixed(0)} marcas`} subtitle="Média atual" trend={{
            value: 1.2,
            isPositive: true
          }} icon={Package} />
            <KPICard title="Itens KVI" value={`${kpis.itensKVI}`} subtitle={`${(kpis.itensKVI / produtosSample.length * 100).toFixed(0)}% do portfólio`} icon={Star} />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <RevenueChart />
            <MarginChart />
          </div>

          <div className="mb-6">
            <TimeSeriesChart />
          </div>

          {/* Smart AI Alerts */}
          <div className="mb-6">
            <SmartAlertsPanel />
          </div>

          {/* Data Table and Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <DataTable onRowClick={handleRowClick} />
            </div>
            <div>
              <AlertsPanel />
            </div>
          </div>
        </main>
      </div>
    </AccessControl>;
};
export default Dashboard;