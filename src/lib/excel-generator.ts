import * as XLSX from 'xlsx';
import { Produto, DashboardFilters } from '@/types/mercadologico';

export const generateExcelReport = async (produtos: Produto[], filters: DashboardFilters) => {
  // Filtrar produtos com base nos filtros
  const filteredProducts = produtos.filter(produto => {
    if (filters.departamento && produto.departamento !== filters.departamento) return false;
    if (filters.categoria && produto.categoria !== filters.categoria) return false;
    if (filters.subcategoria && produto.subcategoria !== filters.subcategoria) return false;
    if (filters.kvi !== 'todos') {
      const isKvi = produto.classificacaoKVI === 'Alta';
      if (filters.kvi === 'sim' && !isKvi) return false;
      if (filters.kvi === 'nao' && isKvi) return false;
    }
    return true;
  });

  // Preparar dados para Excel
  const excelData = filteredProducts.map(produto => {
    const margemAtual = produto.margemAtual || 0;
    const margemMeta = 18; // Meta padrão
    const quebraAtual = produto.quebraAtual || 0;
    const quebraMeta = 2; // Meta padrão
    const marcasAtuais = produto.marcasAtuais || 0;
    const marcasMin = produto.marcasMin || 2;
    const marcasMax = produto.marcasMax || 5;

    // Calcular status
    let status = 'OK';
    if (margemAtual < margemMeta - 1 || quebraAtual > quebraMeta + 1 || marcasAtuais < marcasMin) {
      status = 'Crítico';
    } else if (margemAtual < margemMeta || quebraAtual > quebraMeta || marcasAtuais > marcasMax) {
      status = 'Atenção';
    }

    return {
      'Departamento': produto.departamento,
      'Categoria': produto.categoria,
      'Subcategoria': produto.subcategoria,
      'Produto': produto.descricao,
      'Código': produto.codigo,
      'KVI': produto.classificacaoKVI === 'Alta' ? 'Sim' : 'Não',
      'Receita (R$)': (produto.participacaoFaturamento || 0) * 1000,
      'Margem Atual (%)': margemAtual,
      'Margem Meta (%)': margemMeta,
      'Quebra Atual (%)': quebraAtual,
      'Quebra Meta (%)': quebraMeta,
      'Preço Médio (R$)': (produto.precoMedioReferencia?.min || 0 + produto.precoMedioReferencia?.max || 0) / 2,
      'Marcas Atuais': marcasAtuais,
      'Marcas Min': marcasMin,
      'Marcas Max': marcasMax,
      'Giro Ideal (dias)': produto.giroIdealMes || 30,
      'Status': status,
      'Participação Receita (%)': produto.participacaoFaturamento || 0
    };
  });

  // Criar workbook
  const wb = XLSX.utils.book_new();
  
  // Aba principal com dados
  const ws = XLSX.utils.json_to_sheet(excelData);
  
  // Definir largura das colunas
  const colWidths = [
    { wch: 15 }, // Departamento
    { wch: 15 }, // Categoria
    { wch: 15 }, // Subcategoria
    { wch: 30 }, // Produto
    { wch: 12 }, // Código
    { wch: 8 },  // KVI
    { wch: 12 }, // Receita
    { wch: 12 }, // Margem Atual
    { wch: 12 }, // Margem Meta
    { wch: 12 }, // Quebra Atual
    { wch: 12 }, // Quebra Meta
    { wch: 12 }, // Preço Médio
    { wch: 12 }, // Marcas Atuais
    { wch: 10 }, // Marcas Min
    { wch: 10 }, // Marcas Max
    { wch: 12 }, // Giro Ideal
    { wch: 10 }, // Status
    { wch: 15 }  // Participação
  ];
  ws['!cols'] = colWidths;

  XLSX.utils.book_append_sheet(wb, ws, 'Relatório Analítico');

  // Aba de resumo
  const resumoData = [
    ['Métrica', 'Valor'],
    ['Total de Produtos', filteredProducts.length],
    ['Receita Total (R$)', filteredProducts.reduce((sum, p) => sum + (p.participacaoFaturamento || 0), 0) * 1000],
    ['Margem Média (%)', filteredProducts.reduce((sum, p) => sum + (p.margemAtual || 0), 0) / filteredProducts.length],
    ['Quebra Média (%)', filteredProducts.reduce((sum, p) => sum + (p.quebraAtual || 0), 0) / filteredProducts.length],
    ['Produtos KVI', filteredProducts.filter(p => p.classificacaoKVI === 'Alta').length],
    ['Produtos OK', excelData.filter(p => p.Status === 'OK').length],
    ['Produtos Atenção', excelData.filter(p => p.Status === 'Atenção').length],
    ['Produtos Críticos', excelData.filter(p => p.Status === 'Crítico').length]
  ];

  const wsResumo = XLSX.utils.aoa_to_sheet(resumoData);
  wsResumo['!cols'] = [{ wch: 20 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(wb, wsResumo, 'Resumo');

  // Download
  const currentDate = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `relatorio-analitico-${currentDate}.xlsx`);
};

export const generateStandardTemplate = async (produtos: Produto[]) => {
  // Preparar template com estrutura padrão
  const templateData = produtos.map(produto => ({
    'Departamento': produto.departamento,
    'Categoria': produto.categoria,
    'Subcategoria': produto.subcategoria,
    'Produto': produto.descricao,
    'Código': produto.codigo,
    'Receita (R$)': (produto.participacaoFaturamento || 0) * 1000,
    'Margem (%)': produto.margemAtual || 0,
    '% Quebra': produto.quebraAtual || 0,
    'Qtde Marcas Atual': produto.marcasAtuais || 0,
    'Qtde Marcas Min': produto.marcasMin || 2,
    'Qtde Marcas Max': produto.marcasMax || 5,
    'Preço Médio Real': ((produto.precoMedioReferencia?.min || 0) + (produto.precoMedioReferencia?.max || 0)) / 2,
    'Preço Referência Min': produto.precoMedioReferencia?.min || 0,
    'Preço Referência Max': produto.precoMedioReferencia?.max || 0,
    'Giro Ideal (dias)': produto.giroIdealMes || 30,
    'KVI': produto.classificacaoKVI === 'Alta' ? 'Sim' : 'Não',
    'Margem A Min (%)': produto.margemA?.min || 15,
    'Margem A Max (%)': produto.margemA?.max || 20,
    'Margem B Min (%)': produto.margemB?.min || 12,
    'Margem B Max (%)': produto.margemB?.max || 18,
    'Margem C Min (%)': produto.margemC?.min || 8,
    'Margem C Max (%)': produto.margemC?.max || 15,
    'Quebra Esperada (%)': produto.quebraEsperada || 2,
    'Participação Faturamento (%)': produto.participacaoFaturamento || 0
  }));

  // Criar workbook
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(templateData);

  // Definir largura das colunas
  const colWidths = Array(24).fill({ wch: 15 });
  ws['!cols'] = colWidths;

  XLSX.utils.book_append_sheet(wb, ws, 'Estrutura Mercadológica');

  // Aba de instruções
  const instrucoes = [
    ['Instruções de Uso da Planilha Padrão'],
    [''],
    ['Esta planilha contém a estrutura mercadológica completa do seu supermercado.'],
    ['Você pode editar os dados e reimportar no sistema.'],
    [''],
    ['Campos Principais:'],
    ['- Departamento/Categoria/Subcategoria/Produto: Hierarquia dos itens'],
    ['- Receita: Valor de vendas em reais'],
    ['- Margem (%): Margem de lucro atual'],
    ['- % Quebra: Percentual de quebra/perda'],
    ['- Qtde Marcas: Quantidade de marcas (atual, mínima e máxima recomendada)'],
    ['- Preço: Valores de referência de mercado'],
    ['- Giro Ideal: Dias ideais para renovação do estoque'],
    ['- KVI: Produtos de alta importância (Key Value Items)'],
    ['- Margens A/B/C: Faixas de margem por classificação'],
    [''],
    ['Para reimportar:'],
    ['1. Salve o arquivo em formato CSV ou XLSX'],
    ['2. Use a função "Importar CSV" no sistema'],
    ['3. Aguarde o processamento e validação']
  ];

  const wsInstrucoes = XLSX.utils.aoa_to_sheet(instrucoes);
  wsInstrucoes['!cols'] = [{ wch: 80 }];
  XLSX.utils.book_append_sheet(wb, wsInstrucoes, 'Instruções');

  // Download
  const currentDate = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `planilha-padrao-mercadologica-${currentDate}.xlsx`);
};