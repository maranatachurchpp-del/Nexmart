import ExcelJS from "exceljs";
import { Produto, DashboardFilters } from "@/types/mercadologico";
import { downloadWorkbook } from "@/lib/exceljs-utils";

const setColumnWidths = (worksheet: ExcelJS.Worksheet, widths: number[]) => {
  worksheet.columns = widths.map((w) => ({ width: w }));
};

export const generateExcelReport = async (produtos: Produto[], filters: DashboardFilters) => {
  // Filtrar produtos com base nos filtros
  const filteredProducts = produtos.filter((produto) => {
    if (filters.departamento && produto.departamento !== filters.departamento) return false;
    if (filters.categoria && produto.categoria !== filters.categoria) return false;
    if (filters.subcategoria && produto.subcategoria !== filters.subcategoria) return false;
    if (filters.kvi !== "todos") {
      const isKvi = produto.classificacaoKVI === "Alta";
      if (filters.kvi === "sim" && !isKvi) return false;
      if (filters.kvi === "nao" && isKvi) return false;
    }
    return true;
  });

  const excelData = filteredProducts.map((produto) => {
    const margemAtual = produto.margemAtual || 0;
    const margemMeta = 18; // Meta padrão
    const quebraAtual = produto.quebraAtual || 0;
    const quebraMeta = 2; // Meta padrão
    const marcasAtuais = produto.marcasAtuais || 0;
    const marcasMin = produto.marcasMin || 2;
    const marcasMax = produto.marcasMax || 5;

    // Calcular status
    let status = "OK";
    if (margemAtual < margemMeta - 1 || quebraAtual > quebraMeta + 1 || marcasAtuais < marcasMin) {
      status = "Crítico";
    } else if (margemAtual < margemMeta || quebraAtual > quebraMeta || marcasAtuais > marcasMax) {
      status = "Atenção";
    }

    const precoMedio =
      ((produto.precoMedioReferencia?.min || 0) + (produto.precoMedioReferencia?.max || 0)) / 2;

    return {
      "Departamento": produto.departamento,
      "Categoria": produto.categoria,
      "Subcategoria": produto.subcategoria,
      "Produto": produto.descricao,
      "Código": produto.codigo,
      "KVI": produto.classificacaoKVI === "Alta" ? "Sim" : "Não",
      "Receita (R$)": (produto.participacaoFaturamento || 0) * 1000,
      "Margem Atual (%)": margemAtual,
      "Margem Meta (%)": margemMeta,
      "Quebra Atual (%)": quebraAtual,
      "Quebra Meta (%)": quebraMeta,
      "Preço Médio (R$)": precoMedio,
      "Marcas Atuais": marcasAtuais,
      "Marcas Min": marcasMin,
      "Marcas Max": marcasMax,
      "Giro Ideal (dias)": produto.giroIdealMes || 30,
      "Status": status,
      "Participação Receita (%)": produto.participacaoFaturamento || 0,
    };
  });

  const wb = new ExcelJS.Workbook();

  // Aba principal com dados
  const ws = wb.addWorksheet("Relatório Analítico");
  if (excelData.length > 0) {
    ws.columns = Object.keys(excelData[0]).map((key) => ({ header: key, key }));
    ws.addRows(excelData as any);
  }

  setColumnWidths(ws, [
    15, // Departamento
    15, // Categoria
    15, // Subcategoria
    30, // Produto
    12, // Código
    8, // KVI
    14, // Receita
    14, // Margem Atual
    14, // Margem Meta
    14, // Quebra Atual
    14, // Quebra Meta
    14, // Preço Médio
    14, // Marcas Atuais
    12, // Marcas Min
    12, // Marcas Max
    14, // Giro Ideal
    12, // Status
    18, // Participação
  ]);

  // Aba de resumo
  const resumoWs = wb.addWorksheet("Resumo");
  const receitaTotal = filteredProducts.reduce((sum, p) => sum + (p.participacaoFaturamento || 0), 0) * 1000;
  const margemMedia =
    filteredProducts.length > 0
      ? filteredProducts.reduce((sum, p) => sum + (p.margemAtual || 0), 0) / filteredProducts.length
      : 0;
  const quebraMedia =
    filteredProducts.length > 0
      ? filteredProducts.reduce((sum, p) => sum + (p.quebraAtual || 0), 0) / filteredProducts.length
      : 0;

  const resumoData: Array<[string, string | number]> = [
    ["Métrica", "Valor"],
    ["Total de Produtos", filteredProducts.length],
    ["Receita Total (R$)", receitaTotal],
    ["Margem Média (%)", margemMedia],
    ["Quebra Média (%)", quebraMedia],
    ["Produtos KVI", filteredProducts.filter((p) => p.classificacaoKVI === "Alta").length],
    ["Produtos OK", excelData.filter((p) => p["Status"] === "OK").length],
    ["Produtos Atenção", excelData.filter((p) => p["Status"] === "Atenção").length],
    ["Produtos Críticos", excelData.filter((p) => p["Status"] === "Crítico").length],
  ];

  resumoWs.addRows(resumoData);
  setColumnWidths(resumoWs, [24, 18]);

  const currentDate = new Date().toISOString().split("T")[0];
  await downloadWorkbook(wb, `relatorio-analitico-${currentDate}.xlsx`);
};

