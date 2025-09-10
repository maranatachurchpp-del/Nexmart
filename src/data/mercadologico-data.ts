import { Produto, DepartamentoSummary, CategoriaSummary } from '@/types/mercadologico';

export const produtosSample: Produto[] = [
  // Departamento 1 - Mercearia Doce
  {
    codigo: '1.1.1.1',
    descricao: 'Açúcar Cristal 1kg',
    departamento: 'Mercearia Doce',
    categoria: 'Açúcares e Adoçantes',
    subcategoria: 'Açúcar Cristal',
    quebraEsperada: 0.5,
    margemA: { min: 15, max: 20 },
    margemB: { min: 12, max: 17 },
    margemC: { min: 8, max: 15 },
    marcasMin: 3,
    marcasMax: 8,
    giroIdealMes: 45,
    participacaoFaturamento: 2.5,
    precoMedioReferencia: { min: 3.50, max: 4.20 },
    classificacaoKVI: 'Alta',
    margemAtual: 18,
    marcasAtuais: 5,
    quebraAtual: 0.3,
    status: 'success'
  },
  {
    codigo: '1.1.2.1',
    descricao: 'Chocolate em Pó 200g',
    departamento: 'Mercearia Doce',
    categoria: 'Achocolatados',
    subcategoria: 'Chocolate em Pó',
    quebraEsperada: 1.0,
    margemA: { min: 25, max: 35 },
    margemB: { min: 20, max: 30 },
    margemC: { min: 15, max: 25 },
    marcasMin: 2,
    marcasMax: 6,
    giroIdealMes: 30,
    participacaoFaturamento: 1.8,
    precoMedioReferencia: { min: 6.50, max: 9.90 },
    classificacaoKVI: 'Média',
    margemAtual: 12,
    marcasAtuais: 4,
    quebraAtual: 1.2,
    status: 'destructive'
  },
  // Departamento 2 - Mercearia Salgada
  {
    codigo: '2.1.1.1',
    descricao: 'Arroz Branco Tipo 1 5kg',
    departamento: 'Mercearia Salgada',
    categoria: 'Cereais',
    subcategoria: 'Arroz',
    quebraEsperada: 0.3,
    margemA: { min: 12, max: 18 },
    margemB: { min: 8, max: 15 },
    margemC: { min: 5, max: 12 },
    marcasMin: 4,
    marcasMax: 10,
    giroIdealMes: 60,
    participacaoFaturamento: 4.2,
    precoMedioReferencia: { min: 18.50, max: 25.90 },
    classificacaoKVI: 'Alta',
    margemAtual: 10,
    marcasAtuais: 6,
    quebraAtual: 0.5,
    status: 'warning'
  },
  {
    codigo: '2.2.1.1',
    descricao: 'Óleo de Soja 900ml',
    departamento: 'Mercearia Salgada',
    categoria: 'Óleos e Vinagres',
    subcategoria: 'Óleo de Soja',
    quebraEsperada: 0.8,
    margemA: { min: 18, max: 25 },
    margemB: { min: 15, max: 22 },
    margemC: { min: 10, max: 18 },
    marcasMin: 3,
    marcasMax: 7,
    giroIdealMes: 40,
    participacaoFaturamento: 3.1,
    precoMedioReferencia: { min: 4.90, max: 7.50 },
    classificacaoKVI: 'Alta',
    margemAtual: 20,
    marcasAtuais: 5,
    quebraAtual: 0.6,
    status: 'success'
  },
  // Departamento 3 - Frios e Laticínios
  {
    codigo: '3.1.1.1',
    descricao: 'Leite UHT Integral 1L',
    departamento: 'Frios e Laticínios',
    categoria: 'Leites',
    subcategoria: 'Leite UHT',
    quebraEsperada: 2.0,
    margemA: { min: 20, max: 28 },
    margemB: { min: 15, max: 25 },
    margemC: { min: 10, max: 20 },
    marcasMin: 2,
    marcasMax: 6,
    giroIdealMes: 80,
    participacaoFaturamento: 5.5,
    precoMedioReferencia: { min: 3.20, max: 4.80 },
    classificacaoKVI: 'Alta',
    margemAtual: 16,
    marcasAtuais: 4,
    quebraAtual: 2.8,
    status: 'warning'
  },
  {
    codigo: '3.2.1.1',
    descricao: 'Queijo Mussarela Fatiado 150g',
    departamento: 'Frios e Laticínios',
    categoria: 'Queijos',
    subcategoria: 'Queijo Mussarela',
    quebraEsperada: 3.5,
    margemA: { min: 35, max: 45 },
    margemB: { min: 28, max: 40 },
    margemC: { min: 20, max: 35 },
    marcasMin: 3,
    marcasMax: 8,
    giroIdealMes: 25,
    participacaoFaturamento: 2.3,
    precoMedioReferencia: { min: 8.90, max: 14.50 },
    classificacaoKVI: 'Média',
    margemAtual: 38,
    marcasAtuais: 6,
    quebraAtual: 3.2,
    status: 'success'
  }
];

export const departamentosSummary: DepartamentoSummary[] = [
  {
    nome: 'Mercearia Doce',
    codigo: '1',
    totalProdutos: 156,
    margemMediaPlanejada: 22.5,
    participacaoFaturamento: 18.3,
    produtosForaPadrao: 12,
    status: 'success'
  },
  {
    nome: 'Mercearia Salgada',
    codigo: '2',
    totalProdutos: 298,
    margemMediaPlanejada: 16.8,
    participacaoFaturamento: 35.2,
    produtosForaPadrao: 28,
    status: 'warning'
  },
  {
    nome: 'Frios e Laticínios',
    codigo: '3',
    totalProdutos: 187,
    margemMediaPlanejada: 28.4,
    participacaoFaturamento: 22.1,
    produtosForaPadrao: 8,
    status: 'success'
  },
  {
    nome: 'Bebidas',
    codigo: '4',
    totalProdutos: 124,
    margemMediaPlanejada: 19.7,
    participacaoFaturamento: 15.8,
    produtosForaPadrao: 18,
    status: 'warning'
  },
  {
    nome: 'Limpeza',
    codigo: '5',
    totalProdutos: 89,
    margemMediaPlanejada: 31.2,
    participacaoFaturamento: 8.6,
    produtosForaPadrao: 3,
    status: 'success'
  }
];

export const categoriasSummary: CategoriaSummary[] = [
  {
    nome: 'Açúcares e Adoçantes',
    codigo: '1.1',
    departamento: 'Mercearia Doce',
    totalProdutos: 24,
    margemMediaPlanejada: 18.5,
    participacaoFaturamento: 4.2,
    produtosForaPadrao: 2,
    status: 'success'
  },
  {
    nome: 'Achocolatados',
    codigo: '1.2',
    departamento: 'Mercearia Doce',
    totalProdutos: 18,
    margemMediaPlanejada: 26.8,
    participacaoFaturamento: 2.8,
    produtosForaPadrao: 5,
    status: 'warning'
  },
  {
    nome: 'Cereais',
    codigo: '2.1',
    departamento: 'Mercearia Salgada',
    totalProdutos: 45,
    margemMediaPlanejada: 14.2,
    participacaoFaturamento: 8.5,
    produtosForaPadrao: 8,
    status: 'warning'
  },
  {
    nome: 'Óleos e Vinagres',
    codigo: '2.2',
    departamento: 'Mercearia Salgada',
    totalProdutos: 32,
    margemMediaPlanejada: 19.6,
    participacaoFaturamento: 5.1,
    produtosForaPadrao: 3,
    status: 'success'
  }
];