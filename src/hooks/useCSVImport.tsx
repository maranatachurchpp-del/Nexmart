import { useState } from 'react';
import * as XLSX from 'xlsx';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

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

export const useCSVImport = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalRows, setTotalRows] = useState(0);
  const [processedRows, setProcessedRows] = useState(0);

  const parseCSV = (file: File): Promise<CSVRow[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false });
          
          // Normalize column names (remove spaces, lowercase, etc.)
          const normalizedData = jsonData.map((row: any) => {
            const normalized: any = {};
            Object.keys(row).forEach(key => {
              const normalizedKey = key
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '') // Remove accents
                .replace(/\s+/g, '_')
                .replace(/[^a-z0-9_]/g, '');
              normalized[normalizedKey] = row[key];
            });
            return normalized;
          });

          resolve(normalizedData as CSVRow[]);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = (error) => reject(error);
      reader.readAsBinaryString(file);
    });
  };

  const importCSV = async (file: File) => {
    setIsImporting(true);
    setProgress(0);
    setProcessedRows(0);

    try {
      // Parse CSV
      const rows = await parseCSV(file);
      setTotalRows(rows.length);

      if (rows.length === 0) {
        throw new Error('O arquivo CSV está vazio');
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
  };
};
