import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Link } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSubscription } from '@/hooks/useSubscription';


const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

const plans = [
  {
    name: 'Essencial',
    price: 'R$ 79,90',
    priceId: 'price_1PttZkRvxK3sE9t3jH5g7fX8', // IMPORTANTE: SUBSTITUA PELO SEU PRICE ID REAL DO STRIPE
    features: [
      'Dashboard com KPIs estratégicos',
      'Gestão da Estrutura Mercadológica',
      'Importação de dados via planilha',
      'Relatórios em PDF e Excel',
      'Suporte via e-mail',
    ],
  },
  {
    name: 'Pro',
    price: 'R$ 149,90',
    priceId: 'price_1PttaHRvxK3sE9t3bI7g6eZ9', // IMPORTANTE: SUBSTITUA PELO SEU PRICE ID REAL DO STRIPE
    features: [
      'Tudo do Essencial +',
      'Alertas Inteligentes (IA)',
      'Importação Avançada',
      'Benchmarks de Mercado (em breve)',
      'Suporte Prioritário via WhatsApp',
    ],
  },
];

const SubscriptionPage = () => {
  const { user } = useAuth();
  const { subscription, loading: subLoading } = useSubscription();
  const { toast } = useToast();
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState('');

  const handleSubscribe = async (priceId: string) => {
    if (!user) {
      toast({
        title: 'Ação necessária',
        description: 'Você precisa estar logado para assinar um plano.',
        variant: 'destructive',
      });
      return;
    }

    setLoading({ [priceId]: true });
    setError('');

    try {
      const { data, error: invokeError } = await supabase.functions.invoke('create-checkout-session', {
        body: { priceId },
      });

      if (invokeError) {
        const errorMessage = invokeError.context?.error?.message || invokeError.message || 'Falha ao iniciar o checkout.';
        throw new Error(errorMessage);
      }

      const { sessionId } = data;
      if (!sessionId) {
        throw new Error('ID da sessão de checkout não foi recebido do servidor.');
      }

      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe.js não foi carregado.');
      
      const { error: stripeError } = await stripe.redirectToCheckout({ sessionId });
      if (stripeError) {
        throw new Error(stripeError.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro inesperado.');
    } finally {
      setLoading({ [priceId]: false });
    }
  };

  if (subLoading) {
    return <div className="flex h-screen items-center justify-center">Carregando informações da assinatura...</div>;
  }

  if (subscription && subscription.status === 'active') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Você já tem uma assinatura ativa!</CardTitle>
            <CardDescription>
              Seu plano {subscription.plan.name} está ativo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link to="/dashboard">Ir para o Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 flex flex-col items-center justify-center">
        <Button 
          variant="ghost" 
          className="mb-4 text-muted-foreground hover:text-foreground self-start"
          asChild
        >
          <Link to="/dashboard">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para o Dashboard
          </Link>
        </Button>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Escolha seu Plano</h1>
        <p className="text-muted-foreground">Comece a transformar a gestão do seu supermercado hoje mesmo.</p>
      </div>
      
      {error && (
        <Alert variant="destructive" className="max-w-2xl mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
        {plans.map((plan) => (
          <Card key={plan.name} className="flex flex-col">
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.price}/mês</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 flex-grow flex flex-col">
              <ul className="space-y-2 flex-grow">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <CheckCircle className="w-4 h-4 mr-2 mt-1 text-success flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                className="w-full mt-4"
                onClick={() => handleSubscribe(plan.priceId)}
                disabled={loading[plan.priceId]}
              >
                {loading[plan.priceId] ? 'Aguarde...' : 'Assinar Plano'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SubscriptionPage;