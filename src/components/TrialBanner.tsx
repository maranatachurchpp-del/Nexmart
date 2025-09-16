import { useState } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Crown, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function TrialBanner() {
  const { isTrialing, trialDaysLeft, subscription } = useSubscription();
  const [dismissed, setDismissed] = useState(false);
  const navigate = useNavigate();

  if (!isTrialing || dismissed || !subscription) return null;

  const isLastDay = trialDaysLeft <= 1;
  const isExpiringSoon = trialDaysLeft <= 3;

  return (
    <Card className={`relative mb-6 border-2 ${
      isLastDay 
        ? 'border-destructive bg-destructive/5' 
        : isExpiringSoon 
        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/10' 
        : 'border-primary bg-primary/5'
    }`}>
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${
            isLastDay 
              ? 'bg-destructive/10' 
              : isExpiringSoon 
              ? 'bg-orange-100 dark:bg-orange-900/20' 
              : 'bg-primary/10'
          }`}>
            {isLastDay ? (
              <Clock className="h-5 w-5 text-destructive" />
            ) : (
              <Crown className="h-5 w-5 text-primary" />
            )}
          </div>
          
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-foreground">
                {isLastDay ? 'Último dia de teste!' : 'Período de teste ativo'}
              </h3>
              <Badge variant={isLastDay ? 'destructive' : isExpiringSoon ? 'secondary' : 'default'}>
                {trialDaysLeft} {trialDaysLeft === 1 ? 'dia restante' : 'dias restantes'}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {isLastDay 
                ? 'Seu teste expira hoje. Assine agora para continuar aproveitando todas as funcionalidades.' 
                : `Você tem ${trialDaysLeft} dias para explorar todas as funcionalidades do Nexmart.`
              }
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => navigate('/subscription')}
            className={isLastDay ? 'bg-destructive hover:bg-destructive/90' : ''}
          >
            {isLastDay ? 'Assinar Agora' : 'Ver Planos'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDismissed(true)}
            className="p-1 h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}