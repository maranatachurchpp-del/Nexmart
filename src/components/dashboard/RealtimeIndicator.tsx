import { Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface RealtimeIndicatorProps {
  isConnected: boolean;
  lastUpdate?: Date;
}

export const RealtimeIndicator = ({ isConnected, lastUpdate }: RealtimeIndicatorProps) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all",
            isConnected 
              ? "bg-success/10 text-success border border-success/20" 
              : "bg-destructive/10 text-destructive border border-destructive/20"
          )}>
            <div className={cn(
              "w-2 h-2 rounded-full animate-pulse",
              isConnected ? "bg-success" : "bg-destructive"
            )} />
            {isConnected ? (
              <>
                <Wifi className="h-4 w-4" />
                <span className="hidden sm:inline">Tempo Real</span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4" />
                <span className="hidden sm:inline">Desconectado</span>
              </>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {isConnected 
              ? `Conectado - Última atualização: ${lastUpdate ? formatTime(lastUpdate) : 'N/A'}`
              : 'Reconectando ao servidor...'
            }
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
