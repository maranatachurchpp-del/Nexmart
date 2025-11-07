import { useState } from 'react';
import { FileText, Download, Table } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FilterBar } from '@/components/dashboard/FilterBar';
import { useToast } from '@/hooks/use-toast';
import { useProducts } from '@/hooks/useProducts';
import { generatePDFReport } from '@/lib/pdf-generator';
import { generateExcelReport, generateStandardTemplate } from '@/lib/excel-generator';
import { DashboardFilters } from '@/types/mercadologico';

export default function Reports() {
  const { produtos } = useProducts();
  const [filters, setFilters] = useState<DashboardFilters>({
    periodo: {
      inicio: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      fim: new Date()
    },
    kvi: 'todos'
  });
  const [isGenerating, setIsGenerating] = useState({
    pdf: false,
    excel: false,
    template: false
  });
  const { toast } = useToast();

  const handleGeneratePDF = async () => {
    setIsGenerating(prev => ({ ...prev, pdf: true }));
    try {
      await generatePDFReport(produtos, filters);
      toast({
        title: "Relatório PDF gerado com sucesso",
        description: "O download começará automaticamente.",
      });
    } catch (error) {
      toast({
        title: "Erro ao gerar PDF",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(prev => ({ ...prev, pdf: false }));
    }
  };

  const handleGenerateExcel = async () => {
    setIsGenerating(prev => ({ ...prev, excel: true }));
    try {
      await generateExcelReport(produtos, filters);
      toast({
        title: "Relatório Excel gerado com sucesso",
        description: "O download começará automaticamente.",
      });
    } catch (error) {
      toast({
        title: "Erro ao gerar Excel",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(prev => ({ ...prev, excel: false }));
    }
  };

  const handleDownloadTemplate = async () => {
    setIsGenerating(prev => ({ ...prev, template: true }));
    try {
      await generateStandardTemplate(produtos);
      toast({
        title: "Planilha Padrão baixada com sucesso",
        description: "O arquivo está disponível em seus downloads.",
      });
    } catch (error) {
      toast({
        title: "Erro ao baixar planilha",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(prev => ({ ...prev, template: false }));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Relatórios Estratégicos</h1>
            <p className="text-muted-foreground mt-1">
              Exporte relatórios executivos e analíticos para análise externa
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-6">
          <FilterBar filters={filters} onFiltersChange={setFilters} />
        </Card>

        {/* Report Generation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* PDF Report */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Relatório PDF</h3>
                <p className="text-sm text-muted-foreground">Visão executiva</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Relatório visual com KPIs, gráficos e alertas críticos. Ideal para apresentações gerenciais.
            </p>
            <Button 
              onClick={handleGeneratePDF}
              disabled={isGenerating.pdf}
              className="w-full"
            >
              {isGenerating.pdf ? "Gerando..." : "Gerar Relatório PDF"}
            </Button>
          </Card>

          {/* Excel Report */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-success/10 rounded-lg">
                <Table className="w-6 h-6 text-success" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Relatório Excel</h3>
                <p className="text-sm text-muted-foreground">Análise detalhada</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Tabela analítica completa com todos os dados e status. Perfeito para análise em BI.
            </p>
            <Button 
              onClick={handleGenerateExcel}
              disabled={isGenerating.excel}
              variant="outline"
              className="w-full"
            >
              {isGenerating.excel ? "Gerando..." : "Gerar Relatório Excel"}
            </Button>
          </Card>

          {/* Standard Template */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-warning/10 rounded-lg">
                <Download className="w-6 h-6 text-warning" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Planilha Padrão</h3>
                <p className="text-sm text-muted-foreground">Template estruturado</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Baixe a estrutura mercadológica atualizada em formato Excel/CSV para análise externa.
            </p>
            <Button 
              onClick={handleDownloadTemplate}
              disabled={isGenerating.template}
              variant="secondary"
              className="w-full"
            >
              {isGenerating.template ? "Baixando..." : "Baixar Planilha Padrão"}
            </Button>
          </Card>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="font-semibold text-foreground mb-3">Relatório PDF - Conteúdo</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Indicadores principais (KPIs) em formato visual</li>
              <li>• Gráficos de receita por departamento</li>
              <li>• Análise de margem vs. meta por categoria</li>
              <li>• Evolução temporal de faturamento e margem</li>
              <li>• Sumário de alertas críticos e recomendações</li>
              <li>• Capa personalizada com branding e período</li>
            </ul>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-foreground mb-3">Relatório Excel - Conteúdo</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Tabela analítica completa com todos os produtos</li>
              <li>• Colunas de receita, margem, quebra e marcas</li>
              <li>• Status calculado (OK, Atenção, Crítico)</li>
              <li>• Filtros aplicados preservados</li>
              <li>• Dados formatados para análise em BI</li>
              <li>• Compatível com Power BI e outras ferramentas</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}