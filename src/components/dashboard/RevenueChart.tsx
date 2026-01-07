import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { useState } from 'react';
import { Produto } from '@/types/mercadologico';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface RevenueChartProps {
  produtos?: Produto[];
  onDepartmentClick?: (departamento: string) => void;
}

export const RevenueChart = ({ produtos = [], onDepartmentClick }: RevenueChartProps) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [selectedDept, setSelectedDept] = useState<string | null>(null);

  // Calculate real data from products
  const departmentData = produtos.reduce((acc, p) => {
    const dept = p.departamento || 'Outros';
    if (!acc[dept]) {
      acc[dept] = { 
        receita: 0, 
        participacao: 0, 
        count: 0, 
        margemMedia: 0,
        produtos: [] as Produto[]
      };
    }
    acc[dept].receita += (p.participacaoFaturamento || 0) * 1000;
    acc[dept].participacao += p.participacaoFaturamento || 0;
    acc[dept].margemMedia += p.margemAtual || 0;
    acc[dept].count += 1;
    acc[dept].produtos.push(p);
    return acc;
  }, {} as Record<string, { receita: number; participacao: number; count: number; margemMedia: number; produtos: Produto[] }>);

  const chartData = Object.entries(departmentData)
    .map(([nome, data]) => ({
      nome: nome.length > 12 ? nome.substring(0, 12) + '...' : nome,
      nomeCompleto: nome,
      receita: data.receita,
      participacao: data.participacao,
      count: data.count,
      margemMedia: data.margemMedia / data.count,
      produtos: data.produtos
    }))
    .sort((a, b) => b.receita - a.receita)
    .slice(0, 10);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const handleBarClick = (data: any) => {
    if (data && data.activePayload && data.activePayload[0]) {
      const dept = data.activePayload[0].payload.nomeCompleto;
      setSelectedDept(dept);
      onDepartmentClick?.(dept);
    }
  };

  const selectedDeptData = selectedDept ? chartData.find(d => d.nomeCompleto === selectedDept) : null;

  // If no products, show empty state
  if (produtos.length === 0) {
    return (
      <Card className="shadow-soft animate-fade-in">
        <CardHeader>
          <CardTitle className="text-lg">Receita por Departamento</CardTitle>
          <p className="text-sm text-muted-foreground">Clique em um departamento para filtrar</p>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <p className="text-muted-foreground">Nenhum produto cadastrado</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-soft animate-fade-in">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Receita por Departamento</CardTitle>
            <p className="text-sm text-muted-foreground">
              {selectedDept ? (
                <span className="flex items-center gap-2">
                  Filtrado por: <Badge variant="secondary">{selectedDept}</Badge>
                  <button 
                    className="text-primary hover:underline text-xs"
                    onClick={() => {
                      setSelectedDept(null);
                      onDepartmentClick?.('');
                    }}
                  >
                    Limpar
                  </button>
                </span>
              ) : (
                'Clique em um departamento para filtrar'
              )}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart 
            data={chartData} 
            layout="horizontal" 
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            onClick={handleBarClick}
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
              width={100}
              className="text-xs"
            />
            <Tooltip 
              formatter={(value: number, name: string) => {
                if (name === 'receita') return [formatCurrency(value), 'Receita'];
                return [value, name];
              }}
              labelFormatter={(label, payload) => {
                if (payload && payload[0]) {
                  return `${payload[0].payload.nomeCompleto} (${payload[0].payload.count} produtos)`;
                }
                return label;
              }}
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
              className="cursor-pointer"
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`}
                  fill={entry.nomeCompleto === selectedDept 
                    ? 'hsl(var(--primary-light))' 
                    : index === activeIndex 
                      ? 'hsl(var(--primary) / 0.8)' 
                      : 'hsl(var(--primary))'}
                  style={{ transition: 'fill 0.2s ease-out', cursor: 'pointer' }}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Expanded details for selected department */}
        {selectedDeptData && (
          <div className="mt-4 p-4 bg-muted/30 rounded-lg border animate-fade-in">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              Detalhes: {selectedDeptData.nomeCompleto}
              <Badge>{selectedDeptData.count} produtos</Badge>
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-xs text-muted-foreground">Receita Total</p>
                <p className="font-bold">{formatCurrency(selectedDeptData.receita)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Participação</p>
                <p className="font-bold">{selectedDeptData.participacao.toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Margem Média</p>
                <p className="font-bold flex items-center gap-1">
                  {selectedDeptData.margemMedia.toFixed(1)}%
                  {selectedDeptData.margemMedia >= 15 
                    ? <TrendingUp className="h-3 w-3 text-success" />
                    : <TrendingDown className="h-3 w-3 text-destructive" />
                  }
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Produtos</p>
                <p className="font-bold">{selectedDeptData.count}</p>
              </div>
            </div>
            
            {/* Top 5 products in this department */}
            <div className="max-h-40 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Produto</TableHead>
                    <TableHead className="text-xs text-right">Receita</TableHead>
                    <TableHead className="text-xs text-right">Margem</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedDeptData.produtos
                    .sort((a, b) => (b.participacaoFaturamento || 0) - (a.participacaoFaturamento || 0))
                    .slice(0, 5)
                    .map((p, i) => (
                      <TableRow key={i} className="text-xs">
                        <TableCell className="truncate max-w-[150px]">{p.descricao}</TableCell>
                        <TableCell className="text-right">{formatCurrency((p.participacaoFaturamento || 0) * 1000)}</TableCell>
                        <TableCell className="text-right">{(p.margemAtual || 0).toFixed(1)}%</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
