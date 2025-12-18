import { useState } from 'react';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { generateExcelReport, generateStandardTemplate } from '@/lib/excel-generator';
import { generatePDFReport } from '@/lib/pdf-generator';
import { Produto, DashboardFilters } from '@/types/mercadologico';
import { toast } from '@/hooks/use-toast';
import { useFeaturePermissions } from '@/hooks/useFeaturePermissions';
import { useAuditLogs } from '@/hooks/useAuditLogs';

interface ExportMenuProps {
  produtos: Produto[];
  filters: DashboardFilters;
}

export const ExportMenu = ({ produtos, filters }: ExportMenuProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const { canExport } = useFeaturePermissions();
  const { createLog } = useAuditLogs();

  const handleExportExcel = async () => {
    if (!canExport('dashboard')) {
      toast({
        title: 'Sem permissão',
        description: 'Você não tem permissão para exportar dados',
        variant: 'destructive'
      });
      return;
    }

    setIsExporting(true);
    try {
      await generateExcelReport(produtos, filters);
      await createLog('export', 'report', undefined, { format: 'excel', count: produtos.length });
      toast({
        title: 'Exportação concluída',
        description: 'O relatório Excel foi baixado com sucesso'
      });
    } catch (error) {
      console.error('Error exporting Excel:', error);
      toast({
        title: 'Erro na exportação',
        description: 'Não foi possível gerar o arquivo Excel',
        variant: 'destructive'
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    if (!canExport('dashboard')) {
      toast({
        title: 'Sem permissão',
        description: 'Você não tem permissão para exportar dados',
        variant: 'destructive'
      });
      return;
    }

    setIsExporting(true);
    try {
      await generatePDFReport(produtos, filters);
      await createLog('export', 'report', undefined, { format: 'pdf', count: produtos.length });
      toast({
        title: 'Exportação concluída',
        description: 'O relatório PDF foi baixado com sucesso'
      });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast({
        title: 'Erro na exportação',
        description: 'Não foi possível gerar o arquivo PDF',
        variant: 'destructive'
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportTemplate = async () => {
    if (!canExport('dashboard')) {
      toast({
        title: 'Sem permissão',
        description: 'Você não tem permissão para exportar dados',
        variant: 'destructive'
      });
      return;
    }

    setIsExporting(true);
    try {
      await generateStandardTemplate(produtos);
      await createLog('export', 'template', undefined, { format: 'xlsx', count: produtos.length });
      toast({
        title: 'Exportação concluída',
        description: 'A planilha padrão foi baixada com sucesso'
      });
    } catch (error) {
      console.error('Error exporting template:', error);
      toast({
        title: 'Erro na exportação',
        description: 'Não foi possível gerar a planilha',
        variant: 'destructive'
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isExporting}>
          <Download className="w-4 h-4 mr-2" />
          {isExporting ? 'Exportando...' : 'Exportar'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Exportar Dados</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleExportExcel}>
          <FileSpreadsheet className="w-4 h-4 mr-2 text-green-600" />
          Relatório Excel (.xlsx)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportPDF}>
          <FileText className="w-4 h-4 mr-2 text-red-600" />
          Relatório PDF
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleExportTemplate}>
          <FileSpreadsheet className="w-4 h-4 mr-2 text-blue-600" />
          Planilha Padrão (para importação)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
