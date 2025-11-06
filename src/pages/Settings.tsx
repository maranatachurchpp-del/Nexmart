import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, User, Building2, CreditCard, LogOut, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

export default function Settings() {
  const { user, signOut } = useAuth();
  const { subscription, isTrialing, trialDaysLeft } = useSubscription();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Profile state
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // Company state
  const [companyName, setCompanyName] = useState('');
  const [annualRevenue, setAnnualRevenue] = useState('');
  const [storeCount, setStoreCount] = useState('');
  const [focusAreas, setFocusAreas] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = useState('');
  const [mainObjective, setMainObjective] = useState('');
  const [savingCompany, setSavingCompany] = useState(false);

  // Subscription state
  const [loadingPortal, setLoadingPortal] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setName(data.name || '');
        setCompanyName(data.company_name || '');
        setAnnualRevenue(data.annual_revenue || '');
        setStoreCount(String(data.store_count || ''));
        setFocusAreas(data.focus_areas || []);
        setExperienceLevel(data.experience_level || '');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do perfil.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('profiles')
        .update({ name })
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o perfil.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    try {
      setChangingPassword(true);
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast({
        title: "Senha alterada",
        description: "Sua senha foi atualizada com sucesso.",
      });

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error changing password:', error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar a senha.",
        variant: "destructive",
      });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleUpdateCompany = async () => {
    try {
      setSavingCompany(true);
      const { error } = await supabase
        .from('profiles')
        .update({
          company_name: companyName,
          annual_revenue: annualRevenue,
          store_count: parseInt(storeCount) || 0,
          focus_areas: focusAreas,
          experience_level: experienceLevel,
        })
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "Dados da empresa atualizados",
        description: "As informações foram salvas com sucesso.",
      });
    } catch (error) {
      console.error('Error updating company data:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar os dados da empresa.",
        variant: "destructive",
      });
    } finally {
      setSavingCompany(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      setLoadingPortal(true);
      const { data, error } = await supabase.functions.invoke('create-customer-portal');

      if (error) {
        console.error('Error creating portal session:', error);
        toast({
          title: "Erro",
          description: error.message || "Não foi possível abrir o portal de gerenciamento.",
          variant: "destructive",
        });
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error in handleManageSubscription:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao acessar o portal de assinaturas.",
        variant: "destructive",
      });
    } finally {
      setLoadingPortal(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const toggleFocusArea = (area: string) => {
    setFocusAreas(prev =>
      prev.includes(area)
        ? prev.filter(a => a !== area)
        : [...prev, area]
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Configurações</h1>
          <p className="text-muted-foreground">
            Gerencie suas informações pessoais, dados da empresa e assinatura
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="company" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Empresa
            </TabsTrigger>
            <TabsTrigger value="subscription" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Assinatura
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações Pessoais</CardTitle>
                <CardDescription>
                  Atualize seus dados pessoais e de acesso
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-sm text-muted-foreground">
                    O e-mail não pode ser alterado
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome completo"
                  />
                </div>

                <Button onClick={handleUpdateProfile} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    'Salvar Alterações'
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Alterar Senha</CardTitle>
                <CardDescription>
                  Atualize sua senha de acesso
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">Nova Senha</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Digite a nova senha"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirme a nova senha"
                  />
                </div>

                <Button
                  onClick={handleChangePassword}
                  disabled={changingPassword || !newPassword || !confirmPassword}
                >
                  {changingPassword ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Alterando...
                    </>
                  ) : (
                    'Alterar Senha'
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <Button
                  variant="destructive"
                  onClick={handleSignOut}
                  className="w-full"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair da Conta
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Company Tab */}
          <TabsContent value="company" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Dados da Empresa</CardTitle>
                <CardDescription>
                  Informações sobre seu supermercado e operação
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Nome do Supermercado</Label>
                  <Input
                    id="company-name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Nome da sua empresa"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="revenue">Faturamento Anual</Label>
                    <Select value={annualRevenue} onValueChange={setAnnualRevenue}>
                      <SelectTrigger id="revenue">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0-10M">Até R$ 10 milhões</SelectItem>
                        <SelectItem value="10-50M">R$ 10 - 50 milhões</SelectItem>
                        <SelectItem value="50-100M">R$ 50 - 100 milhões</SelectItem>
                        <SelectItem value="100M+">Acima de R$ 100 milhões</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stores">Número de Lojas</Label>
                    <Select value={storeCount} onValueChange={setStoreCount}>
                      <SelectTrigger id="stores">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 loja</SelectItem>
                        <SelectItem value="2-5">2-5 lojas</SelectItem>
                        <SelectItem value="6-10">6-10 lojas</SelectItem>
                        <SelectItem value="10+">Mais de 10 lojas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Áreas de Foco</Label>
                  <div className="space-y-2">
                    {['Precificação', 'Ruptura', 'Margem', 'Competitividade'].map((area) => (
                      <div key={area} className="flex items-center space-x-2">
                        <Checkbox
                          id={area}
                          checked={focusAreas.includes(area)}
                          onCheckedChange={() => toggleFocusArea(area)}
                        />
                        <Label htmlFor={area} className="font-normal cursor-pointer">
                          {area}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience">Nível de Experiência</Label>
                  <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                    <SelectTrigger id="experience">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Iniciante</SelectItem>
                      <SelectItem value="intermediate">Intermediário</SelectItem>
                      <SelectItem value="advanced">Avançado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="objective">Objetivo Principal</Label>
                  <Select value={mainObjective} onValueChange={setMainObjective}>
                    <SelectTrigger id="objective">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="increase-margin">Aumentar margem</SelectItem>
                      <SelectItem value="reduce-rupture">Reduzir ruptura</SelectItem>
                      <SelectItem value="optimize-pricing">Otimizar precificação</SelectItem>
                      <SelectItem value="competitive-analysis">Análise competitiva</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleUpdateCompany} disabled={savingCompany}>
                  {savingCompany ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    'Salvar Alterações'
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscription Tab */}
          <TabsContent value="subscription" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Plano Atual</CardTitle>
                <CardDescription>
                  Gerencie sua assinatura e forma de pagamento
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {subscription ? (
                  <>
                    <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div>
                        <h3 className="font-semibold text-lg">{subscription.plan.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {subscription.plan.description}
                        </p>
                      </div>
                      <Badge variant={isTrialing ? 'secondary' : 'default'}>
                        {isTrialing ? 'Período de Teste' : 'Ativo'}
                      </Badge>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <span className="font-medium">
                          {subscription.status === 'active' && 'Ativo'}
                          {subscription.status === 'trialing' && 'Em teste'}
                          {subscription.status === 'canceled' && 'Cancelado'}
                          {subscription.status === 'past_due' && 'Pagamento pendente'}
                        </span>
                      </div>

                      {isTrialing ? (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Fim do teste:</span>
                          <span className="font-medium">
                            {trialDaysLeft} dia{trialDaysLeft !== 1 ? 's' : ''} restante{trialDaysLeft !== 1 ? 's' : ''}
                          </span>
                        </div>
                      ) : (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Próxima cobrança:</span>
                          <span className="font-medium">
                            {new Date(subscription.current_period_end).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Valor mensal:</span>
                        <span className="font-medium">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          }).format(subscription.plan.price_monthly)}
                        </span>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <h4 className="font-medium">Funcionalidades Incluídas:</h4>
                      <ul className="space-y-2">
                        {subscription.plan.features.map((feature, index) => (
                          <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Separator />

                    <Button
                      onClick={handleManageSubscription}
                      disabled={loadingPortal}
                      className="w-full"
                    >
                      {loadingPortal ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Carregando...
                        </>
                      ) : (
                        <>
                          <CreditCard className="mr-2 h-4 w-4" />
                          Gerenciar Assinatura
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-muted-foreground text-center">
                      Você será redirecionado para o portal seguro do Stripe onde poderá
                      atualizar seu cartão, visualizar faturas e gerenciar sua assinatura.
                    </p>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      Você não possui uma assinatura ativa.
                    </p>
                    <Button onClick={() => navigate('/subscription')}>
                      Ver Planos Disponíveis
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
