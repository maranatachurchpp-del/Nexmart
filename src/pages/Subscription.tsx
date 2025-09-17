import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { CheckCircle, ArrowLeft, CreditCard } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Link } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSubscription } from '@/hooks/useSubscription';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

const plans = [
  {
    id: 'price_1PttZkRvxK3sE9t3jH5g7fX8', // IMPORTANTE: VERIFIQUE SE ESTE É SEU PRICE ID CORRETO
    name: 'Essencial',
    price: 79.90,
    features: [
      'Dashboard com KPIs estratégicos',
      'Gestão da Estrutura Mercadológica',
      'Importação de dados via planilha',
      'Relatórios em PDF e Excel',
      'Suporte via e-mail',
    ],
  },
  {
    id: 'price_1PttaHRvxK3sE9t3bI7g6eZ9', // IMPORTANTE: VERIFIQUE SE ESTE É SEU PRICE ID CORRETO
    name: 'Pro',
    price: 149.90,
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
      if (!sessionId) throw new Error('ID da sessão de checkout não foi recebido do servidor.');

      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe.js não foi carregado.');
      
      await stripe.redirectToCheckout({ sessionId });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro inesperado.');
    } finally {
      setLoading({ [priceId]: false });
    }
  };
  
  const formatPrice = (price: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);

  if (subLoading) {
    return <div className="flex h-screen items-center justify-center">Carregando...</div>;
  }

  if (subscription && subscription.status === 'active') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Você já tem uma assinatura ativa!</CardTitle>
            <CardDescription>Seu plano {subscription.plan.name} está ativo.</CardDescription>
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
      <div className="w-full max-w-4xl">
        <Button variant="ghost" className="mb-8 text-muted-foreground hover:text-foreground" asChild>
          <Link to="/dashboard">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para o Dashboard
          </Link>
        </Button>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Escolha seu Plano</h1>
          <p className="text-muted-foreground">Comece a transformar a gestão do seu supermercado.</p>
        </div>
      
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          {plans.map((plan) => (
            <Card key={plan.name} className={`flex flex-col ${plan.name === 'Pro' ? 'border-primary' : ''}`}>
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{formatPrice(plan.price)}/mês</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 flex-grow">
                <ul className="space-y-2">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <CheckCircle className="w-4 h-4 mr-2 mt-1 text-success flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={loading[plan.id]}
                  variant={plan.name === 'Pro' ? 'default' : 'outline'}
                >
                  {loading[plan.id] ? 'Aguarde...' : <><CreditCard className="h-4 w-4 mr-2" />Assinar Plano</>}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
