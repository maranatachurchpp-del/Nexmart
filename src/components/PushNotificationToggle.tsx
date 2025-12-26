import { Bell, BellOff, BellRing } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { cn } from '@/lib/utils';

export const PushNotificationToggle = () => {
  const { isSupported, permission, isSubscribed, requestPermission } = usePushNotifications();

  if (!isSupported) {
    return null;
  }

  const getIcon = () => {
    if (permission === 'granted' && isSubscribed) {
      return <BellRing className="h-4 w-4 text-success" />;
    }
    if (permission === 'denied') {
      return <BellOff className="h-4 w-4 text-destructive" />;
    }
    return <Bell className="h-4 w-4" />;
  };

  const getTooltipContent = () => {
    if (permission === 'granted' && isSubscribed) {
      return 'Notificações push ativadas';
    }
    if (permission === 'denied') {
      return 'Notificações bloqueadas - ative nas configurações do navegador';
    }
    return 'Clique para ativar notificações push';
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={permission !== 'granted' ? requestPermission : undefined}
            className={cn(
              "relative",
              permission === 'granted' && isSubscribed && "border-success/50"
            )}
            disabled={permission === 'denied'}
          >
            {getIcon()}
            {permission === 'granted' && isSubscribed && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-success rounded-full animate-pulse" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{getTooltipContent()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
