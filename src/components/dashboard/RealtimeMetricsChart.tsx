import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Line,
  ComposedChart
} from 'recharts';
import { Activity, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RealtimeMetricsChartProps {
  metrics: {
    totalProducts: number;
    averageMargin: number;
    alertCount: number;
    revenueParticipation: number;
    criticalProducts: number;
    warningProducts: number;
    successProducts: number;
    lastUpdate: Date;
  };
  isConnected: boolean;
}

interface DataPoint {
  time: string;
  timestamp: number;
  margin: number;
  alerts: number;
  products: number;
}

export const RealtimeMetricsChart = ({ metrics, isConnected }: RealtimeMetricsChartProps) => {
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);
  const [previousMargin, setPreviousMargin] = useState(0);

  useEffect(() => {
    const now = new Date();
    const newPoint: DataPoint = {
      time: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      timestamp: now.getTime(),
      margin: metrics.averageMargin,
      alerts: metrics.alertCount,
      products: metrics.totalProducts
    };

    setDataPoints(prev => {
      // Keep last 20 data points for smooth visualization
      const updated = [...prev, newPoint].slice(-20);
      return updated;
    });

    setPreviousMargin(metrics.averageMargin);
  }, [metrics.lastUpdate]);

  const marginTrend = useMemo(() => {
    if (dataPoints.length < 2) return 0;
    const last = dataPoints[dataPoints.length - 1]?.margin || 0;
    const prev = dataPoints[dataPoints.length - 2]?.margin || 0;
    return last - prev;
  }, [dataPoints]);

  const formatTooltipValue = (value: number, name: string) => {
    switch (name) {
      case 'margin':
        return [`${value.toFixed(1)}%`, 'Margem'];
      case 'alerts':
        return [value, 'Alertas'];
      case 'products':
        return [value, 'Produtos'];
      default:
        return [value, name];
    }
  };

  return (
    <Card className="shadow-soft overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary animate-pulse" />
            <CardTitle className="text-lg">Métricas em Tempo Real</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {marginTrend !== 0 && (
              <Badge 
                variant="outline" 
                className={cn(
                  "transition-all duration-500",
                  marginTrend > 0 
                    ? "bg-success/10 text-success border-success/20" 
                    : "bg-destructive/10 text-destructive border-destructive/20"
                )}
              >
                {marginTrend > 0 ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
                {Math.abs(marginTrend).toFixed(1)}%
              </Badge>
            )}
            <div className={cn(
              "w-2 h-2 rounded-full transition-all",
              isConnected ? "bg-success animate-pulse" : "bg-destructive"
            )} />
          </div>
        </div>
        <p className="text-sm text-muted-foreground">Atualizações automáticas via WebSocket</p>
      </CardHeader>
      <CardContent className="pt-4">
        <ResponsiveContainer width="100%" height={250}>
          <ComposedChart data={dataPoints} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="marginGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="alertsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--warning))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--warning))" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 10 }}
              className="text-muted-foreground"
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <YAxis 
              yAxisId="margin"
              orientation="left"
              tick={{ fontSize: 10 }}
              tickFormatter={(v) => `${v}%`}
              className="text-muted-foreground"
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <YAxis 
              yAxisId="alerts"
              orientation="right"
              tick={{ fontSize: 10 }}
              className="text-muted-foreground"
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <Tooltip 
              formatter={formatTooltipValue}
              labelFormatter={(label) => `Horário: ${label}`}
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                boxShadow: 'var(--shadow-medium)'
              }}
            />
            <Area
              yAxisId="margin"
              type="monotoneX"
              dataKey="margin"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#marginGradient)"
              animationDuration={500}
              animationEasing="ease-out"
            />
            <Line
              yAxisId="alerts"
              type="monotoneX"
              dataKey="alerts"
              stroke="hsl(var(--warning))"
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--warning))', r: 3 }}
              activeDot={{ r: 5, fill: 'hsl(var(--warning))' }}
              animationDuration={500}
              animationEasing="ease-out"
            />
          </ComposedChart>
        </ResponsiveContainer>
        
        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary rounded-full" />
            <span className="text-muted-foreground">Margem Média (%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-warning rounded-full" />
            <span className="text-muted-foreground">Alertas Ativos</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
