import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface OnboardingData {
  name: string;
  companyName: string;
  annualRevenue: string;
  storeCount: string;
  focusAreas: string[];
  experienceLevel: string;
  mainObjective: string;
}

const Onboarding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  const [data, setData] = useState<OnboardingData>({
    name: '',
    companyName: '',
    annualRevenue: '',
    storeCount: '',
    focusAreas: [],
    experienceLevel: '',
    mainObjective: ''
  });

  const totalSteps = 5;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFocusAreaChange = (area: string, checked: boolean) => {
    if (checked) {
      setData(prev => ({ ...prev, focusAreas: [...prev.focusAreas, area] }));
    } else {
      setData(prev => ({ ...prev, focusAreas: prev.focusAreas.filter(a => a !== area) }));
    }
  };

  const handleFinish = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Atualizar profile (já foi criado automaticamente pelo trigger)
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: data.name,
          company_name: data.companyName,
          annual_revenue: data.annualRevenue,
          store_count: parseInt(String(data.storeCount)) || 0,
          focus_areas: data.focusAreas,
          experience_level: data.experienceLevel,
        })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      // Criar produtos sample automaticamente
      const { error: sampleError } = await supabase.rpc('create_sample_produtos', {
        target_user_id: user.id
      });

      if (sampleError) {
        console.warn('Aviso ao criar produtos sample:', sampleError);
        // Não bloqueia o fluxo se produtos já existem
      }

      toast({
        title: "Configuração concluída!",
        description: "Seu perfil foi criado com sucesso. Bem-vindo ao Mercadológico SaaS!",
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar suas configurações. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-primary mb-4" />
              <CardTitle className="text-2xl">Bem-vindo ao Mercadológico SaaS!</CardTitle>
              <CardDescription>
                Vamos configurar seu mercado em 2 minutos para personalizar sua experiência.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleNext} className="w-full">
                Começar Configuração <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        );

      case 1:
        return (
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Informações do Mercado</CardTitle>
              <CardDescription>Nos conte sobre seu supermercado</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Seu Nome</Label>
                <Input
                  id="name"
                  value={data.name}
                  onChange={(e) => setData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Digite seu nome"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="company">Nome do Supermercado</Label>
                <Input
                  id="company"
                  value={data.companyName}
                  onChange={(e) => setData(prev => ({ ...prev, companyName: e.target.value }))}
                  placeholder="Ex: Supermercado São José"
                />
              </div>

              <div className="space-y-3">
                <Label>Faturamento Anual</Label>
                <RadioGroup 
                  value={data.annualRevenue} 
                  onValueChange={(value) => setData(prev => ({ ...prev, annualRevenue: value }))}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="until-1m" id="until-1m" />
                    <Label htmlFor="until-1m">Até R$ 1 milhão</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1m-4m" id="1m-4m" />
                    <Label htmlFor="1m-4m">Entre R$ 1M e R$ 4M</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="above-4m" id="above-4m" />
                    <Label htmlFor="above-4m">Acima de R$ 4M</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label>Número de Lojas</Label>
                <RadioGroup 
                  value={data.storeCount} 
                  onValueChange={(value) => setData(prev => ({ ...prev, storeCount: value }))}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1" id="store-1" />
                    <Label htmlFor="store-1">1 loja</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="2-5" id="store-2-5" />
                    <Label htmlFor="store-2-5">2 a 5 lojas</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="6+" id="store-6+" />
                    <Label htmlFor="store-6+">6 ou mais lojas</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={handlePrevious} className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                </Button>
                <Button 
                  onClick={handleNext} 
                  className="w-full"
                  disabled={!data.name || !data.companyName || !data.annualRevenue || !data.storeCount}
                >
                  Próximo <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Perfil Operacional</CardTitle>
              <CardDescription>Defina suas prioridades e nível de experiência</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Quais áreas você quer controlar primeiro?</Label>
                {['Margens', 'Rupturas', 'Mix de Marcas', 'Preços Médios'].map((area) => (
                  <div key={area} className="flex items-center space-x-2">
                    <Checkbox
                      id={area}
                      checked={data.focusAreas.includes(area)}
                      onCheckedChange={(checked) => handleFocusAreaChange(area, checked as boolean)}
                    />
                    <Label htmlFor={area}>{area}</Label>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <Label>Nível de experiência em gestão mercadológica</Label>
                <RadioGroup 
                  value={data.experienceLevel} 
                  onValueChange={(value) => setData(prev => ({ ...prev, experienceLevel: value }))}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="basic" id="basic" />
                    <Label htmlFor="basic">Básico</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="intermediate" id="intermediate" />
                    <Label htmlFor="intermediate">Intermediário</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="advanced" id="advanced" />
                    <Label htmlFor="advanced">Avançado</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={handlePrevious} className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                </Button>
                <Button 
                  onClick={handleNext} 
                  className="w-full"
                  disabled={data.focusAreas.length === 0 || !data.experienceLevel}
                >
                  Próximo <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Objetivo Principal</CardTitle>
              <CardDescription>Qual é sua prioridade para este ano?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <RadioGroup 
                  value={data.mainObjective} 
                  onValueChange={(value) => setData(prev => ({ ...prev, mainObjective: value }))}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="increase-profit" id="increase-profit" />
                    <Label htmlFor="increase-profit">Aumentar Lucro</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="reduce-losses" id="reduce-losses" />
                    <Label htmlFor="reduce-losses">Reduzir Perdas</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="improve-mix" id="improve-mix" />
                    <Label htmlFor="improve-mix">Melhorar Mix</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="organize-structure" id="organize-structure" />
                    <Label htmlFor="organize-structure">Organizar Estrutura Mercadológica</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={handlePrevious} className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                </Button>
                <Button 
                  onClick={handleNext} 
                  className="w-full"
                  disabled={!data.mainObjective}
                >
                  Finalizar <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 4:
        return (
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-primary mb-4" />
              <CardTitle>Configuração Finalizada!</CardTitle>
              <CardDescription>Revise suas informações antes de continuar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div><strong>Nome:</strong> {data.name}</div>
                <div><strong>Supermercado:</strong> {data.companyName}</div>
                <div><strong>Faturamento:</strong> {data.annualRevenue}</div>
                <div><strong>Lojas:</strong> {data.storeCount}</div>
                <div><strong>Áreas de Foco:</strong> {data.focusAreas.join(', ')}</div>
                <div><strong>Experiência:</strong> {data.experienceLevel}</div>
                <div><strong>Objetivo:</strong> {data.mainObjective}</div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={handlePrevious} className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                </Button>
                <Button 
                  onClick={handleFinish} 
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? 'Salvando...' : 'Finalizar e Ir para o Dashboard'}
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-primary/10 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl mb-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Configuração Inicial
          </h1>
          <p className="text-muted-foreground">
            Passo {currentStep + 1} de {totalSteps}
          </p>
        </div>
        
        <Progress value={progress} className="w-full mb-8" />
      </div>

      {renderStep()}
    </div>
  );
};

export default Onboarding;