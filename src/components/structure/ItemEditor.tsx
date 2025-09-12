import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

interface ItemEditorProps {
  item: any;
  onSave: (item: any) => void;
  onCancel: () => void;
}

export const ItemEditor = ({ item, onSave, onCancel }: ItemEditorProps) => {
  const [formData, setFormData] = useState(item);

  useEffect(() => {
    setFormData(item);
  }, [item]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedChange = (field: string, subField: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: {
        ...prev[field],
        [subField]: value
      }
    }));
  };

  const calculateStatus = () => {
    if (formData.tipo !== 'produto') return 'success';
    
    const margemOk = formData.margemAtual >= formData.margemA?.min;
    const marcasOk = formData.marcasAtuais >= formData.marcasMin && formData.marcasAtuais <= formData.marcasMax;
    const quebraOk = formData.quebraAtual <= formData.quebraEsperada;
    
    if (margemOk && marcasOk && quebraOk) return 'success';
    
    const margemCritical = formData.margemAtual < (formData.margemA?.min || 0) - 2;
    const marcasCritical = Math.abs(formData.marcasAtuais - (formData.marcasMin + formData.marcasMax) / 2) > 2;
    const quebraCritical = formData.quebraAtual > formData.quebraEsperada + 2;
    
    if (margemCritical || marcasCritical || quebraCritical) return 'destructive';
    
    return 'warning';
  };

  const handleSave = () => {
    const updatedItem = {
      ...formData,
      status: calculateStatus()
    };
    onSave(updatedItem);
  };

  const isProduct = formData.tipo === 'produto';

  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {item.codigo ? 'Editar' : 'Adicionar'} {formData.tipo}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="font-medium">Informações Básicas</h3>
            
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="nome">Nome {isProduct ? 'do Produto' : `do ${formData.tipo}`}</Label>
                <Input
                  id="nome"
                  value={isProduct ? formData.descricao : formData.nome}
                  onChange={(e) => 
                    handleInputChange(isProduct ? 'descricao' : 'nome', e.target.value)
                  }
                  placeholder={`Digite o nome ${isProduct ? 'do produto' : `do ${formData.tipo}`}`}
                />
              </div>

              {isProduct && (
                <div>
                  <Label htmlFor="codigo">Código do Produto</Label>
                  <Input
                    id="codigo"
                    value={formData.codigo}
                    onChange={(e) => handleInputChange('codigo', e.target.value)}
                    placeholder="Código único do produto"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="departamento">Departamento</Label>
                <Input
                  id="departamento"
                  value={formData.departamento}
                  onChange={(e) => handleInputChange('departamento', e.target.value)}
                  placeholder="Nome do departamento"
                />
              </div>

              {(formData.tipo === 'categoria' || formData.tipo === 'subcategoria' || isProduct) && (
                <div>
                  <Label htmlFor="categoria">Categoria</Label>
                  <Input
                    id="categoria"
                    value={formData.categoria}
                    onChange={(e) => handleInputChange('categoria', e.target.value)}
                    placeholder="Nome da categoria"
                  />
                </div>
              )}

              {(formData.tipo === 'subcategoria' || isProduct) && (
                <div>
                  <Label htmlFor="subcategoria">Subcategoria</Label>
                  <Input
                    id="subcategoria"
                    value={formData.subcategoria}
                    onChange={(e) => handleInputChange('subcategoria', e.target.value)}
                    placeholder="Nome da subcategoria"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Product Specific Fields */}
          {isProduct && (
            <>
              <Separator />
              
              {/* KVI Classification */}
              <div className="space-y-4">
                <h3 className="font-medium">Classificação</h3>
                
                <div>
                  <Label htmlFor="kvi">Classificação KVI</Label>
                  <Select
                    value={formData.classificacaoKVI}
                    onValueChange={(value) => handleInputChange('classificacaoKVI', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Alta">Alta (KVI)</SelectItem>
                      <SelectItem value="Média">Média</SelectItem>
                      <SelectItem value="Baixa">Baixa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              {/* Margins */}
              <div className="space-y-4">
                <h3 className="font-medium">Margens</h3>
                
                <div>
                  <Label htmlFor="margemAtual">Margem Atual (%)</Label>
                  <Input
                    id="margemAtual"
                    type="number"
                    step="0.1"
                    value={formData.margemAtual}
                    onChange={(e) => handleInputChange('margemAtual', parseFloat(e.target.value))}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Margem A - Mínima (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={formData.margemA?.min}
                      onChange={(e) => handleNestedChange('margemA', 'min', parseFloat(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label>Margem A - Máxima (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={formData.margemA?.max}
                      onChange={(e) => handleNestedChange('margemA', 'max', parseFloat(e.target.value))}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Brands */}
              <div className="space-y-4">
                <h3 className="font-medium">Mix de Marcas</h3>
                
                <div>
                  <Label htmlFor="marcasAtuais">Quantidade Atual de Marcas</Label>
                  <Input
                    id="marcasAtuais"
                    type="number"
                    value={formData.marcasAtuais}
                    onChange={(e) => handleInputChange('marcasAtuais', parseInt(e.target.value))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="marcasMin">Mínimo de Marcas</Label>
                    <Input
                      id="marcasMin"
                      type="number"
                      value={formData.marcasMin}
                      onChange={(e) => handleInputChange('marcasMin', parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="marcasMax">Máximo de Marcas</Label>
                    <Input
                      id="marcasMax"
                      type="number"
                      value={formData.marcasMax}
                      onChange={(e) => handleInputChange('marcasMax', parseInt(e.target.value))}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Breakage */}
              <div className="space-y-4">
                <h3 className="font-medium">Quebra/Ruptura</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="quebraAtual">Quebra Atual (%)</Label>
                    <Input
                      id="quebraAtual"
                      type="number"
                      step="0.1"
                      value={formData.quebraAtual}
                      onChange={(e) => handleInputChange('quebraAtual', parseFloat(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="quebraEsperada">Quebra Esperada (%)</Label>
                    <Input
                      id="quebraEsperada"
                      type="number"
                      step="0.1"
                      value={formData.quebraEsperada}
                      onChange={(e) => handleInputChange('quebraEsperada', parseFloat(e.target.value))}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Additional Metrics */}
              <div className="space-y-4">
                <h3 className="font-medium">Métricas Adicionais</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="giroIdeal">Giro Ideal (dias)</Label>
                    <Input
                      id="giroIdeal"
                      type="number"
                      value={formData.giroIdealMes}
                      onChange={(e) => handleInputChange('giroIdealMes', parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="participacao">Participação Faturamento (%)</Label>
                    <Input
                      id="participacao"
                      type="number"
                      step="0.1"
                      value={formData.participacaoFaturamento}
                      onChange={(e) => handleInputChange('participacaoFaturamento', parseFloat(e.target.value))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Preço Médio Mínimo (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.precoMedioReferencia?.min}
                      onChange={(e) => handleNestedChange('precoMedioReferencia', 'min', parseFloat(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label>Preço Médio Máximo (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.precoMedioReferencia?.max}
                      onChange={(e) => handleNestedChange('precoMedioReferencia', 'max', parseFloat(e.target.value))}
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Salvar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};