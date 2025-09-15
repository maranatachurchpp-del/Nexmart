import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Produto, DashboardFilters } from '@/types/mercadologico';

export const generatePDFReport = async (produtos: Produto[], filters: DashboardFilters) => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  
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

  // Calcular KPIs
  const totalReceita = filteredProducts.reduce((sum, p) => sum + (p.participacaoFaturamento || 0), 0);
  const margemMedia = filteredProducts.reduce((sum, p) => sum + (p.margemAtual || 0), 0) / filteredProducts.length;
  const quebraMedia = filteredProducts.reduce((sum, p) => sum + (p.quebraAtual || 0), 0) / filteredProducts.length;
  const produtosKVI = filteredProducts.filter(p => p.classificacaoKVI === 'Alta').length;

  // Capa
  pdf.setFontSize(24);
  pdf.setTextColor(41, 128, 185); // Primary blue
  pdf.text('Relatório Estratégico', pageWidth / 2, 50, { align: 'center' });
  
  pdf.setFontSize(16);
  pdf.setTextColor(0, 0, 0);
  pdf.text('Mercadológico SaaS', pageWidth / 2, 70, { align: 'center' });
  
  pdf.setFontSize(12);
  pdf.setTextColor(100, 100, 100);
  const currentDate = new Date().toLocaleDateString('pt-BR');
  pdf.text(`Gerado em: ${currentDate}`, pageWidth / 2, 90, { align: 'center' });

  // KPIs principais
  pdf.setFontSize(18);
  pdf.setTextColor(0, 0, 0);
  pdf.text('Indicadores Principais', 20, 130);
  
  const kpis = [
    { label: 'Faturamento Total', value: `R$ ${(totalReceita * 1000).toLocaleString('pt-BR')}`, color: [41, 128, 185] },
    { label: 'Margem Média', value: `${margemMedia.toFixed(1)}%`, color: [46, 204, 113] },
    { label: 'Quebra Média', value: `${quebraMedia.toFixed(1)}%`, color: [231, 76, 60] },
    { label: 'Produtos KVI', value: `${produtosKVI}`, color: [155, 89, 182] }
  ];

  let yPosition = 150;
  kpis.forEach((kpi, index) => {
    const xPosition = 20 + (index % 2) * 90;
    if (index % 2 === 0 && index > 0) yPosition += 30;
    
    pdf.setFillColor(kpi.color[0], kpi.color[1], kpi.color[2]);
    pdf.rect(xPosition, yPosition, 80, 20, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(10);
    pdf.text(kpi.label, xPosition + 5, yPosition + 8);
    pdf.setFontSize(14);
    pdf.text(kpi.value, xPosition + 5, yPosition + 16);
  });

  // Nova página para análises
  pdf.addPage();
  
  pdf.setFontSize(18);
  pdf.setTextColor(0, 0, 0);
  pdf.text('Análise por Departamento', 20, 30);

  // Top 5 Departamentos por Receita
  const departamentos = filteredProducts.reduce((acc, produto) => {
    const dept = produto.departamento;
    if (!acc[dept]) {
      acc[dept] = { receita: 0, margem: 0, count: 0 };
    }
    acc[dept].receita += produto.participacaoFaturamento || 0;
    acc[dept].margem += produto.margemAtual || 0;
    acc[dept].count += 1;
    return acc;
  }, {} as Record<string, { receita: number; margem: number; count: number }>);

  const topDepartamentos = Object.entries(departamentos)
    .map(([nome, data]) => ({
      nome,
      receita: data.receita,
      margem: data.margem / data.count
    }))
    .sort((a, b) => b.receita - a.receita)
    .slice(0, 5);

  yPosition = 50;
  topDepartamentos.forEach((dept, index) => {
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    pdf.text(`${index + 1}. ${dept.nome}`, 20, yPosition);
    pdf.text(`R$ ${(dept.receita * 1000).toLocaleString('pt-BR')}`, 100, yPosition);
    pdf.text(`${dept.margem.toFixed(1)}%`, 150, yPosition);
    yPosition += 10;
  });

  // Alertas Críticos
  pdf.setFontSize(18);
  pdf.text('Alertas Críticos', 20, yPosition + 20);
  
  const alertas = [];
  const margemBaixa = filteredProducts.filter(p => (p.margemAtual || 0) < 15).length;
  const quebraAlta = filteredProducts.filter(p => (p.quebraAtual || 0) > 2).length;
  const marcasInsuficientes = filteredProducts.filter(p => (p.marcasAtuais || 0) < (p.marcasMin || 2)).length;

  if (margemBaixa > 0) alertas.push(`${margemBaixa} produtos com margem abaixo de 15%`);
  if (quebraAlta > 0) alertas.push(`${quebraAlta} produtos com quebra acima de 2%`);
  if (marcasInsuficientes > 0) alertas.push(`${marcasInsuficientes} produtos com marcas insuficientes`);

  yPosition += 40;
  alertas.forEach((alerta, index) => {
    pdf.setFontSize(10);
    pdf.setTextColor(231, 76, 60); // Red
    pdf.text(`• ${alerta}`, 25, yPosition + (index * 8));
  });

  // Rodapé
  pdf.setFontSize(8);
  pdf.setTextColor(100, 100, 100);
  pdf.text(`Gerado pelo Mercadológico SaaS em ${currentDate}`, pageWidth / 2, pageHeight - 10, { align: 'center' });

  // Download
  pdf.save(`relatorio-estrategico-${currentDate.replace(/\//g, '-')}.pdf`);
};