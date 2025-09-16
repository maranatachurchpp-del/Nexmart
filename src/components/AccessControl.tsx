import { ReactNode } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Crown, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AccessControlProps {
  children: ReactNode;
  requiredFeature?: string;
  fallback?: ReactNode;
}

export function AccessControl({ children, requiredFeature, fallback }: AccessControlProps) {
  const { hasAccess, checkFeatureAccess, isTrialing, trialDaysLeft } = useSubscription();
  const navigate = useNavigate();

  // Check general access
  if (!hasAccess) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <Lock className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle>Acesso Expirado</CardTitle>
            <CardDescription>
              Seu período de teste expirou. Assine um plano para continuar usando o Nexmart.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => navigate('/subscription')} className="w-full">
              <Crown className="h-4 w-4 mr-2" />
              Ver Planos
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Check specific feature access
  if (requiredFeature && !checkFeatureAccess(requiredFeature)) {
    return fallback || (
      <Card className="max-w-md mx-auto text-center">
        <CardHeader>
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Crown className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Recurso Premium</CardTitle>
          <CardDescription>
            Esta funcionalidade está disponível apenas em planos pagos. 
            Faça upgrade para desbloquear.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button onClick={() => navigate('/subscription')} className="w-full">
            <ArrowRight className="h-4 w-4 mr-2" />
            Fazer Upgrade
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return <>{children}</>;
}

export function TrialWarning() {
  const { isTrialing, trialDaysLeft } = useSubscription();
  const navigate = useNavigate();

  if (!isTrialing || trialDaysLeft > 3) return null;

  return (
    <Card className="mb-6 border-orange-500 bg-orange-50 dark:bg-orange-900/10">
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-full">
            <Crown className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <h3 className="font-semibold">Teste expirando em breve</h3>
            <p className="text-sm text-muted-foreground">
              Restam apenas {trialDaysLeft} dias. Assine para continuar aproveitando.
            </p>
          </div>
        </div>
        <Button onClick={() => navigate('/subscription')}>
          Ver Planos
        </Button>
      </CardContent>
    </Card>
  );
}