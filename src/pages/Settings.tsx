import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { User, Building2, CreditCard, LogOut, Save, Eye, EyeOff } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ProfileData {
  name: string;
  company_name: string;
  annual_revenue: string;
  store_count: string;
  focus_areas: string[];
  experience_level: string;
  main_objective: string;
}

const Settings = () => {
  const { user, signOut } = useAuth();
  const { subscription, loading: subscriptionLoading } = useSubscription();
  const { toast } = useToast();
  
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    company_name: '',
    annual_revenue: '',
    store_count: '',
    focus_areas: [],
    experience_level: '',
    main_objective: ''
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  const [loading, setLoading] = useState({
    profile: false,
    company: false,
    password: false,
    customerPortal: false
  });

  useEffect(() => {
    if (user) {
      fetchProfileData();
    }
  }, [user]);

  const fetchProfileData = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setProfileData({
          name: data.name || '',
          company_name: data.company_name || '',
          annual_revenue: data.annual_revenue || '',
          store_count: data.store_count || '',
          focus_areas: data.focus_areas || [],
          experience_level: data.experience_level || '',
          main_objective: data.main_objective || ''
        });
      }
    } catch (error) {
      console.error('Erro ao buscar dados do perfil:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados do perfil.',
        variant: 'destructive'
      });
    }
  };

  const updateProfile = async () => {
    if (!user) return;

    setLoading(prev => ({ ...prev, profile: true }));

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ name: profileData.name })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Nome atualizado com sucesso!'
      });
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o nome.',
        variant: 'destructive'
      });
    } finally {
      setLoading(prev => ({ ...prev, profile: false }));
    }
  };

  const updateCompanyData = async () => {
    if (!user) return;

    setLoading(prev => ({ ...prev, company: true }));

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          company_name: profileData.company_name,
          annual_revenue: profileData.annual_revenue,
          store_count: profileData.store_count,
          focus_areas: profileData.focus_areas,
          experience_level: profileData.experience_level,
          main_objective: profileData.main_objective
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Dados da empresa atualizados com sucesso!'
      });
    } catch (error) {
      console.error('Erro ao atualizar dados da empresa:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar os dados da empresa.',
        variant: 'destructive'
      });
    } finally {
      setLoading(prev => ({ ...prev, company: false }));
    }
  };

  const changePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: 'Erro',
        description: 'As senhas não coincidem.',
        variant: 'destructive'
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: 'Erro',
        description: 'A nova senha deve ter pelo menos 6 caracteres.',
        variant: 'destructive'
      });
      return;
    }

    setLoading(prev => ({ ...prev, password: true }));

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) throw error;

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      toast({
        title: 'Sucesso',
        description: 'Senha alterada com sucesso!'
      });
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível alterar a senha.',
        variant: 'destructive'
      });
    } finally {
      setLoading(prev => ({ ...prev, password: false }));
    }
  };

  const handleCustomerPortal = async () => {
    if (!user) {
      toast({
        title: 'Erro',
        description: 'Usuário não encontrado.',
        variant: 'destructive'
      });
      return;
    }

    setLoading(prev => ({ ...prev, customerPortal: true }));

    try {
      const { data, error } = await supabase.functions.invoke('create-customer-portal', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No URL returned from customer portal');
      }
    } catch (error) {
      console.error('Erro ao acessar portal do cliente:', error);
      toast({
        title: 'Configuração necessária',
        description: 'A integração com o Stripe Customer Portal precisa ser configurada. Verifique suas credenciais do Stripe.',
        variant: 'destructive'
      });
    } finally {
      setLoading(prev => ({ ...prev, customerPortal: false }));
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível fazer logout.',
        variant: 'destructive'
      });
    }
  };

  const focusAreaOptions = [
    'Gestão de Preços',
    'Controle de Estoque',
    'Análise de Concorrência',
    'Mix de Produtos',
    'Ruptura e Quebra',
    'Performance de Marcas',
    'Sazonalidade',
    'Margem de Contribuição'
  ];

  const handleFocusAreaChange = (area: string, checked: boolean) => {
    setProfileData(prev => ({
      ...prev,
      focus_areas: checked
        ? [...prev.focus_areas, area]
        : prev.focus_areas.filter(a => a !== area)
    }));
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Configurações da Conta</h1>
            <p className="text-muted-foreground">
              Gerencie suas informações pessoais, dados da empresa e assinatura.
            </p>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Perfil
              </TabsTrigger>
              <TabsTrigger value="company" className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Empresa
              </TabsTrigger>
              <TabsTrigger value="subscription" className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Assinatura
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Informações Pessoais</CardTitle>
                    <CardDescription>
                      Atualize suas informações pessoais básicas.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail</Label>
                      <Input
                        id="email"
                        type="email"
                        value={user.email || ''}
                        disabled
                        className="bg-muted"
                      />
                      <p className="text-sm text-muted-foreground">
                        O e-mail não pode ser alterado.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="name">Nome Completo</Label>
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Digite seu nome completo"
                      />
                    </div>

                    <Button 
                      onClick={updateProfile} 
                      disabled={loading.profile}
                      className="w-full sm:w-auto"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {loading.profile ? 'Salvando...' : 'Salvar Perfil'}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Alterar Senha</CardTitle>
                    <CardDescription>
                      Altere sua senha de acesso ao sistema.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Senha Atual</Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          type={showPasswords.current ? "text" : "password"}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                          placeholder="Digite sua senha atual"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                        >
                          {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword">Nova Senha</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showPasswords.new ? "text" : "password"}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                          placeholder="Digite sua nova senha"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                        >
                          {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showPasswords.confirm ? "text" : "password"}
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          placeholder="Confirme sua nova senha"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                        >
                          {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <Button 
                      onClick={changePassword} 
                      disabled={loading.password || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                      className="w-full sm:w-auto"
                    >
                      {loading.password ? 'Alterando...' : 'Alterar Senha'}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Sair da Conta</CardTitle>
                    <CardDescription>
                      Desconecte-se do sistema de forma segura.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="destructive" onClick={handleLogout} className="w-full sm:w-auto">
                      <LogOut className="w-4 h-4 mr-2" />
                      Sair
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Company Tab */}
            <TabsContent value="company">
              <Card>
                <CardHeader>
                  <CardTitle>Dados da Empresa</CardTitle>
                  <CardDescription>
                    Atualize as informações da sua empresa coletadas durante o onboarding.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Nome do Supermercado</Label>
                    <Input
                      id="companyName"
                      value={profileData.company_name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, company_name: e.target.value }))}
                      placeholder="Nome da sua empresa"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="revenue">Faturamento Anual</Label>
                      <Select
                        value={profileData.annual_revenue}
                        onValueChange={(value) => setProfileData(prev => ({ ...prev, annual_revenue: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o faturamento" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="até-1mi">Até R$ 1 milhão</SelectItem>
                          <SelectItem value="1mi-5mi">R$ 1 - 5 milhões</SelectItem>
                          <SelectItem value="5mi-10mi">R$ 5 - 10 milhões</SelectItem>
                          <SelectItem value="10mi-50mi">R$ 10 - 50 milhões</SelectItem>
                          <SelectItem value="acima-50mi">Acima de R$ 50 milhões</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="storeCount">Número de Lojas</Label>
                      <Select
                        value={profileData.store_count}
                        onValueChange={(value) => setProfileData(prev => ({ ...prev, store_count: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Número de lojas" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 loja</SelectItem>
                          <SelectItem value="2-5">2-5 lojas</SelectItem>
                          <SelectItem value="6-10">6-10 lojas</SelectItem>
                          <SelectItem value="11-25">11-25 lojas</SelectItem>
                          <SelectItem value="acima-25">Mais de 25 lojas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Áreas de Foco</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {focusAreaOptions.map((area) => (
                        <div key={area} className="flex items-center space-x-2">
                          <Checkbox
                            id={area}
                            checked={profileData.focus_areas.includes(area)}
                            onCheckedChange={(checked) => handleFocusAreaChange(area, checked as boolean)}
                          />
                          <Label htmlFor={area} className="text-sm font-normal">
                            {area}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experience">Nível de Experiência</Label>
                    <Select
                      value={profileData.experience_level}
                      onValueChange={(value) => setProfileData(prev => ({ ...prev, experience_level: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione seu nível" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="iniciante">Iniciante - Pouca experiência</SelectItem>
                        <SelectItem value="intermediario">Intermediário - Alguma experiência</SelectItem>
                        <SelectItem value="avancado">Avançado - Muita experiência</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="objective">Objetivo Principal</Label>
                    <Textarea
                      id="objective"
                      value={profileData.main_objective}
                      onChange={(e) => setProfileData(prev => ({ ...prev, main_objective: e.target.value }))}
                      placeholder="Descreva seu principal objetivo com o sistema"
                      rows={3}
                    />
                  </div>

                  <Button 
                    onClick={updateCompanyData} 
                    disabled={loading.company}
                    className="w-full sm:w-auto"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {loading.company ? 'Salvando...' : 'Salvar Dados da Empresa'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Subscription Tab */}
            <TabsContent value="subscription">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Plano Atual</CardTitle>
                    <CardDescription>
                      Informações sobre sua assinatura e faturamento.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {subscriptionLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-muted-foreground">Carregando informações da assinatura...</span>
                      </div>
                    ) : subscription ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">{subscription.plan.name}</h3>
                            <p className="text-muted-foreground">{subscription.plan.description}</p>
                          </div>
                          <Badge variant={
                            subscription.status === 'active' ? 'default' :
                            subscription.status === 'trialing' ? 'outline' : 'destructive'
                          }
                          className={
                            subscription.status === 'active' ? 'bg-success text-success-foreground' :
                            subscription.status === 'trialing' ? 'bg-warning/10 text-warning border-warning' : ''
                          }>
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
                              {format(
                                new Date(subscription.status === 'trialing' && subscription.trial_end 
                                  ? subscription.trial_end 
                                  : subscription.current_period_end
                                ),
                                'dd/MM/yyyy',
                                { locale: ptBR }
                              )}
                            </p>
                          </div>
                        </div>

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

export default Settings;