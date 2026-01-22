import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserRoles } from '@/hooks/useUserRoles';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, DollarSign, TrendingDown, Search, Calendar, Clock, X, FileText, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { WebhookStatus } from '@/components/admin/WebhookStatus';
import { AuditLogsTable } from '@/components/admin/AuditLogsTable';
import { PermissionsManager } from '@/components/admin/PermissionsManager';
import { UserGrowthChart } from '@/components/admin/UserGrowthChart';
interface AdminStats {
  totalUsers: number;
  activeSubscriptions: number;
  trialUsers: number;
  mrr: number;
  churnRate: number;
}
interface UserData {
  id: string;
  email: string;
  created_at: string;
  subscription?: {
    status: string;
    plan_name: string;
    current_period_end: string;
    trial_end: string;
  };
}
export default function Admin() {
  const {
    user
  } = useAuth();
  const {
    isAdmin,
    loading: rolesLoading
  } = useUserRoles();
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeSubscriptions: 0,
    trialUsers: 0,
    mrr: 0,
    churnRate: 0
  });
  const [users, setUsers] = useState<UserData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (rolesLoading) return; // Wait for roles to load

    if (!isAdmin) {
      navigate('/dashboard');
      return;
    }
    fetchAdminData();
  }, [isAdmin, rolesLoading, navigate]);
  const fetchAdminData = async () => {
    try {
      setLoading(true);

      // Fetch all subscriptions with plan details (use secure view)
      const {
        data: subscriptions,
        error: subsError
      } = await supabase.from('subscriptions').select(`
          *,
          plan:subscription_plans(name, price_monthly)
        `);
      if (subsError) throw subsError;

      // Calculate real stats
      const activeSubscriptions = subscriptions?.filter(s => s.status === 'active') || [];
      const trialUsers = subscriptions?.filter(s => s.status === 'trialing') || [];
      const mrr = activeSubscriptions.reduce((sum, sub) => {
        return sum + (sub.plan?.price_monthly || 0);
      }, 0);
      setStats({
        totalUsers: subscriptions?.length || 0,
        activeSubscriptions: activeSubscriptions.length,
        trialUsers: trialUsers.length,
        mrr,
        churnRate: 0 // Calculate based on historical data if available
      });

      // Fetch real user profiles with subscriptions
      const {
        data: profiles,
        error: profilesError
      } = await supabase.from('profiles').select(`
          user_id,
          name,
          created_at
        `).order('created_at', {
        ascending: false
      }).limit(50);
      if (profilesError) throw profilesError;

      // Map profiles to users with subscription data
      const usersWithSubs: UserData[] = (profiles || []).map(profile => {
        const userSub = subscriptions?.find(s => s.user_id === profile.user_id);
        return {
          id: profile.user_id,
          email: profile.name || 'Sem nome',
          created_at: profile.created_at,
          subscription: userSub ? {
            status: userSub.status,
            plan_name: userSub.plan?.name || 'Desconhecido',
            current_period_end: userSub.current_period_end || '',
            trial_end: userSub.trial_end || ''
          } : undefined
        };
      });
      setUsers(usersWithSubs);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };
  const filteredUsers = users.filter(user => user.email.toLowerCase().includes(searchTerm.toLowerCase()));
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Show loading while checking roles
  if (rolesLoading) {
    return <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando permissões...</p>
        </div>
      </div>;
  }
  if (!isAdmin) {
    return <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md text-center">
          <CardContent className="p-8">
            <X className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Acesso Negado</h2>
            <p className="text-muted-foreground mb-4">
              Você não tem permissão de administrador para acessar esta área.
            </p>
            <Button onClick={() => navigate('/dashboard')}>
              Voltar ao Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>;
  }
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando dados administrativos...</p>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Painel Administrativo</h1>
            <p className="text-secondary-foreground">Gestão e métricas do Nexmart</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            Voltar ao App
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">MRR</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.mrr)}</div>
              <p className="text-xs text-muted-foreground">
                Receita Mensal Recorrente
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>
              <p className="text-xs text-muted-foreground">
                Assinantes pagantes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuários em Teste</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.trialUsers}</div>
              <p className="text-xs text-muted-foreground">
                Período de avaliação
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Churn</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.churnRate}%</div>
              <p className="text-xs text-muted-foreground">
                Cancelamentos mensais
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="flex-wrap">
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              Usuários
            </TabsTrigger>
            <TabsTrigger value="audit">
              <FileText className="h-4 w-4 mr-2" />
              Auditoria
            </TabsTrigger>
            <TabsTrigger value="permissions">
              <Shield className="h-4 w-4 mr-2" />
              Permissões
            </TabsTrigger>
            <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Usuários Cadastrados</CardTitle>
                <CardDescription>
                  Gerencie todos os usuários da plataforma
                </CardDescription>
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Buscar por e-mail..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="max-w-sm" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredUsers.map(userData => <div key={userData.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                      <div className="space-y-1">
                        <p className="font-medium">{userData.email}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          Cadastrado em {new Date(userData.created_at).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {userData.subscription ? <>
                            <Badge variant={userData.subscription.status === 'active' ? 'default' : 'secondary'}>
                              {userData.subscription.status === 'active' ? 'Ativo' : 'Teste'}
                            </Badge>
                            <Badge variant="outline">
                              {userData.subscription.plan_name}
                            </Badge>
                          </> : <Badge variant="secondary">Sem assinatura</Badge>}
                      </div>
                    </div>)}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audit" className="space-y-6">
            <AuditLogsTable />
          </TabsContent>

          <TabsContent value="permissions" className="space-y-6">
            <PermissionsManager />
          </TabsContent>

          <TabsContent value="webhooks" className="space-y-6">
            <WebhookStatus />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <UserGrowthChart />
          </TabsContent>
        </Tabs>
      </div>
    </div>;
}