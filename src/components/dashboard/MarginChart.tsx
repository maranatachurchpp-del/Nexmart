import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';
import { useState, useMemo } from 'react';
import { Produto } from '@/types/mercadologico';

interface MarginChartProps {
  produtos?: Produto[];
}

export const MarginChart = ({ produtos = [] }: MarginChartProps) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Calculate category-level margins from real product data
  const chartData = useMemo(() => {
    if (produtos.length === 0) {
      return [];
    }

    // Group products by category and calculate average margins
    const categoryData: Record<string, { totalMargin: number; count: number }> = {};

    produtos.forEach(produto => {
      const category = produto.categoria || 'Sem Categoria';
      if (!categoryData[category]) {
        categoryData[category] = { totalMargin: 0, count: 0 };
      }
      categoryData[category].totalMargin += produto.margemAtual || 0;
      categoryData[category].count += 1;
    });

    // Convert to chart format and determine status
    return Object.entries(categoryData)
      .map(([nome, data]) => {
        const avgMargin = data.count > 0 ? data.totalMargin / data.count : 0;
        let status: 'success' | 'warning' | 'destructive' = 'success';
        
        if (avgMargin < 12) {
          status = 'destructive';
        } else if (avgMargin < 18) {
          status = 'warning';
        }

        return {
          nome: nome.length > 12 ? nome.substring(0, 12) + '...' : nome,
          fullName: nome,
          margem: Number(avgMargin.toFixed(1)),
          meta: 18,
          status
        };
      })
      .sort((a, b) => b.margem - a.margem)
      .slice(0, 8); // Limit to top 8 categories
  }, [produtos]);

  const getBarColor = (status: string, isActive: boolean) => {
    const opacity = isActive ? '1' : '0.85';
    switch (status) {
      case 'success': return `hsl(var(--success) / ${opacity})`;
      case 'warning': return `hsl(var(--warning) / ${opacity})`;
      case 'destructive': return `hsl(var(--destructive) / ${opacity})`;
      default: return `hsl(var(--primary) / ${opacity})`;
    }
  };

  if (chartData.length === 0) {
    return (
      <Card className="shadow-soft animate-fade-in">
        <CardHeader>
          <CardTitle className="text-lg">Margem por Categoria</CardTitle>
          <p className="text-sm text-muted-foreground">Margem atual vs. meta (18%)</p>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground text-sm">Nenhum dado disponível</p>
        </CardContent>
      </Card>
    );
  }

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
              labelFormatter={(_, payload) => {
                const data = payload?.[0]?.payload;
                return `Categoria: ${data?.fullName || data?.nome || ''}`;
              }}
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
