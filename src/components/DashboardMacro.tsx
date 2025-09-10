import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "./MetricCard";
import { StatusBadge } from "./StatusBadge";
import { departamentosSummary } from "@/data/mercadologico-data";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Package, TrendingUp, AlertTriangle, DollarSign } from "lucide-react";

export const DashboardMacro = () => {
  const totalProdutos = departamentosSummary.reduce((acc, dep) => acc + dep.totalProdutos, 0);
  const margemMediaGeral = departamentosSummary.reduce((acc, dep) => acc + dep.margemMediaPlanejada, 0) / departamentosSummary.length;
  const totalForaPadrao = departamentosSummary.reduce((acc, dep) => acc + dep.produtosForaPadrao, 0);
  const faturamentoTotal = departamentosSummary.reduce((acc, dep) => acc + dep.participacaoFaturamento, 0);

  const chartData = departamentosSummary.map(dep => ({
    nome: dep.nome.split(' ')[0], // Nome abreviado para o gráfico
    margem: dep.margemMediaPlanejada,
    faturamento: dep.participacaoFaturamento,
    foraPadrao: dep.produtosForaPadrao
  }));

  const pieData = departamentosSummary.map(dep => ({
    name: dep.nome,
    value: dep.participacaoFaturamento
  }));

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--destructive))', 'hsl(var(--muted))'];

  return (
    <div className="space-y-6">
      {/* Métricas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Total de Produtos"
          value={totalProdutos.toLocaleString()}
          icon={Package}
          subtitle="Itens cadastrados"
        />
        <MetricCard
          title="Margem Média Geral"
          value={`${margemMediaGeral.toFixed(1)}%`}
          icon={TrendingUp}
          trend="up"
          subtitle="Planejada"
        />
        <MetricCard
          title="Itens Fora do Padrão"
          value={totalForaPadrao}
          icon={AlertTriangle}
          trend="down"
          subtitle={`${((totalForaPadrao / totalProdutos) * 100).toFixed(1)}% do total`}
        />
        <MetricCard
          title="Cobertura Faturamento"
          value={`${faturamentoTotal.toFixed(1)}%`}
          icon={DollarSign}
          subtitle="Participação planejada"
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Margem vs Faturamento por Departamento</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="nome" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)"
                  }}
                />
                <Bar dataKey="margem" name="Margem %" fill="hsl(var(--primary))" />
                <Bar dataKey="faturamento" name="Faturamento %" fill="hsl(var(--success))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Participação no Faturamento</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)"
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Departamentos */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Resumo por Departamento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 font-semibold text-foreground">Departamento</th>
                  <th className="text-center py-3 font-semibold text-foreground">Produtos</th>
                  <th className="text-center py-3 font-semibold text-foreground">Margem Média</th>
                  <th className="text-center py-3 font-semibold text-foreground">% Faturamento</th>
                  <th className="text-center py-3 font-semibold text-foreground">Fora do Padrão</th>
                  <th className="text-center py-3 font-semibold text-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {departamentosSummary.map((dep) => (
                  <tr key={dep.codigo} className="border-b border-border hover:bg-muted/50">
                    <td className="py-3 font-medium text-foreground">{dep.nome}</td>
                    <td className="text-center py-3 text-muted-foreground">{dep.totalProdutos}</td>
                    <td className="text-center py-3 text-muted-foreground">{dep.margemMediaPlanejada.toFixed(1)}%</td>
                    <td className="text-center py-3 text-muted-foreground">{dep.participacaoFaturamento.toFixed(1)}%</td>
                    <td className="text-center py-3">
                      <span className={dep.produtosForaPadrao > 15 ? "text-destructive font-semibold" : "text-muted-foreground"}>
                        {dep.produtosForaPadrao}
                      </span>
                    </td>
                    <td className="text-center py-3">
                      <StatusBadge 
                        status={dep.status} 
                        label={dep.status === 'success' ? 'OK' : dep.status === 'warning' ? 'Atenção' : 'Crítico'} 
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};