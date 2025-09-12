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

export interface KPIData {
  faturamento: {
    valor: number;
    variacao: number;
  };
  margemBruta: {
    valor: number;
    variacao: number;
  };
  ruptura: {
    valor: number;
    meta: number;
  };
  ticketMedio: {
    valor: number;
    variacao: number;
  };
  mixMarcas: {
    atual: number;
    recomendado: { min: number; max: number };
  };
  itensKVI: {
    quantidade: number;
    participacaoReceita: number;
  };
}

export interface DashboardFilters {
  periodo: {
    inicio: Date;
    fim: Date;
  };
  loja?: string;
  departamento?: string;
  categoria?: string;
  subcategoria?: string;
  kvi?: 'sim' | 'nao' | 'todos';
}

export interface TimeSeriesData {
  data: string;
  faturamento: number;
  margem: number;
}