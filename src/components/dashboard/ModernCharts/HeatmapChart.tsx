import React, { useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { GlassCard } from "@/components/ui/glass-card";
import { TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

interface HeatmapRow {
  row: string;
  columns: { column: string; value: number }[];
}

interface HeatmapChartProps {
  data: HeatmapRow[];
  title?: string;
  colorScale?: "success" | "warning" | "destructive" | "primary";
  className?: string;
  onCellClick?: (row: string, column: string, value: number) => void;
}

// Configuração de métricas com cores e limites específicos
const metricConfig: Record<string, {
  higherIsBetter: boolean;
  thresholds: { good: number; warning: number };
  unit: string;
  description: string;
}> = {
  Margem: { higherIsBetter: true, thresholds: { good: 18, warning: 12 }, unit: '%', description: 'Meta: ≥18%' },
  Ruptura: { higherIsBetter: false, thresholds: { good: 3, warning: 5 }, unit: '%', description: 'Meta: ≤3%' },
  Quebra: { higherIsBetter: false, thresholds: { good: 2, warning: 4 }, unit: '%', description: 'Meta: ≤2%' },
  Giro: { higherIsBetter: true, thresholds: { good: 80, warning: 60 }, unit: '%', description: 'Meta: ≥80%' },
  Marcas: { higherIsBetter: true, thresholds: { good: 70, warning: 50 }, unit: '%', description: 'Meta: ≥70%' },
};

export function HeatmapChart({
  data,
  title,
  className,
  onCellClick,
}: HeatmapChartProps) {
  const columns = data[0]?.columns.map(c => c.column) || [];

  // Calcula estatísticas por coluna para contextualização
  const columnStats = useMemo(() => {
    const stats: Record<string, { min: number; max: number; avg: number }> = {};
    columns.forEach(col => {
      const values = data.map(row => row.columns.find(c => c.column === col)?.value || 0);
      stats[col] = {
        min: Math.min(...values),
        max: Math.max(...values),
        avg: values.reduce((a, b) => a + b, 0) / values.length,
      };
    });
    return stats;
  }, [data, columns]);

  // Determina cor baseada na métrica e valor
  const getCellStyle = (column: string, value: number) => {
    const config = metricConfig[column];
    
    if (!config) {
      // Fallback para métricas não configuradas
      return {
        bgColor: 'hsl(var(--primary) / 0.3)',
        borderColor: 'hsl(var(--primary) / 0.5)',
        textColor: 'hsl(var(--foreground))',
        darkTextColor: 'hsl(var(--foreground))',
        status: 'neutral' as const,
      };
    }

    const { higherIsBetter, thresholds } = config;
    let status: 'good' | 'warning' | 'bad';

    if (higherIsBetter) {
      if (value >= thresholds.good) status = 'good';
      else if (value >= thresholds.warning) status = 'warning';
      else status = 'bad';
    } else {
      if (value <= thresholds.good) status = 'good';
      else if (value <= thresholds.warning) status = 'warning';
      else status = 'bad';
    }

    const styles = {
      good: {
        bgColor: 'hsl(142 76% 36% / 0.2)',
        borderColor: 'hsl(142 76% 36% / 0.5)',
        textColor: 'hsl(142 76% 30%)',
        darkTextColor: 'hsl(142 76% 65%)',
      },
      warning: {
        bgColor: 'hsl(38 92% 50% / 0.2)',
        borderColor: 'hsl(38 92% 50% / 0.5)',
        textColor: 'hsl(38 92% 35%)',
        darkTextColor: 'hsl(38 92% 65%)',
      },
      bad: {
        bgColor: 'hsl(0 84% 60% / 0.2)',
        borderColor: 'hsl(0 84% 60% / 0.5)',
        textColor: 'hsl(0 84% 40%)',
        darkTextColor: 'hsl(0 84% 70%)',
      },
    };

    return { ...styles[status], status };
  };

  // Ícone de status
  const StatusIcon = ({ status, size = 12 }: { status: string; size?: number }) => {
    switch (status) {
      case 'good':
        return <CheckCircle2 size={size} className="text-green-600 dark:text-green-400" />;
      case 'warning':
        return <AlertTriangle size={size} className="text-amber-600 dark:text-amber-400" />;
      case 'bad':
        return <XCircle size={size} className="text-red-600 dark:text-red-400" />;
      default:
        return <Minus size={size} className="text-muted-foreground" />;
    }
  };

  // Ícone de tendência
  const TrendIcon = ({ value, column }: { value: number; column: string }) => {
    const avg = columnStats[column]?.avg || 0;
    const diff = value - avg;
    const threshold = avg * 0.1; // 10% de diferença

    if (Math.abs(diff) < threshold) {
      return <Minus size={10} className="text-muted-foreground opacity-50" />;
    }
    if (diff > 0) {
      return <TrendingUp size={10} className="text-green-500" />;
    }
    return <TrendingDown size={10} className="text-red-500" />;
  };

  if (data.length === 0) {
    return (
      <GlassCard className={cn("p-4 w-full", className)}>
        <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
          Nenhum dado disponível
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className={cn("p-5 w-full", className)}>
      {title && (
        <div className="mb-5">
          <h3 className="text-base font-semibold text-foreground">
            {title}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Cores indicam desempenho: <span className="text-green-600 dark:text-green-400 font-medium">verde</span> = bom, 
            <span className="text-amber-600 dark:text-amber-400 font-medium ml-1">amarelo</span> = atenção, 
            <span className="text-red-600 dark:text-red-400 font-medium ml-1">vermelho</span> = crítico
          </p>
        </div>
      )}

      <div className="overflow-x-auto -mx-2 px-2">
        <div className="inline-block min-w-full">
          {/* Column headers com descrição */}
          <div className="flex ml-28 mb-3 gap-2">
            {columns.map((col) => {
              const config = metricConfig[col];
              return (
                <TooltipProvider key={col}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex-1 min-w-[80px] text-center cursor-help">
                        <div className="text-xs font-semibold text-foreground">
                          {col}
                        </div>
                        {config && (
                          <div className="text-[10px] text-muted-foreground mt-0.5">
                            {config.description}
                          </div>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <div className="text-xs">
                        <p className="font-medium">{col}</p>
                        {config && (
                          <>
                            <p className="text-muted-foreground mt-1">
                              {config.higherIsBetter ? 'Maior é melhor' : 'Menor é melhor'}
                            </p>
                            <p className="text-green-500">Bom: {config.higherIsBetter ? '≥' : '≤'}{config.thresholds.good}{config.unit}</p>
                            <p className="text-amber-500">Atenção: {config.higherIsBetter ? '≥' : '≤'}{config.thresholds.warning}{config.unit}</p>
                          </>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>

          {/* Heatmap grid */}
          <div className="space-y-2">
            {data.map((row, rowIndex) => (
              <div 
                key={row.row} 
                className={cn(
                  "flex items-center gap-2",
                  "animate-fade-in"
                )}
                style={{ animationDelay: `${rowIndex * 50}ms` }}
              >
                {/* Row label */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className="w-28 text-xs font-medium text-foreground truncate pr-2 text-right cursor-pointer hover:text-primary transition-colors"
                        title={row.row}
                        onClick={() => onCellClick?.(row.row, '', 0)}
                      >
                        {row.row}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                      <p className="text-xs font-medium">{row.row}</p>
                      <p className="text-xs text-muted-foreground">Clique para filtrar</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {/* Cells */}
                <div className="flex flex-1 gap-2">
                  {row.columns.map((cell) => {
                    const style = getCellStyle(cell.column, cell.value);
                    const config = metricConfig[cell.column];
                    
                    return (
                      <TooltipProvider key={`${row.row}-${cell.column}`}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              className={cn(
                                "flex-1 min-w-[80px] h-14 rounded-lg transition-all duration-200",
                                "flex flex-col items-center justify-center gap-0.5",
                                "hover:scale-[1.02] hover:shadow-md",
                                "focus:outline-none focus:ring-2 focus:ring-primary/50",
                                "border"
                              )}
                              style={{ 
                                backgroundColor: style.bgColor,
                                borderColor: style.borderColor,
                              }}
                              onClick={() => onCellClick?.(row.row, cell.column, cell.value)}
                            >
                              {/* Valor principal */}
                              <div className="flex items-center gap-1">
                                <span 
                                  className="text-sm font-bold"
                                  style={{ color: `var(--${style.status === 'good' ? 'success' : style.status === 'warning' ? 'warning' : 'destructive'}-text, ${style.textColor})` }}
                                >
                                  {cell.value.toFixed(1)}
                                  <span className="text-[10px] font-normal opacity-70">
                                    {config?.unit || '%'}
                                  </span>
                                </span>
                              </div>
                              
                              {/* Indicadores */}
                              <div className="flex items-center gap-1">
                                <StatusIcon status={style.status} size={10} />
                                <TrendIcon value={cell.value} column={cell.column} />
                              </div>
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-[200px]">
                            <div className="text-xs space-y-1">
                              <div className="flex items-center gap-2">
                                <StatusIcon status={style.status} size={14} />
                                <span className="font-semibold">{row.row}</span>
                              </div>
                              <div className="border-t border-border pt-1 mt-1">
                                <p className="text-muted-foreground">{cell.column}</p>
                                <p className="text-lg font-bold">{cell.value.toFixed(1)}{config?.unit || '%'}</p>
                              </div>
                              {config && (
                                <div className="text-muted-foreground border-t border-border pt-1">
                                  <p>Média geral: {columnStats[cell.column]?.avg.toFixed(1)}{config.unit}</p>
                                  <p>{config.description}</p>
                                </div>
                              )}
                              <p className="text-primary text-[10px] mt-1">Clique para filtrar</p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legenda melhorada */}
      <div className="flex flex-wrap items-center justify-center gap-4 mt-5 pt-4 border-t border-border">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-green-500/20 border border-green-500/50 flex items-center justify-center">
            <CheckCircle2 size={10} className="text-green-600" />
          </div>
          <span className="text-xs text-muted-foreground">Bom</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-amber-500/20 border border-amber-500/50 flex items-center justify-center">
            <AlertTriangle size={10} className="text-amber-600" />
          </div>
          <span className="text-xs text-muted-foreground">Atenção</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-red-500/20 border border-red-500/50 flex items-center justify-center">
            <XCircle size={10} className="text-red-600" />
          </div>
          <span className="text-xs text-muted-foreground">Crítico</span>
        </div>
        <div className="h-4 w-px bg-border mx-2" />
        <div className="flex items-center gap-1">
          <TrendingUp size={12} className="text-green-500" />
          <span className="text-xs text-muted-foreground">Acima da média</span>
        </div>
        <div className="flex items-center gap-1">
          <TrendingDown size={12} className="text-red-500" />
          <span className="text-xs text-muted-foreground">Abaixo da média</span>
        </div>
      </div>
    </GlassCard>
  );
}
