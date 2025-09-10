export interface Produto {
  codigo: string;
  descricao: string;
  departamento: string;
  categoria: string;
  subcategoria: string;
  quebraEsperada: number;
  margemA: { min: number; max: number };
  margemB: { min: number; max: number };
  margemC: { min: number; max: number };
  marcasMin: number;
  marcasMax: number;
  giroIdealMes: number;
  participacaoFaturamento: number;
  precoMedioReferencia: { min: number; max: number };
  classificacaoKVI: 'Alta' | 'Média' | 'Baixa';
  margemAtual?: number;
  marcasAtuais?: number;
  quebraAtual?: number;
  status: 'success' | 'warning' | 'destructive';
}

export interface DepartamentoSummary {
  nome: string;
  codigo: string;
  totalProdutos: number;
  margemMediaPlanejada: number;
  participacaoFaturamento: number;
  produtosForaPadrao: number;
  status: 'success' | 'warning' | 'destructive';
}

export interface CategoriaSummary {
  nome: string;
  codigo: string;
  departamento: string;
  totalProdutos: number;
  margemMediaPlanejada: number;
  participacaoFaturamento: number;
  produtosForaPadrao: number;
  status: 'success' | 'warning' | 'destructive';
}

export interface AlertaVisual {
  tipo: 'margem' | 'marcas' | 'quebra';
  produto: string;
  codigo: string;
  mensagem: string;
  severidade: 'success' | 'warning' | 'destructive';
}