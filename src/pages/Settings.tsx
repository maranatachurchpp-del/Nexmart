import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, User, Building2, CreditCard, Bell, Loader2 } from 'lucide-react';
import { AlertConfigPanel } from '@/components/alerts/AlertConfigPanel';
import { ProfileTab } from '@/components/settings/ProfileTab';
import { CompanyTab } from '@/components/settings/CompanyTab';
import { SubscriptionTab } from '@/components/settings/SubscriptionTab';

export default function Settings() {
  const { user, signOut } = useAuth();
  const { subscription, isTrialing, trialDaysLeft } = useSubscription();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Profile state
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Password state
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

    if (newPassword.length < 8) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 8 caracteres, uma letra maiúscula e um número.",
        variant: "destructive",
      });
      return;
    }

    // Validate password strength
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasNumber = /\d/.test(newPassword);
    if (!hasUpperCase || !hasNumber) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 8 caracteres, uma letra maiúscula e um número.",
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Perfil</span>
            </TabsTrigger>
            <TabsTrigger value="company" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">Empresa</span>
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Alertas</span>
            </TabsTrigger>
            <TabsTrigger value="subscription" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Assinatura</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <ProfileTab
              user={user}
              name={name}
              setName={setName}
              loading={loading}
              newPassword={newPassword}
              setNewPassword={setNewPassword}
              confirmPassword={confirmPassword}
              setConfirmPassword={setConfirmPassword}
              changingPassword={changingPassword}
              onUpdateProfile={handleUpdateProfile}
              onChangePassword={handleChangePassword}
              onSignOut={handleSignOut}
            />
          </TabsContent>

          <TabsContent value="company">
            <CompanyTab
              companyName={companyName}
              setCompanyName={setCompanyName}
              annualRevenue={annualRevenue}
              setAnnualRevenue={setAnnualRevenue}
              storeCount={storeCount}
              setStoreCount={setStoreCount}
              focusAreas={focusAreas}
              toggleFocusArea={toggleFocusArea}
              experienceLevel={experienceLevel}
              setExperienceLevel={setExperienceLevel}
              mainObjective={mainObjective}
              setMainObjective={setMainObjective}
              savingCompany={savingCompany}
              onUpdateCompany={handleUpdateCompany}
            />
          </TabsContent>

          <TabsContent value="alerts">
            <AlertConfigPanel />
          </TabsContent>

          <TabsContent value="subscription">
            <SubscriptionTab
              subscription={subscription}
              isTrialing={isTrialing}
              trialDaysLeft={trialDaysLeft}
              loadingPortal={loadingPortal}
              onManageSubscription={handleManageSubscription}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
