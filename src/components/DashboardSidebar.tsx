import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useSubscription } from '@/hooks/useSubscription';
import { 
  LayoutDashboard, 
  FolderTree, 
  FileText, 
  Settings, 
  Shield, 
  ChevronLeft,
  ChevronRight,
  LogOut,
  CreditCard,
  Sparkles,
  BarChart3,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { useIsMobile } from '@/hooks/use-mobile';

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
  badge?: string;
  adminOnly?: boolean;
}

const mainNavItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: FolderTree, label: 'Estrutura', path: '/estrutura-mercadologica' },
  { icon: FileText, label: 'Relatórios', path: '/reports' },
];

const secondaryNavItems: NavItem[] = [
  { icon: Settings, label: 'Configurações', path: '/settings' },
  { icon: CreditCard, label: 'Assinatura', path: '/subscription' },
  { icon: Shield, label: 'Admin', path: '/admin', adminOnly: true },
];

interface DashboardSidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function DashboardSidebar({ mobileOpen = false, onMobileClose }: DashboardSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();
  const { isAdmin } = useUserRoles();
  const { isTrialing, trialDaysLeft } = useSubscription();
  const isMobile = useIsMobile();

  // Close mobile sidebar on navigation
  useEffect(() => {
    if (isMobile && onMobileClose) {
      onMobileClose();
    }
  }, [location.pathname]);

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile && onMobileClose) {
      onMobileClose();
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const NavButton = ({ item }: { item: NavItem }) => {
    if (item.adminOnly && !isAdmin) return null;

    const content = (
      <Button
        variant={isActive(item.path) ? "secondary" : "ghost"}
        className={cn(
          "w-full justify-start gap-3 transition-all duration-200",
          collapsed && !isMobile ? "px-3" : "px-4",
          isActive(item.path) && "bg-primary/10 text-primary border-l-2 border-primary rounded-l-none"
        )}
        onClick={() => handleNavigation(item.path)}
      >
        <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive(item.path) && "text-primary")} />
        {(!collapsed || isMobile) && (
          <>
            <span className="flex-1 text-left">{item.label}</span>
            {item.badge && (
              <Badge variant="secondary" className="ml-auto text-xs">
                {item.badge}
              </Badge>
            )}
          </>
        )}
      </Button>
    );

    if (collapsed && !isMobile) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right" className="flex items-center gap-2">
            {item.label}
            {item.badge && <Badge variant="secondary">{item.badge}</Badge>}
          </TooltipContent>
        </Tooltip>
      );
    }

    return content;
  };

  // Mobile overlay
  if (isMobile) {
    return (
      <>
        {/* Backdrop */}
        {mobileOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onMobileClose}
          />
        )}
        
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed left-0 top-0 z-50 h-screen bg-sidebar border-r border-sidebar-border transition-transform duration-300 flex flex-col w-72",
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {/* Mobile Header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-7 w-7 text-primary" />
              <span className="font-bold text-xl text-foreground">Nexmart</span>
            </div>
            <Button variant="ghost" size="icon" onClick={onMobileClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Trial Banner */}
          {isTrialing && (
            <div className="mx-3 mt-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-center gap-2 text-sm">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="font-medium text-primary">
                  {trialDaysLeft} dias restantes
                </span>
              </div>
              <Button 
                size="sm" 
                className="w-full mt-2 h-7 text-xs"
                onClick={() => handleNavigation('/subscription')}
              >
                Assinar agora
              </Button>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            <div className="space-y-1">
              <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Menu Principal
              </p>
              {mainNavItems.map((item) => (
                <NavButton key={item.path} item={item} />
              ))}
            </div>

            <Separator className="my-4" />

            <div className="space-y-1">
              <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Configurações
              </p>
              {secondaryNavItems.map((item) => (
                <NavButton key={item.path} item={item} />
              ))}
            </div>
          </nav>

          {/* Bottom */}
          <div className="p-3 border-t border-sidebar-border">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
              Sair
            </Button>
          </div>
        </aside>
      </>
    );
  }

  // Desktop sidebar
  return (
    <TooltipProvider>
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col hidden lg:flex",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Logo Section */}
        <div className={cn("flex items-center h-16 px-4 border-b border-sidebar-border", collapsed ? "justify-center" : "justify-between")}>
          {!collapsed && (
            <div className="flex items-center gap-2">
              <BarChart3 className="h-7 w-7 text-primary" />
              <span className="font-bold text-xl text-foreground">Nexmart</span>
            </div>
          )}
          {collapsed && <BarChart3 className="h-7 w-7 text-primary" />}
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-8 w-8", collapsed && "absolute -right-3 top-6 bg-background border shadow-sm")}
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Trial Banner Mini */}
        {isTrialing && !collapsed && (
          <div className="mx-3 mt-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-center gap-2 text-sm">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="font-medium text-primary">
                {trialDaysLeft} dias restantes
              </span>
            </div>
            <Button 
              size="sm" 
              className="w-full mt-2 h-7 text-xs"
              onClick={() => navigate('/subscription')}
            >
              Assinar agora
            </Button>
          </div>
        )}

        {/* Main Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <div className="space-y-1">
            {!collapsed && (
              <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Menu Principal
              </p>
            )}
            {mainNavItems.map((item) => (
              <NavButton key={item.path} item={item} />
            ))}
          </div>

          <Separator className="my-4" />

          <div className="space-y-1">
            {!collapsed && (
              <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Configurações
              </p>
            )}
            {secondaryNavItems.map((item) => (
              <NavButton key={item.path} item={item} />
            ))}
          </div>
        </nav>

        {/* Bottom Section */}
        <div className="p-3 border-t border-sidebar-border space-y-1">
          {collapsed ? (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="w-full" onClick={handleLogout}>
                  <LogOut className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Sair</TooltipContent>
            </Tooltip>
          ) : (
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
              Sair
            </Button>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}