export const generateStandardTemplate = async (produtos: Produto[]) => {
  const templateData = produtos.map((produto) => ({
    "Departamento": produto.departamento,
    "Categoria": produto.categoria,
    "Subcategoria": produto.subcategoria,
    "Produto": produto.descricao,
    "Código": produto.codigo,
    "Receita (R$)": (produto.participacaoFaturamento || 0) * 1000,
    "Margem (%)": produto.margemAtual || 0,
    "% Quebra": produto.quebraAtual || 0,
    "Qtde Marcas Atual": produto.marcasAtuais || 0,
    "Qtde Marcas Min": produto.marcasMin || 2,
    "Qtde Marcas Max": produto.marcasMax || 5,
    "Preço Médio Real": ((produto.precoMedioReferencia?.min || 0) + (produto.precoMedioReferencia?.max || 0)) / 2,
    "Preço Referência Min": produto.precoMedioReferencia?.min || 0,
    "Preço Referência Max": produto.precoMedioReferencia?.max || 0,
    "Giro Ideal (dias)": produto.giroIdealMes || 30,
    "KVI": produto.classificacaoKVI === "Alta" ? "Sim" : "Não",
    "Margem A Min (%)": produto.margemA?.min || 15,
    "Margem A Max (%)": produto.margemA?.max || 20,
    "Margem B Min (%)": produto.margemB?.min || 12,
    "Margem B Max (%)": produto.margemB?.max || 18,
    "Margem C Min (%)": produto.margemC?.min || 8,
    "Margem C Max (%)": produto.margemC?.max || 15,
    "Quebra Esperada (%)": produto.quebraEsperada || 2,
    "Participação Faturamento (%)": produto.participacaoFaturamento || 0,
  }));

  const wb = new ExcelJS.Workbook();

  const ws = wb.addWorksheet("Estrutura Mercadológica");
  if (templateData.length > 0) {
    ws.columns = Object.keys(templateData[0]).map((key) => ({ header: key, key }));
    ws.addRows(templateData as any);
  }
  // Previously all columns were width 15 (24 columns)
  setColumnWidths(ws, Array(24).fill(15));

  const wsInstrucoes = wb.addWorksheet("Instruções");
  const instrucoes: string[][] = [
    ["Instruções de Uso da Planilha Padrão"],
    [""],
    ["Esta planilha contém a estrutura mercadológica completa do seu supermercado."],
    ["Você pode editar os dados e reimportar no sistema."],
    [""],
    ["Campos Principais:"],
    ["- Departamento/Categoria/Subcategoria/Produto: Hierarquia dos itens"],
    ["- Receita: Valor de vendas em reais"],
    ["- Margem (%): Margem de lucro atual"],
    ["- % Quebra: Percentual de quebra/perda"],
    ["- Qtde Marcas: Quantidade de marcas (atual, mínima e máxima recomendada)"],
    ["- Preço: Valores de referência de mercado"],
    ["- Giro Ideal: Dias ideais para renovação do estoque"],
    ["- KVI: Produtos de alta importância (Key Value Items)"],
    ["- Margens A/B/C: Faixas de margem por classificação"],
    [""],
    ["Para reimportar:"],
    ["1. Salve o arquivo em formato CSV ou XLSX"],
    ["2. Use a função \"Importar CSV\" no sistema"],
    ["3. Aguarde o processamento e validação"],
  ];
  wsInstrucoes.addRows(instrucoes);
  setColumnWidths(wsInstrucoes, [80]);

  const currentDate = new Date().toISOString().split("T")[0];
  await downloadWorkbook(wb, `planilha-padrao-mercadologica-${currentDate}.xlsx`);
};
