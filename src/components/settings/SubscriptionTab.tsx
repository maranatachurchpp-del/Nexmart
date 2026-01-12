import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SubscriptionData {
  status: string;
  current_period_end: string;
  plan: {
    name: string;
    description: string;
    price_monthly: number;
    features: string[];
  };
}

interface SubscriptionTabProps {
  subscription: SubscriptionData | null;
  isTrialing: boolean;
  trialDaysLeft: number;
  loadingPortal: boolean;
  onManageSubscription: () => void;
}

export const SubscriptionTab = ({
  subscription,
  isTrialing,
  trialDaysLeft,
  loadingPortal,
  onManageSubscription
}: SubscriptionTabProps) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
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
                onClick={onManageSubscription}
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
    </div>
  );
};
