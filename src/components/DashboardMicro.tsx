import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "./StatusBadge";
import { produtosSample } from "@/data/mercadologico-data";
import { Search, Filter } from "lucide-react";

export const DashboardMicro = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [departamentoFilter, setDepartamentoFilter] = useState("todos");
  const [statusFilter, setStatusFilter] = useState("todos");

  const departamentos = [...new Set(produtosSample.map(p => p.departamento))];

  const filteredProdutos = produtosSample.filter(produto => {
    const matchesSearch = produto.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         produto.codigo.includes(searchTerm);
    const matchesDepartamento = departamentoFilter === "todos" || produto.departamento === departamentoFilter;
    const matchesStatus = statusFilter === "todos" || produto.status === statusFilter;
    
    return matchesSearch && matchesDepartamento && matchesStatus;
  });

  const getMargemStatus = (produto: any) => {
    if (!produto.margemAtual) return { status: 'neutral', message: 'N/A' };
    
    const { margemA, margemAtual } = produto;
    if (margemAtual >= margemA.min && margemAtual <= margemA.max) {
      return { status: 'success', message: 'Dentro da faixa A' };
    } else if (margemAtual < margemA.min - 5) {
      return { status: 'destructive', message: 'Muito baixa' };
    } else {
      return { status: 'warning', message: 'Fora da faixa ideal' };
    }
  };

  const getMarcasStatus = (produto: any) => {
    if (!produto.marcasAtuais) return { status: 'neutral', message: 'N/A' };
    
    const { marcasMin, marcasMax, marcasAtuais } = produto;
    if (marcasAtuais >= marcasMin && marcasAtuais <= marcasMax) {
      return { status: 'success', message: 'OK' };
    } else if (marcasAtuais < marcasMin) {
      return { status: 'warning', message: 'Poucas marcas' };
    } else {
      return { status: 'destructive', message: 'Excesso de marcas' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros e Busca
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Buscar produto
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Nome ou código..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Departamento
              </label>
              <Select value={departamentoFilter} onValueChange={setDepartamentoFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os departamentos</SelectItem>
                  {departamentos.map(dep => (
                    <SelectItem key={dep} value={dep}>{dep}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Status
              </label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os status</SelectItem>
                  <SelectItem value="success">OK</SelectItem>
                  <SelectItem value="warning">Atenção</SelectItem>
                  <SelectItem value="destructive">Crítico</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumo dos Filtros */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>Mostrando {filteredProdutos.length} de {produtosSample.length} produtos</span>
        {searchTerm && <span>• Busca: "{searchTerm}"</span>}
        {departamentoFilter !== "todos" && <span>• Depto: {departamentoFilter}</span>}
        {statusFilter !== "todos" && <span>• Status: {statusFilter}</span>}
      </div>

      {/* Tabela Detalhada */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Produtos - Visão Detalhada</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 font-semibold text-foreground">Código</th>
                  <th className="text-left py-3 font-semibold text-foreground">Produto</th>
                  <th className="text-center py-3 font-semibold text-foreground">Categoria</th>
                  <th className="text-center py-3 font-semibold text-foreground">Margem Atual</th>
                  <th className="text-center py-3 font-semibold text-foreground">Faixa A</th>
                  <th className="text-center py-3 font-semibold text-foreground">Marcas</th>
                  <th className="text-center py-3 font-semibold text-foreground">Quebra</th>
                  <th className="text-center py-3 font-semibold text-foreground">KVI</th>
                  <th className="text-center py-3 font-semibold text-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredProdutos.map((produto) => {
                  const margemStatus = getMargemStatus(produto);
                  const marcasStatus = getMarcasStatus(produto);

                  return (
                    <tr key={produto.codigo} className="border-b border-border hover:bg-muted/50">
                      <td className="py-3 font-mono text-sm text-muted-foreground">{produto.codigo}</td>
                      <td className="py-3 font-medium text-foreground max-w-[200px] truncate">
                        {produto.descricao}
                      </td>
                      <td className="text-center py-3 text-sm text-muted-foreground">
                        {produto.categoria}
                      </td>
                      <td className="text-center py-3">
                        <span className={`font-semibold ${
                          margemStatus.status === 'success' ? 'text-success' :
                          margemStatus.status === 'warning' ? 'text-warning' :
                          margemStatus.status === 'destructive' ? 'text-destructive' :
                          'text-muted-foreground'
                        }`}>
                          {produto.margemAtual ? `${produto.margemAtual}%` : 'N/A'}
                        </span>
                      </td>
                      <td className="text-center py-3 text-sm text-muted-foreground">
                        {produto.margemA.min}% à {produto.margemA.max}%
                      </td>
                      <td className="text-center py-3">
                        <span className={`text-sm ${
                          marcasStatus.status === 'success' ? 'text-success' :
                          marcasStatus.status === 'warning' ? 'text-warning' :
                          marcasStatus.status === 'destructive' ? 'text-destructive' :
                          'text-muted-foreground'
                        }`}>
                          {produto.marcasAtuais || 'N/A'} / {produto.marcasMin}-{produto.marcasMax}
                        </span>
                      </td>
                      <td className="text-center py-3 text-sm">
                        <span className={produto.quebraAtual && produto.quebraAtual > produto.quebraEsperada 
                          ? 'text-destructive font-semibold' : 'text-muted-foreground'}>
                          {produto.quebraAtual ? `${produto.quebraAtual}%` : 'N/A'}
                        </span>
                      </td>
                      <td className="text-center py-3">
                        <span className={`text-xs px-2 py-1 rounded ${
                          produto.classificacaoKVI === 'Alta' ? 'bg-destructive-light text-destructive' :
                          produto.classificacaoKVI === 'Média' ? 'bg-warning-light text-warning' :
                          'bg-success-light text-success'
                        }`}>
                          {produto.classificacaoKVI}
                        </span>
                      </td>
                      <td className="text-center py-3">
                        <StatusBadge 
                          status={produto.status} 
                          label={
                            produto.status === 'success' ? 'OK' : 
                            produto.status === 'warning' ? 'Atenção' : 
                            'Crítico'
                          } 
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};