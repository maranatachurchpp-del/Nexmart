import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, ComposedChart } from 'recharts';
import { useMemo } from 'react';

export const TimeSeriesChart = () => {
  // Generate mock time series data for the last 30 days
  const timeSeriesData = useMemo(() => {
    const data = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Generate realistic daily values with some variation
      const baseRevenue = 45000 + Math.random() * 15000;
      const baseMargin = 18 + (Math.random() - 0.5) * 4;
      
      data.push({
        data: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        faturamento: Math.round(baseRevenue),
        margem: Number(baseMargin.toFixed(1))
      });
    }
    
    return data;
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

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