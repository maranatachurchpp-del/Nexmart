import { useState, useCallback, useRef } from 'react';
import ExcelJS from 'exceljs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { parseXlsxFileToJson, downloadWorkbook } from '@/lib/exceljs-utils';

interface ColumnMapping {
  sourceColumn: string;
  targetColumn: string;
  confidence: number;
  suggested: boolean;
}

interface ValidationIssue {
  row: number;
  column: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  suggestion?: string;
}

interface ImportAnalysis {
  totalRows: number;
  validRows: number;
  columnsDetected: string[];
  columnMappings: ColumnMapping[];
  issues: ValidationIssue[];
  dataQuality: number;
  missingFields: string[];
  suggestedDefaults: Record<string, any>;
}

interface SmartImportResult {
  success: boolean;
  imported: number;
  updated: number;
  errors: ValidationIssue[];
}

interface ImportProgress {
  currentBatch: number;
  totalBatches: number;
  processedRecords: number;
  totalRecords: number;
  estimatedTimeRemaining?: number;
}

const TARGET_COLUMNS = [
  { name: 'codigo', required: true, aliases: ['cod', 'code', 'sku', 'código', 'id_produto', 'produto_id'] },
  { name: 'descricao', required: true, aliases: ['desc', 'description', 'descrição', 'nome', 'name', 'produto', 'item'] },
  { name: 'departamento', required: true, aliases: ['dept', 'depart', 'department', 'setor', 'seção'] },
  { name: 'categoria', required: true, aliases: ['cat', 'category', 'grupo', 'group'] },
  { name: 'subcategoria', required: true, aliases: ['subcat', 'subcategory', 'sub_categoria', 'sub-categoria', 'subgrupo'] },
  { name: 'quebra_esperada', required: false, aliases: ['quebra_esp', 'quebra_meta', 'meta_quebra', 'perda_esperada'] },
  { name: 'quebra_atual', required: false, aliases: ['quebra', 'perda', 'perda_atual'] },
  { name: 'ruptura_esperada', required: false, aliases: ['ruptura_esp', 'ruptura_meta', 'meta_ruptura', 'stockout_meta'] },
  { name: 'ruptura_atual', required: false, aliases: ['ruptura', 'stockout', 'falta_estoque', 'indisponibilidade'] },
  { name: 'margem_a_min', required: false, aliases: ['margem_min', 'margem_minima', 'min_margin', 'margin_min'] },
  { name: 'margem_a_max', required: false, aliases: ['margem_max', 'margem_maxima', 'max_margin', 'margin_max'] },
  { name: 'marcas_min', required: false, aliases: ['min_marcas', 'brands_min', 'qtd_marcas_min'] },
  { name: 'marcas_max', required: false, aliases: ['max_marcas', 'brands_max', 'qtd_marcas_max'] },
  { name: 'marcas_atuais', required: false, aliases: ['marcas', 'brands', 'qtd_marcas', 'num_marcas'] },
  { name: 'giro_ideal_mes', required: false, aliases: ['giro', 'giro_ideal', 'turnover', 'rotatividade'] },
  { name: 'participacao_faturamento', required: false, aliases: ['participacao', 'share', 'part_fat', 'revenue_share'] },
  { name: 'preco_medio_min', required: false, aliases: ['preco_min', 'price_min', 'min_price'] },
  { name: 'preco_medio_max', required: false, aliases: ['preco_max', 'price_max', 'max_price'] },
  { name: 'classificacao_kvi', required: false, aliases: ['kvi', 'classificacao', 'classification', 'importance'] },
  { name: 'status', required: false, aliases: ['situacao', 'estado', 'state'] },
];

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
};

// Batch configuration based on file size
const getBatchConfig = (totalRows: number) => {
  if (totalRows > 10000) {
    return { batchSize: 50, delayBetweenBatches: 150 };
  } else if (totalRows > 5000) {
    return { batchSize: 75, delayBetweenBatches: 100 };
  } else {
    return { batchSize: 100, delayBetweenBatches: 50 };
  }
};

