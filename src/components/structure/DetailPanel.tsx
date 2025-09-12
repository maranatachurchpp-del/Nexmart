import { Edit, Trash2, TrendingUp, TrendingDown, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { StatusBadge } from '@/components/StatusBadge';

interface DetailPanelProps {
  item: any;
  onEdit: (item: any) => void;
  onDelete: (item: any) => void;
}

export const DetailPanel = ({ item, onEdit, onDelete }: DetailPanelProps) => {
  if (!item) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-muted-foreground">
            Selecione um item
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center text-sm text-muted-foreground">
          Clique em qualquer item da árvore para ver os detalhes
        </CardContent>
      </Card>
    );
  }

  const getValidationStatus = () => {
    if (item.tipo !== 'produto') return null;
    
    const margemStatus = item.margemAtual >= item.margemA.min ? 'success' : 
                        item.margemAtual >= item.margemA.min - 1 ? 'warning' : 'destructive';
    
    const marcasStatus = item.marcasAtuais >= item.marcasMin && item.marcasAtuais <= item.marcasMax ? 'success' :
                        Math.abs(item.marcasAtuais - (item.marcasMin + item.marcasMax) / 2) <= 1 ? 'warning' : 'destructive';
    
    const quebraStatus = item.quebraAtual <= item.quebraEsperada ? 'success' :
                        item.quebraAtual <= item.quebraEsperada + 1 ? 'warning' : 'destructive';

    return { margemStatus, marcasStatus, quebraStatus };
  };

  const validationStatus = getValidationStatus();

  const getRecommendations = () => {
    if (item.tipo !== 'produto' || !validationStatus) return [];
    
    const recommendations = [];
    
    if (validationStatus.margemStatus !== 'success') {
      const diff = item.margemA.min - item.margemAtual;
      recommendations.push({
        type: 'margin',
        message: `Margem ${diff > 0 ? `${diff.toFixed(1)}% abaixo` : `${Math.abs(diff).toFixed(1)}% acima`} da meta`,
        severity: validationStatus.margemStatus
      });
    }
    
    if (validationStatus.marcasStatus !== 'success') {
      const ideal = Math.floor((item.marcasMin + item.marcasMax) / 2);
      const diff = ideal - item.marcasAtuais;
      recommendations.push({
        type: 'brands',
        message: `${diff > 0 ? 'Adicionar' : 'Reduzir'} ${Math.abs(diff)} marca${Math.abs(diff) > 1 ? 's' : ''}`,
        severity: validationStatus.marcasStatus
      });
    }
    
    if (validationStatus.quebraStatus !== 'success') {
      const diff = item.quebraAtual - item.quebraEsperada;
      recommendations.push({
        type: 'breakage',
        message: `Quebra ${diff.toFixed(1)}% acima do esperado`,
        severity: validationStatus.quebraStatus
      });
    }
    
    return recommendations;
  };

  const recommendations = getRecommendations();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="truncate">{item.nome || item.descricao}</CardTitle>
          <div className="flex gap-1">
            <Button size="sm" variant="outline" onClick={() => onEdit(item)}>
              <Edit className="w-4 h-4" />
            </Button>
            {item.tipo === 'produto' && (
              <Button size="sm" variant="outline" onClick={() => onDelete(item)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="outline">{item.tipo}</Badge>
          {item.classificacaoKVI === 'Alta' && (
            <Badge variant="secondary">KVI</Badge>
          )}
          {item.status && (
            <StatusBadge
              status={item.status}
              label={item.status === 'success' ? 'OK' : item.status === 'warning' ? 'Atenção' : 'Crítico'}
            />
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Basic Info */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Informações Básicas</h4>
          {item.codigo && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Código:</span>
              <span className="font-medium">{item.codigo}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Departamento:</span>
            <span className="font-medium">{item.departamento}</span>
          </div>
          {item.categoria && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Categoria:</span>
              <span className="font-medium">{item.categoria}</span>
            </div>
          )}
          {item.subcategoria && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subcategoria:</span>
              <span className="font-medium">{item.subcategoria}</span>
            </div>
          )}
        </div>

        {/* Product specific metrics */}
        {item.tipo === 'produto' && validationStatus && (
          <>
            <Separator />
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Métricas de Performance</h4>
              
              {/* Margin */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Margem Atual</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{item.margemAtual}%</span>
                  <StatusBadge
                    status={validationStatus.margemStatus as 'success' | 'warning' | 'destructive'}
                    label=""
                    className="w-3 h-3 rounded-full p-0"
                  />
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                Meta: {item.margemA.min}% - {item.margemA.max}%
              </div>

              {/* Brands */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Marcas Ativas</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{item.marcasAtuais}</span>
                  <StatusBadge
                    status={validationStatus.marcasStatus as 'success' | 'warning' | 'destructive'}
                    label=""
                    className="w-3 h-3 rounded-full p-0"
                  />
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                Recomendado: {item.marcasMin} - {item.marcasMax}
              </div>

              {/* Breakage */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Quebra Atual</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{item.quebraAtual}%</span>
                  <StatusBadge
                    status={validationStatus.quebraStatus as 'success' | 'warning' | 'destructive'}
                    label=""
                    className="w-3 h-3 rounded-full p-0"
                  />
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                Meta: até {item.quebraEsperada}%
              </div>
            </div>
          </>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Recomendações
              </h4>
              <div className="space-y-2">
                {recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-2 p-2 rounded border-l-2 border-l-warning bg-warning/5">
                    <AlertCircle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{rec.message}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Additional Info */}
        {item.tipo === 'produto' && (
          <>
            <Separator />
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Informações Adicionais</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Giro Ideal:</span>
                  <div className="font-medium">{item.giroIdealMes} dias</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Participação:</span>
                  <div className="font-medium">{item.participacaoFaturamento}%</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Preço Min:</span>
                  <div className="font-medium">R$ {item.precoMedioReferencia.min}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Preço Max:</span>
                  <div className="font-medium">R$ {item.precoMedioReferencia.max}</div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Actions */}
        <Separator />
        <div className="flex gap-2">
          <Button onClick={() => onEdit(item)} className="flex-1">
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
          {item.tipo === 'produto' && (
            <Button variant="destructive" onClick={() => onDelete(item)} className="flex-1">
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};