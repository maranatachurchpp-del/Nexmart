import React, { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GlassCard } from "@/components/ui/glass-card";
import { useSmartCSVImport } from "@/hooks/useSmartCSVImport";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  ArrowLeft,
  Download,
  Sparkles,
  Link2,
  Unlink,
  RefreshCw,
  Clock,
  StopCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ImportWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

type WizardStep = "upload" | "mapping" | "validation" | "confirm" | "result";

export function ImportWizard({ open, onOpenChange, onSuccess }: ImportWizardProps) {
  const [step, setStep] = useState<WizardStep>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [upsertMode, setUpsertMode] = useState(false);
  const [customMappings, setCustomMappings] = useState<Record<string, string>>({});
  const [customDefaults, setCustomDefaults] = useState<Record<string, any>>({});

  const {
    isAnalyzing,
    isImporting,
    progress,
    analysis,
    importProgress,
    analyzeFile,
    importData,
    generateTemplate,
    cancelImport,
    resetAnalysis,
  } = useSmartCSVImport();

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    await analyzeFile(selectedFile);
    setStep("mapping");
  }, [analyzeFile]);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (!droppedFile) return;

    setFile(droppedFile);
    await analyzeFile(droppedFile);
    setStep("mapping");
  }, [analyzeFile]);

  const handleImport = useCallback(async () => {
    if (!file || !analysis) return;

    const mappings = analysis.columnMappings.map((m) => ({
      ...m,
      targetColumn: customMappings[m.sourceColumn] || m.targetColumn,
    }));

    const defaults = { ...analysis.suggestedDefaults, ...customDefaults };

    const result = await importData(file, mappings, defaults, upsertMode);

    if (result.success) {
      setStep("result");
      onSuccess?.();
    }
  }, [file, analysis, customMappings, customDefaults, upsertMode, importData, onSuccess]);

  const handleClose = () => {
    if (isImporting) {
      cancelImport();
    }
    setStep("upload");
    setFile(null);
    resetAnalysis();
    setCustomMappings({});
    setCustomDefaults({});
    onOpenChange(false);
  };

  const formatTimeRemaining = (seconds: number | undefined) => {
    if (!seconds) return '';
    if (seconds < 60) return `~${seconds}s restantes`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `~${minutes}m ${secs}s restantes`;
  };

  const renderUploadStep = () => (
    <div className="space-y-6">
      <div
        className={cn(
          "border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200",
          "hover:border-primary/50 hover:bg-primary/5",
          "cursor-pointer"
        )}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-upload"
          accept=".csv,.xlsx,.xls,.tsv"
          onChange={handleFileSelect}
          className="hidden"
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-primary/10 rounded-full">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">
                Arraste seu arquivo ou clique para selecionar
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                CSV, XLSX, XLS ou TSV (max. 50MB)
              </p>
            </div>
          </div>
        </label>
      </div>

      {isAnalyzing && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">Analisando arquivo...</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t">
        <Button variant="outline" onClick={generateTemplate}>
          <Download className="h-4 w-4 mr-2" />
          Baixar Template
        </Button>
        <p className="text-xs text-muted-foreground">
          Use o template para garantir a compatibilidade
        </p>
      </div>
    </div>
  );

  const renderMappingStep = () => (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <GlassCard className="p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{analysis?.totalRows || 0}</p>
          <p className="text-xs text-muted-foreground">Linhas</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{analysis?.columnsDetected.length || 0}</p>
          <p className="text-xs text-muted-foreground">Colunas</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <p className="text-2xl font-bold text-success">{analysis?.dataQuality.toFixed(0) || 0}%</p>
          <p className="text-xs text-muted-foreground">Qualidade</p>
        </GlassCard>
      </div>

      {/* Large file warning */}
      {analysis && analysis.totalRows > 10000 && (
        <div className="p-3 bg-warning/10 rounded-lg border border-warning/30 flex items-start gap-2">
          <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-warning">Arquivo grande detectado</p>
            <p className="text-muted-foreground">
              {analysis.totalRows.toLocaleString()} linhas. A importação será feita em lotes menores para garantir estabilidade.
            </p>
          </div>
        </div>
      )}

      {/* Column Mappings */}
      <div>
        <h4 className="font-medium mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          Mapeamento de Colunas (IA)
        </h4>
        <ScrollArea className="h-[200px] rounded-lg border p-3">
          <div className="space-y-2">
            {analysis?.columnMappings.map((mapping) => (
              <div
                key={mapping.sourceColumn}
                className="flex items-center gap-3 p-2 rounded-lg bg-muted/50"
              >
                <Badge variant="outline" className="font-mono text-xs">
                  {mapping.sourceColumn}
                </Badge>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <Badge
                  variant={mapping.confidence > 0.8 ? "default" : "secondary"}
                  className="font-mono text-xs"
                >
                  {mapping.targetColumn}
                </Badge>
                <span className="text-xs text-muted-foreground ml-auto">
                  {(mapping.confidence * 100).toFixed(0)}% confiança
                </span>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Missing Fields */}
      {analysis?.missingFields && analysis.missingFields.length > 0 && (
        <div className="p-4 bg-warning/10 rounded-lg border border-warning/30">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
            <div>
              <p className="font-medium text-warning">Campos obrigatórios não encontrados</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {analysis.missingFields.map((field) => (
                  <Badge key={field} variant="outline" className="text-warning border-warning">
                    {field}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Suggested Defaults */}
      {analysis?.suggestedDefaults && Object.keys(analysis.suggestedDefaults).length > 0 && (
        <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
          <p className="font-medium text-sm mb-3">Valores padrão sugeridos:</p>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(analysis.suggestedDefaults).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground w-32 truncate">{key}</Label>
                <Input
                  value={customDefaults[key] ?? value}
                  onChange={(e) => setCustomDefaults({ ...customDefaults, [key]: e.target.value })}
                  className="h-8 text-sm"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderValidationStep = () => (
    <div className="space-y-4">
      {/* Issues Summary */}
      <div className="grid grid-cols-3 gap-4">
        <GlassCard className="p-4 text-center">
          <CheckCircle2 className="h-6 w-6 text-success mx-auto mb-2" />
          <p className="text-lg font-bold">{analysis?.validRows || 0}</p>
          <p className="text-xs text-muted-foreground">Válidos</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <AlertTriangle className="h-6 w-6 text-warning mx-auto mb-2" />
          <p className="text-lg font-bold">
            {analysis?.issues.filter((i) => i.severity === "warning").length || 0}
          </p>
          <p className="text-xs text-muted-foreground">Avisos</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <XCircle className="h-6 w-6 text-destructive mx-auto mb-2" />
          <p className="text-lg font-bold">
            {analysis?.issues.filter((i) => i.severity === "error").length || 0}
          </p>
          <p className="text-xs text-muted-foreground">Erros</p>
        </GlassCard>
      </div>

      {/* Issues List */}
      {analysis?.issues && analysis.issues.length > 0 && (
        <ScrollArea className="h-[200px] rounded-lg border">
          <div className="p-3 space-y-2">
            {analysis.issues.slice(0, 50).map((issue, i) => (
              <div
                key={i}
                className={cn(
                  "p-3 rounded-lg text-sm",
                  issue.severity === "error" && "bg-destructive/10 border border-destructive/30",
                  issue.severity === "warning" && "bg-warning/10 border border-warning/30",
                  issue.severity === "info" && "bg-primary/10 border border-primary/30"
                )}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">
                      Linha {issue.row} - {issue.column}
                    </p>
                    <p className="text-muted-foreground">{issue.message}</p>
                  </div>
                  {issue.suggestion && (
                    <Badge variant="outline" className="text-xs shrink-0">
                      {issue.suggestion}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
            {analysis.issues.length > 50 && (
              <p className="text-center text-sm text-muted-foreground py-2">
                ... e mais {analysis.issues.length - 50} problemas
              </p>
            )}
          </div>
        </ScrollArea>
      )}

      {/* Upsert Option */}
      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-3">
          {upsertMode ? (
            <Link2 className="h-5 w-5 text-primary" />
          ) : (
            <Unlink className="h-5 w-5 text-muted-foreground" />
          )}
          <div>
            <p className="font-medium">Modo de atualização</p>
            <p className="text-xs text-muted-foreground">
              Atualizar produtos existentes com mesmo código
            </p>
          </div>
        </div>
        <Switch checked={upsertMode} onCheckedChange={setUpsertMode} />
      </div>
    </div>
  );

  const renderConfirmStep = () => (
    <div className="space-y-6 text-center py-4">
      <div className="p-4 bg-primary/10 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
        <FileSpreadsheet className="h-10 w-10 text-primary" />
      </div>

      <div>
        <h3 className="text-xl font-bold">Pronto para importar!</h3>
        <p className="text-muted-foreground mt-2">
          {analysis?.validRows} registros serão {upsertMode ? "importados/atualizados" : "importados"}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
        <div className="text-left">
          <p className="text-sm text-muted-foreground">Arquivo</p>
          <p className="font-medium truncate">{file?.name}</p>
        </div>
        <div className="text-left">
          <p className="text-sm text-muted-foreground">Modo</p>
          <p className="font-medium">{upsertMode ? "Atualizar" : "Inserir"}</p>
        </div>
      </div>

      {isImporting && (
        <div className="space-y-3">
          <Progress value={progress} className="h-2" />
          
          {importProgress && (
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>
                  Processando lote {importProgress.currentBatch} de {importProgress.totalBatches}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {importProgress.processedRecords.toLocaleString()} de {importProgress.totalRecords.toLocaleString()} registros
              </p>
              {importProgress.estimatedTimeRemaining && (
                <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{formatTimeRemaining(importProgress.estimatedTimeRemaining)}</span>
                </div>
              )}
            </div>
          )}
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={cancelImport}
            className="mt-2"
          >
            <StopCircle className="h-4 w-4 mr-2" />
            Cancelar Importação
          </Button>
        </div>
      )}
    </div>
  );

  const renderResultStep = () => (
    <div className="space-y-6 text-center py-4">
      <div className="p-4 bg-success/10 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
        <CheckCircle2 className="h-10 w-10 text-success" />
      </div>

      <div>
        <h3 className="text-xl font-bold text-success">Importação concluída!</h3>
        <p className="text-muted-foreground mt-2">
          {analysis?.validRows} registros foram processados com sucesso
        </p>
      </div>

      <Button onClick={handleClose} className="w-full">
        Fechar
      </Button>
    </div>
  );

  const steps: WizardStep[] = ["upload", "mapping", "validation", "confirm"];
  const currentStepIndex = steps.indexOf(step);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Importação Inteligente
          </DialogTitle>
          <DialogDescription>
            Importe planilhas com detecção automática de colunas e validação
          </DialogDescription>
        </DialogHeader>

        {/* Step Indicator */}
        {step !== "result" && (
          <div className="flex items-center justify-center gap-2 py-4">
            {steps.map((s, i) => (
              <React.Fragment key={s}>
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                    i <= currentStepIndex
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {i + 1}
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={cn(
                      "w-12 h-0.5 transition-all",
                      i < currentStepIndex ? "bg-primary" : "bg-muted"
                    )}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Step Content */}
        <div className="min-h-[300px]">
          {step === "upload" && renderUploadStep()}
          {step === "mapping" && renderMappingStep()}
          {step === "validation" && renderValidationStep()}
          {step === "confirm" && renderConfirmStep()}
          {step === "result" && renderResultStep()}
        </div>

        {/* Navigation */}
        {step !== "upload" && step !== "result" && (
          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setStep(steps[currentStepIndex - 1])}
              disabled={isImporting}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>

            {step === "confirm" ? (
              <Button onClick={handleImport} disabled={isImporting}>
                {isImporting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Importando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Confirmar Importação
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={() => setStep(steps[currentStepIndex + 1])}
                disabled={
                  (step === "mapping" && analysis?.missingFields && analysis.missingFields.length > 0) ||
                  isAnalyzing
                }
              >
                Próximo
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
