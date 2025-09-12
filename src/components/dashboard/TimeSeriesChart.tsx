import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const TimeSeriesChart = () => {
  // Generate mock time series data for the last 30 days
  const generateTimeSeriesData = () => {
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
  };

  const timeSeriesData = generateTimeSeriesData();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Evolução Temporal</CardTitle>
        <p className="text-sm text-muted-foreground">Faturamento e margem bruta - últimos 30 dias</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={timeSeriesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="data" 
              className="text-xs"
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              yAxisId="revenue"
              orientation="left"
              tickFormatter={formatCurrency}
              className="text-xs"
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              yAxisId="margin"
              orientation="right"
              tickFormatter={(value) => `${value}%`}
              className="text-xs"
              tick={{ fontSize: 12 }}
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
                borderRadius: '8px'
              }}
            />
            <Line 
              yAxisId="revenue"
              type="monotone" 
              dataKey="faturamento" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
              name="faturamento"
            />
            <Line 
              yAxisId="margin"
              type="monotone" 
              dataKey="margem" 
              stroke="hsl(var(--success))" 
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
              name="margem"
            />
          </LineChart>
        </ResponsiveContainer>
        
        <div className="flex items-center justify-center space-x-6 mt-4 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-primary rounded-full"></div>
            <span>Faturamento (R$)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-success rounded-full"></div>
            <span>Margem Bruta (%)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};