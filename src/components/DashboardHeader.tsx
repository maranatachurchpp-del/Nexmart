import { useAuth } from '@/hooks/useAuth';
import { NotificationsDropdown } from '@/components/NotificationsDropdown';
import { ThemeToggle } from '@/components/ThemeToggle';
import { RealtimeIndicator } from '@/components/dashboard/RealtimeIndicator';
import { ExportMenu } from '@/components/ExportMenu';
import { Button } from '@/components/ui/button';
import { Upload, Menu } from 'lucide-react';
import { Produto, DashboardFilters } from '@/types/mercadologico';

interface DashboardHeaderProps {
  isConnected: boolean;
  lastUpdate: Date | null;
  produtos: Produto[];
  filters: DashboardFilters;
  onImportClick: () => void;
  onMenuClick?: () => void;
  showMenuButton?: boolean;
}

export function DashboardHeader({
  isConnected,
  lastUpdate,
  produtos,
  filters,
  onImportClick,
  onMenuClick,
  showMenuButton = false,
}: DashboardHeaderProps) {
  const { user } = useAuth();

  return (
    <header className="h-14 border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-30 flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-3">
        {showMenuButton && (
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <div className="flex items-center gap-2">
          <RealtimeIndicator isConnected={isConnected} lastUpdate={lastUpdate} />
          <span className="text-sm text-muted-foreground hidden sm:inline">
            {user?.email?.split('@')[0]}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <NotificationsDropdown />
        <ExportMenu produtos={produtos} filters={filters} />
        <Button 
          variant="default" 
          size="sm" 
          onClick={onImportClick}
          className="hidden sm:flex"
        >
          <Upload className="w-4 h-4 mr-2" />
          Importar
        </Button>
        <Button 
          variant="default" 
          size="icon" 
          onClick={onImportClick}
          className="sm:hidden"
        >
          <Upload className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
}
