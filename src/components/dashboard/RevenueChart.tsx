import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { departamentosSummary } from '@/data/mercadologico-data';

export const RevenueChart = () => {
  const chartData = departamentosSummary
    .map(dept => ({
      nome: dept.nome.split(' ')[0], // Abbreviated name for chart
      receita: (dept.participacaoFaturamento * 50000), // Mock revenue based on participation
      participacao: dept.participacaoFaturamento
    }))
    .sort((a, b) => b.receita - a.receita)
    .slice(0, 10); // Top 10

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
        <CardTitle className="text-lg">Receita por Departamento</CardTitle>
        <p className="text-sm text-muted-foreground">Top 10 departamentos por faturamento</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} layout="horizontal" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              type="number" 
              tickFormatter={formatCurrency}
              className="text-xs"
            />
            <YAxis 
              type="category" 
              dataKey="nome" 
              width={80}
              className="text-xs"
            />
            <Tooltip 
              formatter={(value: number) => [formatCurrency(value), 'Receita']}
              labelFormatter={(label) => `Departamento: ${label}`}
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Bar 
              dataKey="receita" 
              fill="hsl(var(--primary))"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};