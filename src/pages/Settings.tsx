import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Link } from 'react-router-dom';

const SettingsPage = () => {
  const { user, signOut } = useAuth();
  const { subscription, loading: subLoading, refreshSubscription } = useSubscription();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState({
    profile: false,
    company: false,
    password: false,
    customerPortal: false,
  });
  const [error, setError] = useState('');
  
  const [profileData, setProfileData] = useState({ name: '', company_name: '' });
  const [passwordData, setPasswordData] = useState({ newPassword: '', confirmPassword: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const { data } = await supabase.from('profiles').select('name, company_name').eq('user_id', user.id).single();
        if (data) {
          setProfileData({ name: data.name || '', company_name: data.company_name || '' });
        }
      }
    };
    fetchProfile();
  }, [user]);
  
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(prev => ({ ...prev, profile: true }));
    const { error } = await supabase.from('profiles').update({ name: profileData.name }).eq('user_id', user.id);
    if (error) {
      toast({ title: "Erro", description: "Não foi possível atualizar o perfil.", variant: "destructive" });
    } else {
      toast({ title: "Sucesso", description: "Perfil atualizado." });
    }
    setLoading(prev => ({ ...prev, profile: false }));
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({ title: "Erro", description: "As senhas não coincidem.", variant: "destructive" });
      return;
    }
    setLoading(prev => ({ ...prev, password: true }));
    const { error } = await supabase.auth.updateUser({ password: passwordData.newPassword });
    if (error) {
      toast({ title: "Erro", description: "Não foi possível alterar a senha.", variant: "destructive" });
    } else {
      setPasswordData({ newPassword: '', confirmPassword: '' });
      toast({ title: "Sucesso", description: "Senha alterada com sucesso." });
    }
    setLoading(prev => ({ ...prev, password: false }));
  };

  const handleCustomerPortal = async () => {
    setLoading(prev => ({ ...prev, customerPortal: true }));
    setError('');
    try {
      // ** CÓDIGO CORRIGIDO AQUI **
      const { data, error: invokeError } = await supabase.functions.invoke('create-customer-portal');

      if (invokeError) {
        const errorMessage = invokeError.context?.error?.message || invokeError.message || 'Falha ao carregar o portal do cliente.';
        throw new Error(errorMessage);
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('URL do portal não recebida.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro inesperado.');
    } finally {
      setLoading(prev => ({ ...prev, customerPortal: false }));
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-6">Configurações</h1>
        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="profile">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Perfil</TabsTrigger>
              <TabsTrigger value="company">Empresa</TabsTrigger>
              <TabsTrigger value="subscription">Assinatura</TabsTrigger>
            </TabsList>
            
            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <TabsContent value="profile" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informações Pessoais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" value={user?.email || ''} disabled />
                    </div>
                    <div>
                      <Label htmlFor="name">Nome Completo</Label>
                      <Input 
                        id="name" 
                        value={profileData.name} 
                        onChange={(e) => setProfileData(prev => ({...prev, name: e.target.value}))}
                      />
                    </div>
                    <Button type="submit" disabled={loading.profile}>
                      {loading.profile ? 'Salvando...' : 'Salvar Alterações'}
                    </Button>
                  </form>
                  <Separator />
                  <form onSubmit={handlePasswordUpdate} className="space-y-4">
                    <h3 className="font-medium">Alterar Senha</h3>
                    <div>
                      <Label htmlFor="newPassword">Nova Senha</Label>
                      <Input 
                        id="newPassword" 
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({...prev, newPassword: e.target.value}))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                      <Input 
                        id="confirmPassword" 
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({...prev, confirmPassword: e.target.value}))}
                      />
                    </div>
                    <Button type="submit" variant="secondary" disabled={loading.password}>
                      {loading.password ? 'Alterando...' : 'Alterar Senha'}
                    </Button>
                  </form>
                   <Separator />
                  <Button variant="destructive" onClick={signOut}>Sair (Logout)</Button>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="company" className="mt-6">
               <Card>
                <CardHeader>
                  <CardTitle>Dados da Empresa</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Em breve você poderá editar os dados da sua empresa aqui.</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="subscription" className="mt-6">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Sua Assinatura</CardTitle>
                    <CardDescription>Gerencie seu plano e informações de faturamento.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {subLoading ? (
                      <p>Carregando sua assinatura...</p>
                    ) : subscription ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <p className="text-lg font-semibold">{subscription.plan.name}</p>
                          <Badge variant={subscription.status === 'active' || subscription.status === 'trialing' ? 'default' : 'destructive'}>
                            {subscription.status === 'active' ? 'Ativo' :
                             subscription.status === 'trialing' ? 'Em Teste' :
                             subscription.status === 'past_due' ? 'Vencido' :
                             subscription.status === 'canceled' ? 'Cancelado' : 'Não Pago'}
                          </Badge>
                        </div>

                        <Separator />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Preço Mensal</p>
                            <p className="text-lg font-semibold">
                              R$ {subscription.plan.price_monthly.toFixed(2).replace('.', ',')}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              {subscription.status === 'trialing' ? 'Fim do Período de Teste' : 'Próxima Cobrança'}
                            </p>
                            <p className="text-lg font-semibold">
                              {subscription.current_period_end ? format(
                                new Date(subscription.current_period_end),
                                'dd/MM/yyyy',
                                { locale: ptBR }
                              ) : 'N/A'}
                            </p>
                          </div>
                        </div>

                        {subscription.plan.features &&
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-2">Recursos Inclusos</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {subscription.plan.features.map((feature, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                  <div className="w-2 h-2 bg-success rounded-full"></div>
                                  <span className="text-sm">{feature}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        }

                        <Separator />

                        <div>
                          <Button 
                            onClick={handleCustomerPortal}
                            disabled={loading.customerPortal}
                            className="w-full sm:w-auto"
                          >
                            {loading.customerPortal ? 'Carregando...' : 'Gerenciar Assinatura'}
                          </Button>
                          <p className="text-xs text-muted-foreground mt-2">
                            Acesse o portal do cliente para atualizar cartão, ver faturas e gerenciar sua assinatura.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">Nenhuma assinatura ativa encontrada.</p>
                        <Button className="mt-4" asChild>
                           <Link to="/subscription">Ver Planos</Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;