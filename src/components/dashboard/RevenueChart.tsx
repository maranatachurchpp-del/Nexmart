import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { departamentosSummary } from '@/data/mercadologico-data';
import { useState } from 'react';

export const RevenueChart = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

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
    <Card className="shadow-soft animate-fade-in">
      <CardHeader>
        <CardTitle className="text-lg">Receita por Departamento</CardTitle>
        <p className="text-sm text-muted-foreground">Top 10 departamentos por faturamento</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart 
            data={chartData} 
            layout="horizontal" 
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            onMouseMove={(state) => {
              if (state.activeTooltipIndex !== undefined) {
                setActiveIndex(state.activeTooltipIndex);
              }
            }}
            onMouseLeave={() => setActiveIndex(null)}
          >
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
                borderRadius: '8px',
                boxShadow: 'var(--shadow-medium)'
              }}
              cursor={{ fill: 'hsl(var(--muted) / 0.3)' }}
            />
            <Bar 
              dataKey="receita" 
              radius={[0, 4, 4, 0]}
              animationDuration={800}
              animationEasing="ease-out"
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`}
                  fill={index === activeIndex ? 'hsl(var(--primary-light))' : 'hsl(var(--primary))'}
                  style={{ transition: 'fill 0.2s ease-out' }}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};