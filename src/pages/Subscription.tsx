import { useState } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Crown, Check, CreditCard, Calendar, Clock, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export default function Subscription() {
  const { subscription, plans, isTrialing, trialDaysLeft, loading } = useSubscription();
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubscribe = async (planId: string) => {
    setSelectedPlan(planId);
    
    try {
      const plan = plans.find(p => p.id === planId);
      if (!plan?.stripe_price_id) {
        toast({
          title: "Erro",
          description: "Plano não configurado corretamente. Entre em contato com o suporte.",
          variant: "destructive",
        });
        setSelectedPlan(null);
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { priceId: plan.stripe_price_id },
      });

      if (error) {
        console.error('Error creating checkout session:', error);
        toast({
          title: "Erro ao processar pagamento",
          description: error.message || "Não foi possível iniciar o processo de pagamento. Tente novamente.",
          variant: "destructive",
        });
        setSelectedPlan(null);
        return;
      }

      if (data?.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Error in handleSubscribe:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
      setSelectedPlan(null);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando planos...</p>
        </div>
      </div>
    );
  }

  const paidPlans = plans.filter(plan => plan.name !== 'Teste Gratuito');

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
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

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Escolha seu plano</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Desbloqueie todo o potencial do Nexmart e leve sua gestão mercadológica para o próximo nível
          </p>
        </div>

        {/* Current Plan Status */}
        {subscription && (
          <Card className="mb-8 border-primary">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Crown className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Plano Atual: {subscription.plan.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {isTrialing ? (
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {trialDaysLeft} dias restantes no teste
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Próxima cobrança: {new Date(subscription.current_period_end).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <Badge variant={isTrialing ? 'secondary' : 'default'}>
                  {isTrialing ? 'Teste' : 'Ativo'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {paidPlans.map((plan) => {
            const isCurrentPlan = subscription?.plan_id === plan.id;
            const isRecommended = plan.name === 'Pro';
            
            return (
              <Card key={plan.id} className={`relative overflow-hidden ${
                isRecommended ? 'border-primary shadow-lg scale-105' : ''
              } ${isCurrentPlan ? 'border-green-500 bg-green-50 dark:bg-green-900/10' : ''}`}>
                {isRecommended && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-sm font-medium">
                    Recomendado
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{formatPrice(plan.price_monthly)}</span>
                    <span className="text-muted-foreground">/mês</span>
                  </div>
                </CardHeader>
                
                <CardContent className="pb-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Separator className="my-4" />
                  
                  <div className="text-sm text-muted-foreground">
                    <p>Até {plan.max_users} usuário{plan.max_users > 1 ? 's' : ''}</p>
                  </div>
                </CardContent>
                
                <CardFooter>
                  {isCurrentPlan ? (
                    <Button disabled className="w-full">
                      <Crown className="h-4 w-4 mr-2" />
                      Plano Atual
                    </Button>
                  ) : isTrialing ? (
                    <Button 
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={selectedPlan === plan.id}
                      className="w-full"
                    >
                      {selectedPlan === plan.id ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Processando...
                        </div>
                      ) : (
                        <>
                          <CreditCard className="h-4 w-4 mr-2" />
                          Assinar Agora
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button 
                      variant="outline"
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={selectedPlan === plan.id}
                      className="w-full"
                    >
                      Fazer Upgrade
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* Features Comparison */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-center mb-8">Comparação de Funcionalidades</h2>
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4 font-medium">Funcionalidade</th>
                        <th className="text-center p-4 font-medium">Essencial</th>
                        <th className="text-center p-4 font-medium">Pro</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        'Dashboard Completo',
                        'Estrutura Mercadológica',
                        'Relatórios Básicos',
                        'Importação Padrão',
                        'Suporte por Email',
                        'Alertas Inteligentes',
                        'Relatórios Premium',
                        'Importação Avançada',
                        'Suporte Prioritário',
                        'Dashboard Avançado'
                      ].map((feature, index) => {
                        const inEssential = index < 5;
                        const inPro = true;
                        
                        return (
                          <tr key={feature} className="border-b">
                            <td className="p-4">{feature}</td>
                            <td className="text-center p-4">
                              {inEssential ? (
                                <Check className="h-5 w-5 text-green-500 mx-auto" />
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </td>
                            <td className="text-center p-4">
                              {inPro ? (
                                <Check className="h-5 w-5 text-green-500 mx-auto" />
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Perguntas Frequentes</h2>
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Posso cancelar a qualquer momento?</h3>
                <p className="text-sm text-muted-foreground">
                  Sim, você pode cancelar sua assinatura a qualquer momento. Você continuará tendo acesso 
                  até o final do período pago.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Como funciona o período de teste?</h3>
                <p className="text-sm text-muted-foreground">
                  Você tem 7 dias para testar todas as funcionalidades gratuitamente. 
                  Não é necessário cartão de crédito para começar.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Posso mudar de plano depois?</h3>
                <p className="text-sm text-muted-foreground">
                  Sim, você pode fazer upgrade ou downgrade do seu plano a qualquer momento. 
                  As mudanças entram em vigor no próximo ciclo de cobrança.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}