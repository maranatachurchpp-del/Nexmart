import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ArrowLeft, Check, Loader2, HelpCircle, Shield, Sparkles, Building2, Users, Zap } from 'lucide-react';

const planIcons: Record<string, React.ReactNode> = {
  'Teste Gratuito': <Zap className="h-6 w-6" />,
  'Básico': <Users className="h-6 w-6" />,
  'Profissional': <Sparkles className="h-6 w-6" />,
  'Empresarial': <Building2 className="h-6 w-6" />,
};

const planHighlights: Record<string, string> = {
  'Teste Gratuito': 'Ideal para conhecer a plataforma',
  'Básico': 'Para pequenos mercados',
  'Profissional': 'Mais popular',
  'Empresarial': 'Para redes de supermercados',
};

export default function Subscription() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { subscription, plans, loading } = useSubscription();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handleSubscribe = async (planId: string) => {
    setSelectedPlan(planId);
    
    try {
      const plan = plans.find(p => p.id === planId);
      
      // Se for o plano gratuito, apenas mostra mensagem
      if (plan?.price_monthly === 0) {
        toast({
          title: "Plano Gratuito",
          description: "Você já está no período de teste. Aproveite!",
        });
        setSelectedPlan(null);
        return;
      }
      
      if (!plan?.stripe_price_id) {
        toast({
          title: "Configuração Pendente",
          description: "Este plano ainda não está disponível para assinatura. Configure o Stripe Price ID.",
          variant: "destructive",
        });
        setSelectedPlan(null);
        return;
      }

      const { data, error: invokeError } = await supabase.functions.invoke('create-checkout-session', {
        body: { priceId: plan.stripe_price_id },
      });

      if (invokeError || (data && data.error)) {
        const errorMessage = data?.error?.message || invokeError?.message || "Falha ao iniciar o checkout.";
        throw new Error(errorMessage);
      }

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('Resposta inválida do servidor.');
      }

    } catch (error) {
      console.error('Erro em handleSubscribe:', error);
      toast({
        title: "Erro ao Assinar",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
      setSelectedPlan(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando planos...</p>
        </div>
      </div>
    );
  }

  const isProfessional = (name: string) => name === 'Profissional';

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8 px-4 max-w-7xl">
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

          <div className="mb-10 text-center">
            <h1 className="text-4xl font-bold mb-4">Escolha seu Plano</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Selecione o plano ideal para o seu supermercado. Todos os planos incluem 7 dias de teste gratuito.
            </p>
            {subscription && (
              <Badge variant="secondary" className="mt-4 text-sm px-4 py-1">
                Plano Atual: {subscription.plan.name}
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
            {plans.map((plan) => {
              const isCurrentPlan = subscription?.plan_id === plan.id;
              const isLoading = selectedPlan === plan.id;
              const isPro = isProfessional(plan.name);
              const isFree = plan.price_monthly === 0;

              return (
                <Card 
                  key={plan.id} 
                  className={`relative flex flex-col transition-all duration-200 hover:shadow-lg ${
                    isCurrentPlan 
                      ? 'border-primary ring-2 ring-primary shadow-lg' 
                      : isPro 
                        ? 'border-primary/50 shadow-md' 
                        : ''
                  }`}
                >
                  {/* Badge de status */}
                  {isCurrentPlan && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                      <Badge className="bg-primary text-primary-foreground shadow-sm">
                        Plano Atual
                      </Badge>
                    </div>
                  )}
                  {isPro && !isCurrentPlan && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                      <Badge variant="secondary" className="bg-primary/10 text-primary border border-primary/20">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Mais Popular
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center pb-4">
                    <div className="flex justify-center mb-3 text-primary">
                      {planIcons[plan.name]}
                    </div>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <CardDescription className="text-sm min-h-[40px]">
                      {planHighlights[plan.name] || plan.description}
                    </CardDescription>
                    <div className="pt-2">
                      <span className="text-4xl font-bold text-foreground">
                        R$ {plan.price_monthly.toFixed(2).replace('.', ',')}
                      </span>
                      <span className="text-muted-foreground text-sm">/mês</span>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="flex-1 flex flex-col">
                    <div className="space-y-3 flex-1 mb-6">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <Button
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={isCurrentPlan || isLoading}
                      className="w-full"
                      variant={isCurrentPlan ? "outline" : isPro ? "default" : "secondary"}
                      size="lg"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processando...
                        </>
                      ) : isCurrentPlan ? (
                        'Plano Ativo'
                      ) : isFree ? (
                        'Teste Gratuito'
                      ) : (
                        'Assinar Agora'
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Comparação de recursos */}
          <div className="bg-muted/30 rounded-xl p-8 mb-12">
            <h2 className="text-2xl font-bold text-center mb-6">Comparação de Recursos</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Recurso</th>
                    <th className="text-center py-3 px-4 font-medium">Teste</th>
                    <th className="text-center py-3 px-4 font-medium">Básico</th>
                    <th className="text-center py-3 px-4 font-medium text-primary">Profissional</th>
                    <th className="text-center py-3 px-4 font-medium">Empresarial</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr className="border-b">
                    <td className="py-3 px-4">Estrutura Mercadológica</td>
                    <td className="text-center py-3 px-4"><Check className="h-4 w-4 text-primary mx-auto" /></td>
                    <td className="text-center py-3 px-4"><Check className="h-4 w-4 text-primary mx-auto" /></td>
                    <td className="text-center py-3 px-4"><Check className="h-4 w-4 text-primary mx-auto" /></td>
                    <td className="text-center py-3 px-4"><Check className="h-4 w-4 text-primary mx-auto" /></td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Dashboard</td>
                    <td className="text-center py-3 px-4">Completo</td>
                    <td className="text-center py-3 px-4">Básico</td>
                    <td className="text-center py-3 px-4">Avançado</td>
                    <td className="text-center py-3 px-4">Avançado</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Alertas Inteligentes AI</td>
                    <td className="text-center py-3 px-4"><Check className="h-4 w-4 text-primary mx-auto" /></td>
                    <td className="text-center py-3 px-4 text-muted-foreground">—</td>
                    <td className="text-center py-3 px-4"><Check className="h-4 w-4 text-primary mx-auto" /></td>
                    <td className="text-center py-3 px-4"><Check className="h-4 w-4 text-primary mx-auto" /></td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Relatórios</td>
                    <td className="text-center py-3 px-4"><Check className="h-4 w-4 text-primary mx-auto" /></td>
                    <td className="text-center py-3 px-4"><Check className="h-4 w-4 text-primary mx-auto" /></td>
                    <td className="text-center py-3 px-4"><Check className="h-4 w-4 text-primary mx-auto" /></td>
                    <td className="text-center py-3 px-4"><Check className="h-4 w-4 text-primary mx-auto" /></td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Exportação</td>
                    <td className="text-center py-3 px-4">Limitada</td>
                    <td className="text-center py-3 px-4">Limitada</td>
                    <td className="text-center py-3 px-4">Ilimitada</td>
                    <td className="text-center py-3 px-4">Ilimitada</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">API Access</td>
                    <td className="text-center py-3 px-4 text-muted-foreground">—</td>
                    <td className="text-center py-3 px-4 text-muted-foreground">—</td>
                    <td className="text-center py-3 px-4"><Check className="h-4 w-4 text-primary mx-auto" /></td>
                    <td className="text-center py-3 px-4"><Check className="h-4 w-4 text-primary mx-auto" /></td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Usuários</td>
                    <td className="text-center py-3 px-4">1</td>
                    <td className="text-center py-3 px-4">1</td>
                    <td className="text-center py-3 px-4">3</td>
                    <td className="text-center py-3 px-4">Ilimitados</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Multi-lojas</td>
                    <td className="text-center py-3 px-4 text-muted-foreground">—</td>
                    <td className="text-center py-3 px-4 text-muted-foreground">—</td>
                    <td className="text-center py-3 px-4 text-muted-foreground">—</td>
                    <td className="text-center py-3 px-4"><Check className="h-4 w-4 text-primary mx-auto" /></td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">White Label</td>
                    <td className="text-center py-3 px-4 text-muted-foreground">—</td>
                    <td className="text-center py-3 px-4 text-muted-foreground">—</td>
                    <td className="text-center py-3 px-4 text-muted-foreground">—</td>
                    <td className="text-center py-3 px-4"><Check className="h-4 w-4 text-primary mx-auto" /></td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Consultoria Mensal</td>
                    <td className="text-center py-3 px-4 text-muted-foreground">—</td>
                    <td className="text-center py-3 px-4 text-muted-foreground">—</td>
                    <td className="text-center py-3 px-4 text-muted-foreground">—</td>
                    <td className="text-center py-3 px-4"><Check className="h-4 w-4 text-primary mx-auto" /></td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Suporte</td>
                    <td className="text-center py-3 px-4">Email</td>
                    <td className="text-center py-3 px-4">Email</td>
                    <td className="text-center py-3 px-4">Prioritário</td>
                    <td className="text-center py-3 px-4">24/7 + SLA</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="text-center text-sm text-muted-foreground space-y-3">
            <div className="flex items-center justify-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <p>Todos os pagamentos são processados de forma segura pelo Stripe.</p>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Seus dados de pagamento são processados pelo Stripe, líder mundial em segurança de pagamentos online. Não armazenamos informações de cartão.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <p>
              Você pode cancelar ou alterar seu plano a qualquer momento nas{' '}
              <button
                onClick={() => navigate('/settings')}
                className="text-primary hover:underline font-medium"
              >
                configurações
              </button>
              .
            </p>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
