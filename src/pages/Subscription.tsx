import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Check, Loader2 } from 'lucide-react';


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
      if (!plan?.stripe_price_id) {
        toast({
          title: "Erro de Configuração",
          description: "O ID de preço deste plano não foi encontrado.",
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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-6xl">
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

        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Escolha seu Plano</h1>
          <p className="text-muted-foreground text-lg">
            Selecione o plano ideal para o seu supermercado
          </p>
          {subscription && (
            <Badge variant="secondary" className="mt-4">
              Plano Atual: {subscription.plan.name}
            </Badge>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {plans.map((plan) => {
            const isCurrentPlan = subscription?.plan_id === plan.id;
            const isLoading = selectedPlan === plan.id;

            return (
              <Card 
                key={plan.id} 
                className={`relative ${isCurrentPlan ? 'border-primary ring-2 ring-primary' : ''}`}
              >
                {isCurrentPlan && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge>Plano Atual</Badge>
                  </div>
                )}
                
                <CardHeader>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription className="text-lg">
                    <span className="text-3xl font-bold text-foreground">
                      R$ {plan.price_monthly.toFixed(2)}
                    </span>
                    /mês
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={isCurrentPlan || isLoading}
                    className="w-full"
                    variant={isCurrentPlan ? "outline" : "default"}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processando...
                      </>
                    ) : isCurrentPlan ? (
                      'Plano Ativo'
                    ) : (
                      'Assinar Agora'
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>
            Todos os pagamentos são processados de forma segura pelo Stripe.
          </p>
          <p className="mt-2">
            Você pode cancelar ou alterar seu plano a qualquer momento nas{' '}
            <button
              onClick={() => navigate('/settings')}
              className="text-primary hover:underline"
            >
              configurações
            </button>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
