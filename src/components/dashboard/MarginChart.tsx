import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { categoriasSummary } from '@/data/mercadologico-data';

export const MarginChart = () => {
  const chartData = categoriasSummary.map(cat => ({
    nome: cat.nome.split(' ')[0], // Abbreviated name
    margem: cat.margemMediaPlanejada,
    meta: 18, // Default target margin
    status: cat.status
  }));

  const getBarColor = (status: string) => {
    switch (status) {
      case 'success': return 'hsl(var(--success))';
      case 'warning': return 'hsl(var(--warning))';
      case 'destructive': return 'hsl(var(--destructive))';
      default: return 'hsl(var(--primary))';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Margem por Categoria</CardTitle>
        <p className="text-sm text-muted-foreground">Margem atual vs. meta (18%)</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="nome" 
              className="text-xs"
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              tickFormatter={(value) => `${value}%`}
              className="text-xs"
            />
            <Tooltip 
              formatter={(value: number) => [`${value.toFixed(1)}%`, 'Margem']}
              labelFormatter={(label) => `Categoria: ${label}`}
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <ReferenceLine 
              y={18} 
              stroke="hsl(var(--primary))" 
              strokeDasharray="5 5" 
              label={{ value: "Meta 18%", position: "top" }}
            />
            <Bar 
              dataKey="margem" 
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};