import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { ArrowUp, ArrowDown, HelpCircle, Maximize2 } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon: LucideIcon;
  className?: string;
  tooltip?: string;
  loading?: boolean;
  expandedContent?: React.ReactNode;
  details?: {
    label: string;
    value: string;
  }[];
}

export const KPICard = ({ 
  title, 
  value, 
  subtitle, 
  trend, 
  icon: Icon, 
  className, 
  tooltip, 
  loading = false,
  expandedContent,
  details
}: KPICardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (loading) {
    return (
      <Card className={cn("hover:shadow-md transition-shadow", className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4 rounded" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-3 w-20" />
        </CardContent>
      </Card>
    );
  }

  const hasExpandableContent = expandedContent || (details && details.length > 0);

  return (
    <TooltipProvider>
      <Card 
        className={cn(
          "hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group relative",
          hasExpandableContent && "cursor-pointer",
          className
        )}
        onClick={() => hasExpandableContent && setIsExpanded(true)}
      >
        {hasExpandableContent && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Maximize2 className="h-3 w-3 text-muted-foreground" />
          </div>
        )}
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-1.5">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {title}
            </CardTitle>
            {tooltip && (
              <Tooltip>
                <TooltipTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help hover:text-foreground transition-colors" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl md:text-3xl font-bold text-foreground mb-1">
            {value}
          </div>
          
          <div className="flex items-center justify-between gap-2">
            {subtitle && (
              <p className="text-xs text-muted-foreground truncate">
                {subtitle}
              </p>
            )}
            
            {trend && (
              <Tooltip>
                <TooltipTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <div className={cn(
                    "flex items-center text-xs font-medium shrink-0",
                    trend.isPositive ? "text-success" : "text-destructive"
                  )}>
                    {trend.isPositive ? (
                      <ArrowUp className="w-3 h-3 mr-1" />
                    ) : (
                      <ArrowDown className="w-3 h-3 mr-1" />
                    )}
                    {Math.abs(trend.value).toFixed(1)}%
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{trend.isPositive ? 'Crescimento' : 'Redução'} em relação ao período anterior</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon className="h-5 w-5 text-primary" />
              {title}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Main value */}
            <div className="text-center py-4 bg-muted/30 rounded-lg">
              <p className="text-4xl font-bold">{value}</p>
              {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
              {trend && (
                <div className={cn(
                  "flex items-center justify-center text-sm font-medium mt-2",
                  trend.isPositive ? "text-success" : "text-destructive"
                )}>
                  {trend.isPositive ? (
                    <ArrowUp className="w-4 h-4 mr-1" />
                  ) : (
                    <ArrowDown className="w-4 h-4 mr-1" />
                  )}
                  {Math.abs(trend.value).toFixed(1)}% vs período anterior
                </div>
              )}
            </div>

            {/* Details grid */}
            {details && details.length > 0 && (
              <div className="grid grid-cols-2 gap-4">
                {details.map((detail, i) => (
                  <div key={i} className="p-3 bg-muted/20 rounded-lg">
                    <p className="text-xs text-muted-foreground">{detail.label}</p>
                    <p className="font-semibold">{detail.value}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Custom expanded content */}
            {expandedContent}

            {/* Tooltip info */}
            {tooltip && (
              <div className="text-sm text-muted-foreground border-t pt-4">
                <p className="flex items-center gap-2">
                  <HelpCircle className="h-4 w-4" />
                  {tooltip}
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
};