export const useSmartCSVImport = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analysis, setAnalysis] = useState<ImportAnalysis | null>(null);
  const [importProgress, setImportProgress] = useState<ImportProgress | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isCancelledRef = useRef(false);

  const normalizeColumnName = (name: string): string => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
  };

  const calculateSimilarity = (str1: string, str2: string): number => {
    const s1 = normalizeColumnName(str1);
    const s2 = normalizeColumnName(str2);
    
    if (s1 === s2) return 1;
    if (s1.includes(s2) || s2.includes(s1)) return 0.8;
    
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;
    
    if (longer.length === 0) return 1;
    
    const costs: number[] = [];
    for (let i = 0; i <= shorter.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= longer.length; j++) {
        if (i === 0) {
          costs[j] = j;
        } else if (j > 0) {
          let newValue = costs[j - 1];
          if (shorter.charAt(i - 1) !== longer.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
      if (i > 0) costs[longer.length] = lastValue;
    }
    
    return (longer.length - costs[longer.length]) / longer.length;
  };

  const findBestColumnMatch = (sourceColumn: string): ColumnMapping | null => {
    let bestMatch: ColumnMapping | null = null;
    let highestConfidence = 0;

    for (const target of TARGET_COLUMNS) {
      if (normalizeColumnName(sourceColumn) === normalizeColumnName(target.name)) {
        return {
          sourceColumn,
          targetColumn: target.name,
          confidence: 1,
          suggested: true,
        };
      }

      for (const alias of target.aliases) {
        const similarity = calculateSimilarity(sourceColumn, alias);
        if (similarity > highestConfidence && similarity > 0.6) {
          highestConfidence = similarity;
          bestMatch = {
            sourceColumn,
            targetColumn: target.name,
            confidence: similarity,
            suggested: true,
          };
        }
      }

      const nameSimilarity = calculateSimilarity(sourceColumn, target.name);
      if (nameSimilarity > highestConfidence && nameSimilarity > 0.6) {
        highestConfidence = nameSimilarity;
        bestMatch = {
          sourceColumn,
          targetColumn: target.name,
          confidence: nameSimilarity,
          suggested: true,
        };
      }
    }

    return bestMatch;
  };

  const detectEncoding = async (file: File): Promise<string> => {
    const buffer = await file.slice(0, 1024).arrayBuffer();
    const bytes = new Uint8Array(buffer);
    
    if (bytes[0] === 0xEF && bytes[1] === 0xBB && bytes[2] === 0xBF) {
      return 'UTF-8';
    }
    if (bytes[0] === 0xFF && bytes[1] === 0xFE) {
      return 'UTF-16LE';
    }
    if (bytes[0] === 0xFE && bytes[1] === 0xFF) {
      return 'UTF-16BE';
    }
    
    let hasHighBytes = false;
    for (let i = 0; i < bytes.length; i++) {
      if (bytes[i] > 127) {
        hasHighBytes = true;
        break;
      }
    }
    
    return hasHighBytes ? 'ISO-8859-1' : 'UTF-8';
  };

  const parseFile = async (file: File): Promise<any[]> => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    if (extension === 'xlsx') {
      // Use ExcelJS-based parser
      return parseXlsxFileToJson(file);
    }
    
    // Note: .xls (legacy Excel) is not supported by exceljs; treat as CSV or show error
    if (extension === 'xls') {
      throw new Error('Formato .xls (Excel antigo) não suportado. Por favor, salve como .xlsx ou .csv.');
    }
    
    await detectEncoding(file);
    const text = await file.text();
    
    const firstLine = text.split('\n')[0];
    const delimiters = [',', ';', '\t', '|'];
    let bestDelimiter = ',';
    let maxFields = 0;
    
    for (const delimiter of delimiters) {
      const fields = firstLine.split(delimiter).length;
      if (fields > maxFields) {
        maxFields = fields;
        bestDelimiter = delimiter;
      }
    }
    
    const lines = text.split('\n').filter(line => line.trim());
    const headers = lines[0].split(bestDelimiter).map(h => h.trim().replace(/^["']|["']$/g, ''));
    
    return lines.slice(1).map(line => {
      const values = line.split(bestDelimiter).map(v => v.trim().replace(/^["']|["']$/g, ''));
      const row: Record<string, any> = {};
      headers.forEach((header, i) => {
        row[header] = values[i] || '';
      });
      return row;
    });
  };

  // Retry with exponential backoff
  const retryWithBackoff = async <T,>(
    operation: () => Promise<T>,
    retryCount = 0
  ): Promise<T> => {
    try {
      return await operation();
    } catch (error: any) {
      const isRetryable = 
        error.message?.includes('Failed to fetch') ||
        error.message?.includes('network') ||
        error.message?.includes('timeout') ||
        error.code === 'PGRST116' ||
        error.code === '503';

      if (isRetryable && retryCount < RETRY_CONFIG.maxRetries) {
        const delay = Math.min(
          RETRY_CONFIG.baseDelay * Math.pow(2, retryCount),
          RETRY_CONFIG.maxDelay
        );
        
        // Retry attempt - delay before next try
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return retryWithBackoff(operation, retryCount + 1);
      }
      
      throw error;
    }
  };

  // Delay helper
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const analyzeFile = useCallback(async (file: File): Promise<ImportAnalysis> => {
    setIsAnalyzing(true);
    setProgress(0);

    try {
      const data = await parseFile(file);
      setProgress(30);

      const columnsDetected = data.length > 0 ? Object.keys(data[0]) : [];
      const columnMappings: ColumnMapping[] = [];
      const issues: ValidationIssue[] = [];
      const missingFields: string[] = [];

      for (const sourceCol of columnsDetected) {
        const mapping = findBestColumnMatch(sourceCol);
        if (mapping) {
          columnMappings.push(mapping);
        }
      }
      setProgress(50);

      const mappedTargets = columnMappings.map(m => m.targetColumn);
      for (const target of TARGET_COLUMNS) {
        if (target.required && !mappedTargets.includes(target.name)) {
          missingFields.push(target.name);
        }
      }

      let validRows = 0;
      data.forEach((row, index) => {
        let rowValid = true;

        for (const mapping of columnMappings) {
          const value = row[mapping.sourceColumn];
          
          if (['margem_a_min', 'margem_a_max', 'quebra_esperada', 'quebra_atual', 
               'ruptura_esperada', 'ruptura_atual', 'marcas_min', 'marcas_max',
               'marcas_atuais', 'giro_ideal_mes', 'participacao_faturamento',
               'preco_medio_min', 'preco_medio_max'].includes(mapping.targetColumn)) {
            if (value && isNaN(parseFloat(String(value).replace(',', '.')))) {
              issues.push({
                row: index + 2,
                column: mapping.sourceColumn,
                message: `Valor numérico inválido: "${value}"`,
                severity: 'warning',
                suggestion: 'Deixar em branco para usar valor padrão (0)',
              });
              rowValid = false;
            }
          }

          if (mapping.targetColumn === 'classificacao_kvi' && value) {
            const normalized = String(value).toLowerCase().trim();
            if (!['alta', 'média', 'media', 'baixa'].includes(normalized)) {
              issues.push({
                row: index + 2,
                column: mapping.sourceColumn,
                message: `Classificação KVI inválida: "${value}"`,
                severity: 'warning',
                suggestion: 'Usar: Alta, Média ou Baixa',
              });
            }
          }
        }

        if (rowValid) validRows++;
      });
      setProgress(80);

      const suggestedDefaults: Record<string, any> = {};
      for (const field of missingFields) {
        switch (field) {
          case 'quebra_esperada':
          case 'quebra_atual':
          case 'ruptura_esperada':
          case 'ruptura_atual':
            suggestedDefaults[field] = 0;
            break;
          case 'margem_a_min':
            suggestedDefaults[field] = 10;
            break;
          case 'margem_a_max':
            suggestedDefaults[field] = 30;
            break;
          case 'marcas_min':
            suggestedDefaults[field] = 3;
            break;
          case 'marcas_max':
            suggestedDefaults[field] = 10;
            break;
          case 'classificacao_kvi':
            suggestedDefaults[field] = 'Média';
            break;
          case 'status':
            suggestedDefaults[field] = 'success';
            break;
        }
      }

      const dataQuality = data.length > 0 ? (validRows / data.length) * 100 : 0;
      setProgress(100);

      const result: ImportAnalysis = {
        totalRows: data.length,
        validRows,
        columnsDetected,
        columnMappings,
        issues,
        dataQuality,
        missingFields: missingFields.filter(f => TARGET_COLUMNS.find(t => t.name === f)?.required),
        suggestedDefaults,
      };

      setAnalysis(result);
      return result;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const cancelImport = useCallback(() => {
    isCancelledRef.current = true;
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    toast({
      title: 'Importação cancelada',
      description: 'A importação foi interrompida pelo usuário',
      variant: 'destructive',
    });
  }, []);

  const importData = useCallback(async (
    file: File,
    mappings: ColumnMapping[],
    defaults: Record<string, any>,
    upsertMode: boolean = false
  ): Promise<SmartImportResult> => {
    setIsImporting(true);
    setProgress(0);
    isCancelledRef.current = false;
    abortControllerRef.current = new AbortController();

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const data = await parseFile(file);
      const errors: ValidationIssue[] = [];
      const validRecords: any[] = [];

      // Transform data
      for (let i = 0; i < data.length; i++) {
        if (isCancelledRef.current) {
          throw new Error('Importação cancelada pelo usuário');
        }

        const row = data[i];
        const record: Record<string, any> = {
          user_id: user.id,
        };

        let hasRequiredFields = true;

        for (const mapping of mappings) {
          let value = row[mapping.sourceColumn];
          
          if (['margem_a_min', 'margem_a_max', 'quebra_esperada', 'quebra_atual',
               'ruptura_esperada', 'ruptura_atual', 'marcas_min', 'marcas_max',
               'marcas_atuais', 'giro_ideal_mes', 'participacao_faturamento',
               'preco_medio_min', 'preco_medio_max'].includes(mapping.targetColumn)) {
            value = parseFloat(String(value || defaults[mapping.targetColumn] || 0).replace(',', '.')) || 0;
          }

          if (mapping.targetColumn === 'classificacao_kvi') {
            const normalized = String(value || defaults.classificacao_kvi || 'Média').toLowerCase().trim();
            if (normalized === 'alta' || normalized === 'high') value = 'Alta';
            else if (normalized === 'baixa' || normalized === 'low') value = 'Baixa';
            else value = 'Média';
          }

          if (mapping.targetColumn === 'status') {
            const normalized = String(value || defaults.status || 'success').toLowerCase().trim();
            if (['warning', 'alerta', 'atenção'].includes(normalized)) value = 'warning';
            else if (['destructive', 'error', 'erro', 'crítico'].includes(normalized)) value = 'destructive';
            else value = 'success';
          }

          record[mapping.targetColumn] = value;
        }

        for (const [key, defaultValue] of Object.entries(defaults)) {
          if (record[key] === undefined || record[key] === '' || record[key] === null) {
            record[key] = defaultValue;
          }
        }

        const requiredFields = ['codigo', 'descricao', 'departamento', 'categoria', 'subcategoria'];
        for (const field of requiredFields) {
          if (!record[field] || String(record[field]).trim() === '') {
            hasRequiredFields = false;
            errors.push({
              row: i + 2,
              column: field,
              message: `Campo obrigatório não preenchido: ${field}`,
              severity: 'error',
            });
          }
        }

        if (hasRequiredFields) {
          validRecords.push(record);
        }

        setProgress(Math.floor((i / data.length) * 30));
      }

      if (validRecords.length === 0) {
        throw new Error('Nenhum registro válido para importar');
      }

      // Get batch configuration based on file size
      const { batchSize, delayBetweenBatches } = getBatchConfig(validRecords.length);
      const totalBatches = Math.ceil(validRecords.length / batchSize);
      
      let imported = 0;
      let updated = 0;
      const startTime = Date.now();

      for (let i = 0; i < validRecords.length; i += batchSize) {
        if (isCancelledRef.current) {
          throw new Error('Importação cancelada pelo usuário');
        }

        const batchNumber = Math.floor(i / batchSize) + 1;
        const batch = validRecords.slice(i, i + batchSize);

        // Update progress info
        const elapsedTime = Date.now() - startTime;
        const recordsProcessed = i;
        const estimatedTimeRemaining = recordsProcessed > 0 
          ? Math.round((elapsedTime / recordsProcessed) * (validRecords.length - recordsProcessed) / 1000)
          : undefined;

        setImportProgress({
          currentBatch: batchNumber,
          totalBatches,
          processedRecords: i,
          totalRecords: validRecords.length,
          estimatedTimeRemaining,
        });

        try {
          if (upsertMode) {
            const result = await retryWithBackoff(async () => {
              const { error, data: upsertData } = await supabase
                .from('produtos')
                .upsert(batch, { onConflict: 'user_id,codigo' })
                .select();

              if (error) throw error;
              return upsertData;
            });

            updated += result?.length || 0;
          } else {
            await retryWithBackoff(async () => {
              const { error } = await supabase
                .from('produtos')
                .insert(batch);

              if (error) throw error;
            });

            imported += batch.length;
          }
        } catch (batchError: any) {
          // Log batch error but continue with remaining batches
          console.error(`Erro no lote ${batchNumber}:`, batchError);
          
          // Add error for each record in the failed batch
          for (let j = 0; j < batch.length; j++) {
            errors.push({
              row: i + j + 2,
              column: '',
              message: `Falha ao importar: ${batchError.message}`,
              severity: 'error',
            });
          }
          
          // If it's a network error, throw to stop the import
          if (batchError.message?.includes('Failed to fetch')) {
            throw new Error(
              `Erro de conexão ao importar lote ${batchNumber}/${totalBatches}. ` +
              `${imported + updated} registros foram processados antes da falha. ` +
              `Verifique sua conexão e tente novamente.`
            );
          }
        }

        const progressPercent = 30 + Math.floor((i / validRecords.length) * 70);
        setProgress(progressPercent);

        // Add delay between batches to avoid throttling
        if (i + batchSize < validRecords.length) {
          await delay(delayBetweenBatches);
        }
      }

      const totalProcessed = imported + updated;
      
      toast({
        title: 'Importação concluída!',
        description: upsertMode
          ? `${updated} registros atualizados/inseridos`
          : `${imported} registros importados`,
      });

      return {
        success: true,
        imported,
        updated,
        errors,
      };
    } catch (error: any) {
      // Enhanced error messages
      let errorMessage = error.message;
      
      if (error.message?.includes('Failed to fetch')) {
        errorMessage = 'Erro de conexão com o servidor. Isso pode ocorrer com arquivos muito grandes. Tente dividir o arquivo em partes menores ou verificar sua conexão.';
      } else if (error.message?.includes('timeout')) {
        errorMessage = 'O servidor demorou muito para responder. Tente novamente ou divida o arquivo em partes menores.';
      } else if (error.message?.includes('payload too large')) {
        errorMessage = 'O arquivo é muito grande. Divida-o em arquivos menores com até 5.000 linhas cada.';
      }

      toast({
        title: 'Erro na importação',
        description: errorMessage,
        variant: 'destructive',
      });

      return {
        success: false,
        imported: 0,
        updated: 0,
        errors: [{
          row: 0,
          column: '',
          message: errorMessage,
          severity: 'error',
        }],
      };
    } finally {
      setIsImporting(false);
      setProgress(100);
      setImportProgress(null);
      abortControllerRef.current = null;
    }
  }, []);

  const generateTemplate = useCallback(async () => {
    const headers = TARGET_COLUMNS.map(c => c.name);
    const sampleRow: Record<string, any> = {
      codigo: 'PROD001',
      descricao: 'Produto Exemplo',
      departamento: 'Alimentos',
      categoria: 'Grãos',
      subcategoria: 'Arroz',
      quebra_esperada: 2.5,
      quebra_atual: 3.0,
      ruptura_esperada: 1.5,
      ruptura_atual: 2.0,
      margem_a_min: 15,
      margem_a_max: 25,
      marcas_min: 3,
      marcas_max: 8,
      marcas_atuais: 5,
      giro_ideal_mes: 45,
      participacao_faturamento: 10,
      preco_medio_min: 5.00,
      preco_medio_max: 15.00,
      classificacao_kvi: 'Alta',
      status: 'success',
    };

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Produtos');
    ws.columns = headers.map((h) => ({ header: h, key: h, width: 18 }));
    ws.addRow(sampleRow);

    await downloadWorkbook(wb, 'template_produtos.xlsx');

    toast({
      title: 'Template gerado!',
      description: 'Arquivo template_produtos.xlsx baixado',
    });
  }, []);

  return {
    isAnalyzing,
    isImporting,
    progress,
    analysis,
    importProgress,
    analyzeFile,
    importData,
    generateTemplate,
    cancelImport,
    resetAnalysis: () => setAnalysis(null),
  };
};
