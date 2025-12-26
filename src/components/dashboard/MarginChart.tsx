import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';
import { categoriasSummary } from '@/data/mercadologico-data';
import { useState } from 'react';

export const MarginChart = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const chartData = categoriasSummary.map(cat => ({
    nome: cat.nome.split(' ')[0], // Abbreviated name
    margem: cat.margemMediaPlanejada,
    meta: 18, // Default target margin
    status: cat.status
  }));

  const getBarColor = (status: string, isActive: boolean) => {
    const opacity = isActive ? '1' : '0.85';
    switch (status) {
      case 'success': return `hsl(var(--success) / ${opacity})`;
      case 'warning': return `hsl(var(--warning) / ${opacity})`;
      case 'destructive': return `hsl(var(--destructive) / ${opacity})`;
      default: return `hsl(var(--primary) / ${opacity})`;
    }
  };

  return (
    <Card className="shadow-soft animate-fade-in">
      <CardHeader>
        <CardTitle className="text-lg">Margem por Categoria</CardTitle>
        <p className="text-sm text-muted-foreground">Margem atual vs. meta (18%)</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart 
            data={chartData} 
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            onMouseMove={(state) => {
              if (state.activeTooltipIndex !== undefined) {
                setActiveIndex(state.activeTooltipIndex);
              }
            }}
            onMouseLeave={() => setActiveIndex(null)}
          >
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
                borderRadius: '8px',
                boxShadow: 'var(--shadow-medium)'
              }}
              cursor={{ fill: 'hsl(var(--muted) / 0.3)' }}
            />
            <ReferenceLine 
              y={18} 
              stroke="hsl(var(--primary))" 
              strokeDasharray="5 5" 
              label={{ value: "Meta 18%", position: "top", fill: 'hsl(var(--foreground))' }}
            />
            <Bar 
              dataKey="margem" 
              radius={[4, 4, 0, 0]}
              animationDuration={800}
              animationEasing="ease-out"
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`}
                  fill={getBarColor(entry.status, index === activeIndex)}
                  style={{ transition: 'fill 0.2s ease-out, filter 0.2s ease-out' }}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};