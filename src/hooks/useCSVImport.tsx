import { useState } from 'react';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { parseCsvFileToJson, parseXlsxFileToJson } from '@/lib/exceljs-utils';

interface CSVRow {
  codigo: string;
  descricao: string;
  departamento: string;
  categoria: string;
  subcategoria: string;
  quebra_esperada?: number;
  quebra_atual?: number;
  margem_a_min?: number;
  margem_a_max?: number;
  marcas_min?: number;
  marcas_max?: number;
  marcas_atuais?: number;
  giro_ideal_mes?: number;
  participacao_faturamento?: number;
  preco_medio_min?: number;
  preco_medio_max?: number;
  classificacao_kvi?: 'Alta' | 'Média' | 'Baixa';
  status?: 'success' | 'warning' | 'destructive';
}

export interface ValidationError {
  row: number;
  field: string;
  message: string;
  value?: any;
}

const csvRowSchema = z.object({
  codigo: z.string().min(1, 'Código é obrigatório'),
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  departamento: z.string().min(1, 'Departamento é obrigatório'),
  categoria: z.string().min(1, 'Categoria é obrigatória'),
  subcategoria: z.string().min(1, 'Subcategoria é obrigatória'),
  quebra_esperada: z.number().min(0, 'Quebra esperada deve ser >= 0').optional(),
  quebra_atual: z.number().min(0, 'Quebra atual deve ser >= 0').optional(),
  margem_a_min: z.number().min(0, 'Margem mínima deve ser >= 0').optional(),
  margem_a_max: z.number().min(0, 'Margem máxima deve ser >= 0').optional(),
  marcas_min: z
    .number()
    .int('Marcas mínimas deve ser um número inteiro')
    .min(0, 'Marcas mínimas deve ser >= 0')
    .optional(),
  marcas_max: z
    .number()
    .int('Marcas máximas deve ser um número inteiro')
    .min(0, 'Marcas máximas deve ser >= 0')
    .optional(),
  marcas_atuais: z
    .number()
    .int('Marcas atuais deve ser um número inteiro')
    .min(0, 'Marcas atuais deve ser >= 0')
    .optional(),
  giro_ideal_mes: z
    .number()
    .int('Giro ideal/mês deve ser um número inteiro')
    .min(0, 'Giro ideal/mês deve ser >= 0')
    .optional(),
  participacao_faturamento: z
    .number()
    .min(0, 'Participação deve ser >= 0')
    .max(100, 'Participação deve ser <= 100')
    .optional(),
  preco_medio_min: z.number().min(0, 'Preço médio mínimo deve ser >= 0').optional(),
  preco_medio_max: z.number().min(0, 'Preço médio máximo deve ser >= 0').optional(),
  classificacao_kvi: z
    .enum(['Alta', 'Média', 'Baixa'], {
      errorMap: () => ({ message: 'Classificação KVI deve ser: Alta, Média ou Baixa' }),
    })
    .optional(),
  status: z
    .enum(['success', 'warning', 'destructive'], {
      errorMap: () => ({ message: 'Status deve ser: success, warning ou destructive' }),
    })
    .optional(),
})
  .refine((data) => !data.margem_a_max || !data.margem_a_min || data.margem_a_max >= data.margem_a_min, {
    message: 'Margem máxima deve ser maior ou igual à margem mínima',
    path: ['margem_a_max'],
  })
  .refine((data) => !data.marcas_max || !data.marcas_min || data.marcas_max >= data.marcas_min, {
    message: 'Marcas máximas devem ser maior ou igual às marcas mínimas',
    path: ['marcas_max'],
  })
  .refine((data) => !data.preco_medio_max || !data.preco_medio_min || data.preco_medio_max >= data.preco_medio_min, {
    message: 'Preço médio máximo deve ser maior ou igual ao preço médio mínimo',
    path: ['preco_medio_max'],
  });

