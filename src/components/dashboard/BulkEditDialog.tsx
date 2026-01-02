import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Produto } from '@/types/mercadologico';

interface BulkEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  onConfirm: (updates: Partial<Produto>) => void;
}

export const BulkEditDialog = ({
  open,
  onOpenChange,
  selectedCount,
  onConfirm,
}: BulkEditDialogProps) => {
  const [status, setStatus] = useState<string>('');
  const [classificacaoKVI, setClassificacaoKVI] = useState<string>('');
  const [margemMin, setMargemMin] = useState<string>('');
  const [margemMax, setMargemMax] = useState<string>('');
  const [quebraEsperada, setQuebraEsperada] = useState<string>('');
  const [rupturaEsperada, setRupturaEsperada] = useState<string>('');

  const handleConfirm = () => {
    const updates: Partial<Produto> = {};

    if (status) {
      updates.status = status as 'success' | 'warning' | 'destructive';
    }
    if (classificacaoKVI) {
      updates.classificacaoKVI = classificacaoKVI as 'Alta' | 'Média' | 'Baixa';
    }
    if (margemMin || margemMax) {
      updates.margemA = {
        min: margemMin ? parseFloat(margemMin) : 0,
        max: margemMax ? parseFloat(margemMax) : 0,
      };
    }
    if (quebraEsperada) {
      updates.quebraEsperada = parseFloat(quebraEsperada);
    }
    if (rupturaEsperada) {
      updates.rupturaEsperada = parseFloat(rupturaEsperada);
    }

    onConfirm(updates);
    resetForm();
  };

  const resetForm = () => {
    setStatus('');
    setClassificacaoKVI('');
    setMargemMin('');
    setMargemMax('');
    setQuebraEsperada('');
    setRupturaEsperada('');
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) resetForm();
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar em Massa</DialogTitle>
          <DialogDescription>
            Atualizando {selectedCount} produto(s). Deixe em branco os campos que não deseja alterar.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Status
            </Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="success">OK</SelectItem>
                <SelectItem value="warning">Atenção</SelectItem>
                <SelectItem value="destructive">Crítico</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="kvi" className="text-right">
              Classificação KVI
            </Label>
            <Select value={classificacaoKVI} onValueChange={setClassificacaoKVI}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Alta">Alta</SelectItem>
                <SelectItem value="Média">Média</SelectItem>
                <SelectItem value="Baixa">Baixa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Margem (%)</Label>
            <div className="col-span-3 flex gap-2">
              <Input
                type="number"
                step="0.1"
                placeholder="Mín"
                value={margemMin}
                onChange={(e) => setMargemMin(e.target.value)}
              />
              <Input
                type="number"
                step="0.1"
                placeholder="Máx"
                value={margemMax}
                onChange={(e) => setMargemMax(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="quebra" className="text-right">
              Quebra Esperada (%)
            </Label>
            <Input
              id="quebra"
              type="number"
              step="0.1"
              className="col-span-3"
              value={quebraEsperada}
              onChange={(e) => setQuebraEsperada(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="ruptura" className="text-right">
              Ruptura Esperada (%)
            </Label>
            <Input
              id="ruptura"
              type="number"
              step="0.1"
              className="col-span-3"
              value={rupturaEsperada}
              onChange={(e) => setRupturaEsperada(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm}>Aplicar Alterações</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
