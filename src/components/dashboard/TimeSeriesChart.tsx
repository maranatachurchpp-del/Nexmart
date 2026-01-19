import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, ComposedChart, Line } from 'recharts';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, BarChart3 } from 'lucide-react';

interface TimeSeriesData {
  data: string;
  faturamento: number;
  margem: number;
}

export const TimeSeriesChart = () => {
  const { user } = useAuth();
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(true);

  useEffect(() => {
    if (user) {
      fetchTimeSeriesData();
    }
  }, [user]);

  const fetchTimeSeriesData = async () => {
    try {
      // Fetch snapshots from the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: snapshots, error } = await supabase
        .from('product_snapshots')
        .select('snapshot_date, margem_atual, participacao_faturamento')
        .eq('user_id', user?.id)
        .gte('snapshot_date', thirtyDaysAgo.toISOString().split('T')[0])
        .order('snapshot_date', { ascending: true });

      if (error) throw error;

      // Group by date and calculate daily totals
      const dailyData: Record<string, { faturamento: number; margem: number; count: number }> = {};

      snapshots?.forEach((snapshot) => {
        const date = snapshot.snapshot_date;
        if (!dailyData[date]) {
          dailyData[date] = { faturamento: 0, margem: 0, count: 0 };
        }
        dailyData[date].faturamento += snapshot.participacao_faturamento || 0;
        dailyData[date].margem += snapshot.margem_atual || 0;
        dailyData[date].count += 1;
      });

      // Convert to array format
      const chartData = Object.entries(dailyData).map(([date, values]) => ({
        data: new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        faturamento: Math.round(values.faturamento * 1000), // Scale for visualization
        margem: values.count > 0 ? Number((values.margem / values.count).toFixed(1)) : 0
      }));

      if (chartData.length === 0) {
        setHasData(false);
      } else {
        setTimeSeriesData(chartData);
        setHasData(true);
      }
    } catch (error) {
      setHasData(false);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  if (loading) {
    return (
      <Card className="shadow-soft animate-fade-in">
        <CardHeader>
          <CardTitle className="text-lg">Evolução Temporal</CardTitle>
          <p className="text-sm text-muted-foreground">Faturamento e margem bruta - últimos 30 dias</p>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!hasData) {
    return (
      <Card className="shadow-soft animate-fade-in">
        <CardHeader>
          <CardTitle className="text-lg">Evolução Temporal</CardTitle>
          <p className="text-sm text-muted-foreground">Faturamento e margem bruta - últimos 30 dias</p>
        </CardHeader>
        <CardContent className="h-[300px] flex flex-col items-center justify-center text-center">
          <BarChart3 className="w-12 h-12 text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground text-sm font-medium">Sem dados históricos</p>
          <p className="text-muted-foreground text-xs mt-1">
            Os dados serão exibidos após a geração de snapshots diários
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-soft animate-fade-in">
      <CardHeader>
        <CardTitle className="text-lg">Evolução Temporal</CardTitle>
        <p className="text-sm text-muted-foreground">Faturamento e margem bruta - últimos 30 dias</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={timeSeriesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="data" 
              className="text-xs"
              tick={{ fontSize: 11 }}
            />
            <YAxis 
              yAxisId="revenue"
              orientation="left"
              tickFormatter={formatCurrency}
              className="text-xs"
              tick={{ fontSize: 11 }}
            />
            <YAxis 
              yAxisId="margin"
              orientation="right"
              tickFormatter={(value) => `${value}%`}
              className="text-xs"
              tick={{ fontSize: 11 }}
            />
            <Tooltip 
              formatter={(value: number, name: string) => {
                if (name === 'faturamento') {
                  return [formatCurrency(value), 'Faturamento'];
                }
                return [`${value}%`, 'Margem'];
              }}
              labelFormatter={(label) => `Data: ${label}`}
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                boxShadow: 'var(--shadow-medium)'
              }}
            />
            <Area
              yAxisId="revenue"
              type="monotone"
              dataKey="faturamento"
              fill="url(#revenueGradient)"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              animationDuration={1000}
              animationEasing="ease-out"
            />
            <Line 
              yAxisId="margin"
              type="monotone" 
              dataKey="margem" 
              stroke="hsl(var(--success))" 
              strokeWidth={2}
              dot={{ r: 2, fill: 'hsl(var(--success))' }}
              activeDot={{ r: 5, fill: 'hsl(var(--success))' }}
              name="margem"
              animationDuration={1000}
              animationEasing="ease-out"
            />
          </ComposedChart>
        </ResponsiveContainer>
        
        <div className="flex items-center justify-center space-x-6 mt-4 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-primary rounded-full"></div>
            <span className="text-muted-foreground">Faturamento (R$)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-success rounded-full"></div>
            <span className="text-muted-foreground">Margem Bruta (%)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
