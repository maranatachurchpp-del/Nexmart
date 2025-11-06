import { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCSVImport, ValidationError } from '@/hooks/useCSVImport';

interface CSVUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const CSVUploadDialog = ({ open, onOpenChange, onSuccess }: CSVUploadDialogProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { importCSV, isImporting, progress, totalRows, processedRows, validationErrors } = useCSVImport();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.csv') && !file.name.endsWith('.xlsx')) {
        alert('Por favor, selecione um arquivo CSV ou XLSX');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const result = await importCSV(selectedFile);
    
    if (result.success) {
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onSuccess?.();
      setTimeout(() => onOpenChange(false), 1500);
    }
  };

  const handleCancel = () => {
    if (!isImporting) {
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onOpenChange(false);
    }
  };

  const groupErrorsByRow = (errors: ValidationError[]) => {
    const grouped = new Map<number, ValidationError[]>();
    errors.forEach(error => {
      if (!grouped.has(error.row)) {
        grouped.set(error.row, []);
      }
      grouped.get(error.row)?.push(error);
    });
    return grouped;
  };

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Importar Produtos via CSV</DialogTitle>
          <DialogDescription>
            Faça upload de um arquivo CSV ou XLSX com os dados dos produtos
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* File Upload Area */}
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
            <FileSpreadsheet className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <div className="space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx"
                onChange={handleFileSelect}
                disabled={isImporting}
                className="hidden"
                id="csv-upload"
              />
              <label htmlFor="csv-upload">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isImporting}
                  onClick={() => fileInputRef.current?.click()}
                  className="cursor-pointer"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Selecionar Arquivo
                </Button>
              </label>
              {selectedFile && (
                <p className="text-sm text-muted-foreground">
                  Arquivo selecionado: <strong>{selectedFile.name}</strong>
                </p>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          {isImporting && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Importando produtos...</span>
                <span>{processedRows} / {totalRows}</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {/* Validation Errors */}
          {validationErrors.length > 0 && !isImporting && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle className="font-semibold mb-2">
                Erros de Validação Encontrados
              </AlertTitle>
              <AlertDescription>
                <p className="mb-3 text-sm">
                  {validationErrors.length} erro(s) em {new Set(validationErrors.map(e => e.row)).size} linha(s). 
                  Corrija os erros abaixo e tente novamente.
                </p>
                <ScrollArea className="h-[240px] w-full rounded-md border border-destructive/30 bg-background/50 p-3">
                  <div className="space-y-3">
                    {Array.from(groupErrorsByRow(validationErrors)).map(([rowNum, errors]) => (
                      <div key={rowNum} className="space-y-1 pb-3 border-b border-border last:border-0">
                        <p className="font-semibold text-sm text-foreground">Linha {rowNum}:</p>
                        <ul className="space-y-1.5 ml-1">
                          {errors.map((error, idx) => (
                            <li key={idx} className="text-xs flex items-start gap-1.5">
                              <span className="text-destructive mt-0.5">•</span>
                              <div className="flex-1">
                                <span className="font-medium text-foreground">{error.field}</span>
                                <span className="text-muted-foreground">: {error.message}</span>
                                {error.value !== undefined && error.value !== '' && (
                                  <div className="text-muted-foreground italic mt-0.5">
                                    Valor informado: "{error.value}"
                                  </div>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </AlertDescription>
            </Alert>
          )}

          {/* Success Message */}
          {!isImporting && progress === 100 && validationErrors.length === 0 && (
            <Alert className="border-success bg-success/10">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <AlertDescription className="text-success">
                Importação concluída com sucesso!
              </AlertDescription>
            </Alert>
          )}

          {/* Instructions */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Formato esperado:</strong>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• Colunas obrigatórias: codigo, descricao, departamento, categoria, subcategoria</li>
                <li>• Colunas opcionais: quebra_esperada, quebra_atual, margem_a_min, margem_a_max, marcas_min, marcas_max, marcas_atuais, giro_ideal_mes, participacao_faturamento, preco_medio_min, preco_medio_max, classificacao_kvi, status</li>
              </ul>
            </AlertDescription>
          </Alert>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isImporting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || isImporting}
          >
            {isImporting ? 'Importando...' : 'Importar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