export const useCSVImport = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalRows, setTotalRows] = useState(0);
  const [processedRows, setProcessedRows] = useState(0);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  const normalizeRows = (jsonData: any[]): CSVRow[] => {
    return jsonData.map((row: any) => {
      const normalized: any = {};
      Object.keys(row).forEach((key) => {
        const normalizedKey = key
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '') // Remove accents
          .replace(/\s+/g, '_')
          .replace(/[^a-z0-9_]/g, '');
        normalized[normalizedKey] = row[key];
      });
      return normalized;
    }) as CSVRow[];
  };

  const parseFile = async (file: File): Promise<CSVRow[]> => {
    const extension = file.name.split('.').pop()?.toLowerCase();

    let jsonData: any[] = [];
    if (extension === 'xlsx') {
      jsonData = await parseXlsxFileToJson(file);
    } else {
      // treat as CSV
      jsonData = await parseCsvFileToJson(file);
    }

    return normalizeRows(jsonData);
  };

  const validateRow = (row: any, rowIndex: number): ValidationError[] => {
    const errors: ValidationError[] = [];
    
    // Convert string values to numbers where needed
    const processedRow = {
      ...row,
      quebra_esperada: row.quebra_esperada ? parseFloat(String(row.quebra_esperada)) : undefined,
      quebra_atual: row.quebra_atual ? parseFloat(String(row.quebra_atual)) : undefined,
      margem_a_min: row.margem_a_min ? parseFloat(String(row.margem_a_min)) : undefined,
      margem_a_max: row.margem_a_max ? parseFloat(String(row.margem_a_max)) : undefined,
      marcas_min: row.marcas_min ? parseInt(String(row.marcas_min)) : undefined,
      marcas_max: row.marcas_max ? parseInt(String(row.marcas_max)) : undefined,
      marcas_atuais: row.marcas_atuais ? parseInt(String(row.marcas_atuais)) : undefined,
      giro_ideal_mes: row.giro_ideal_mes ? parseInt(String(row.giro_ideal_mes)) : undefined,
      participacao_faturamento: row.participacao_faturamento ? parseFloat(String(row.participacao_faturamento)) : undefined,
      preco_medio_min: row.preco_medio_min ? parseFloat(String(row.preco_medio_min)) : undefined,
      preco_medio_max: row.preco_medio_max ? parseFloat(String(row.preco_medio_max)) : undefined,
    };

    const result = csvRowSchema.safeParse(processedRow);
    
    if (!result.success) {
      result.error.errors.forEach((error) => {
        errors.push({
          row: rowIndex + 1,
          field: error.path.join('.'),
          message: error.message,
          value: error.path.length > 0 ? row[error.path[0]] : undefined,
        });
      });
    }
    
    return errors;
  };

  const importCSV = async (file: File) => {
    setIsImporting(true);
    setProgress(0);
    setProcessedRows(0);
    setValidationErrors([]);

    try {
      // Parse file (CSV or XLSX)
      const rows = await parseFile(file);
      setTotalRows(rows.length);

      if (rows.length === 0) {
        throw new Error('O arquivo CSV está vazio');
      }

      // Validate all rows first
      const allErrors: ValidationError[] = [];
      rows.forEach((row, index) => {
        const rowErrors = validateRow(row, index);
        allErrors.push(...rowErrors);
      });

      if (allErrors.length > 0) {
        setValidationErrors(allErrors);
        toast({
          title: 'Erros de validação encontrados',
          description: `${allErrors.length} erro(s) em ${new Set(allErrors.map(e => e.row)).size} linha(s). Verifique os detalhes abaixo.`,
          variant: 'destructive',
        });
        setIsImporting(false);
        return { success: false, errors: allErrors };
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Batch size for inserts
      const BATCH_SIZE = 50;
      const batches = [];
      
      for (let i = 0; i < rows.length; i += BATCH_SIZE) {
        batches.push(rows.slice(i, i + BATCH_SIZE));
      }

      // Process batches
      let processed = 0;
      for (const batch of batches) {
        const productsToInsert = batch.map(row => ({
          user_id: user.id,
          codigo: row.codigo || `AUTO_${Date.now()}_${Math.random()}`,
          descricao: row.descricao || 'Sem descrição',
          departamento: row.departamento || 'Não categorizado',
          categoria: row.categoria || 'Não categorizado',
          subcategoria: row.subcategoria || 'Não categorizado',
          quebra_esperada: parseFloat(String(row.quebra_esperada || 0)),
          quebra_atual: parseFloat(String(row.quebra_atual || 0)),
          margem_a_min: parseFloat(String(row.margem_a_min || 0)),
          margem_a_max: parseFloat(String(row.margem_a_max || 0)),
          marcas_min: parseInt(String(row.marcas_min || 0)),
          marcas_max: parseInt(String(row.marcas_max || 0)),
          marcas_atuais: parseInt(String(row.marcas_atuais || 0)),
          giro_ideal_mes: parseInt(String(row.giro_ideal_mes || 0)),
          participacao_faturamento: parseFloat(String(row.participacao_faturamento || 0)),
          preco_medio_min: parseFloat(String(row.preco_medio_min || 0)),
          preco_medio_max: parseFloat(String(row.preco_medio_max || 0)),
          classificacao_kvi: row.classificacao_kvi || 'Média',
          status: row.status || 'success'
        }));

        const { error } = await supabase
          .from('produtos')
          .insert(productsToInsert);

        if (error) {
          console.error('Erro ao inserir batch:', error);
          throw error;
        }

        processed += batch.length;
        setProcessedRows(processed);
        setProgress(Math.round((processed / rows.length) * 100));
      }

      toast({
        title: 'Importação concluída!',
        description: `${processed} produtos importados com sucesso.`,
      });

      return { success: true, imported: processed };
    } catch (error: any) {
      console.error('Erro na importação:', error);
      toast({
        title: 'Erro na importação',
        description: error.message || 'Ocorreu um erro ao importar o arquivo.',
        variant: 'destructive',
      });
      return { success: false, error: error.message };
    } finally {
      setIsImporting(false);
    }
  };

  return {
    importCSV,
    isImporting,
    progress,
    totalRows,
    processedRows,
    validationErrors,
  };
};
