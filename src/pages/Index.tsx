import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BarChart3, TrendingUp, Shield, Zap, CheckCircle, Star, Menu, ArrowRight, PieChart, Target, Users, Building2, Sparkles, Brain, ChartBar, Globe, Database, FileText, Upload, DollarSign, Clock, Award, Quote, Loader2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [email, setEmail] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('leads')
        .insert({
          email: email.trim().toLowerCase(),
          source: 'landing_hero',
          metadata: { page: 'index', timestamp: new Date().toISOString() }
        });

      if (error) {
        if (error.code === '23505') {
          toast({
            title: "Email já cadastrado",
            description: "Este email já está em nossa lista. Faça login para acessar.",
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Sucesso!",
          description: "Você receberá um email com instruções para começar.",
        });
        setEmail("");
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível enviar. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return <div className="min-h-screen bg-background">
      {/* Header Fixo */}
      <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-success rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
                Nexmart
              </span>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#inicio" className="text-muted-foreground hover:text-primary transition-colors font-medium">Home</a>
              <a href="#solucao" className="text-muted-foreground hover:text-primary transition-colors font-medium">Solução</a>
              <a href="#beneficios" className="text-muted-foreground hover:text-primary transition-colors font-medium">Benefícios</a>
              <a href="#precos" className="text-muted-foreground hover:text-primary transition-colors font-medium">Preços</a>
              <Button variant="outline" size="sm" asChild className="hover-scale">
                <Link to="/auth">Entrar</Link>
              </Button>
              <Button size="sm" className="bg-gradient-to-r from-primary to-success hover:opacity-90 shadow-lg" asChild>
                <Link to="/auth">Experimente Grátis</Link>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <Menu className="h-5 w-5" />
            </Button>
          </nav>

          {/* Mobile Menu */}
          {isMenuOpen && <div className="md:hidden mt-4 pb-4 border-t border-border pt-4 animate-fade-in">
              <div className="flex flex-col space-y-4">
                <a href="#inicio" className="text-muted-foreground hover:text-primary transition-colors font-medium">Home</a>
                <a href="#solucao" className="text-muted-foreground hover:text-primary transition-colors font-medium">Solução</a>
                <a href="#beneficios" className="text-muted-foreground hover:text-primary transition-colors font-medium">Benefícios</a>
                <a href="#precos" className="text-muted-foreground hover:text-primary transition-colors font-medium">Preços</a>
                <div className="flex flex-col space-y-2">
                  <Button variant="outline" size="sm" className="w-fit" asChild>
                    <Link to="/auth">Entrar</Link>
                  </Button>
                  <Button size="sm" className="w-fit bg-gradient-to-r from-primary to-success hover:opacity-90" asChild>
                    <Link to="/auth">Experimente Grátis</Link>
                  </Button>
                </div>
              </div>
            </div>}
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section id="inicio" className="relative py-24 lg:py-32 overflow-hidden">
          {/* Background elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-success/10"></div>
          <div className="absolute top-10 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-success/10 rounded-full blur-3xl animate-pulse" style={{
          animationDelay: '2s'
        }}></div>
          
          <div className="relative container mx-auto px-4 text-center">
            <div className="mb-8 animate-fade-in">
              <Badge variant="secondary" className="px-6 py-3 text-sm font-semibold bg-gradient-to-r from-primary/20 to-success/20 border border-primary/30">
                <Sparkles className="w-4 h-4 mr-2" />
                Revolucione sua gestão mercadológica
              </Badge>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-foreground mb-8 leading-tight tracking-tight animate-fade-in" style={{
            animationDelay: '0.2s'
          }}>
              Nexmart: O Próximo Nível da<br />
              <span className="bg-gradient-to-r from-primary via-success to-primary bg-clip-text text-transparent">
                Gestão Mercadológica
              </span>
            </h1>
            
            <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground mb-12 max-w-4xl mx-auto leading-relaxed animate-fade-in" style={{
            animationDelay: '0.4s'
          }}>
              Organize sua estrutura, otimize suas margens e impulsione o lucro do seu supermercado<br />
              com <strong className="text-foreground">inteligência e simplicidade</strong>.
            </p>

            {/* CTA Principal */}
            <div className="max-w-lg mx-auto mb-16 animate-fade-in" style={{
            animationDelay: '0.6s'
          }}>
              <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row gap-4 mb-8">
                <Input type="email" placeholder="seu-email@supermercado.com" value={email} onChange={e => setEmail(e.target.value)} className="h-14 text-lg bg-card/80 backdrop-blur-sm border-2 border-border focus:border-primary transition-all" required disabled={isSubmitting} />
                <Button type="submit" size="lg" className="h-14 px-8 text-lg bg-gradient-to-r from-primary to-success hover:opacity-90 shadow-xl hover-scale" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      Experimente Grátis por 7 Dias
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </form>

              <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  Teste gratuito de 7 dias
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-success" />
                  Sem compromisso
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-success" />
                  Configuração rápida
                </div>
              </div>
            </div>

            {/* Social Proof */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto animate-fade-in" style={{
            animationDelay: '0.8s'
          }}>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-success bg-clip-text text-transparent mb-2">1000+</div>
                <div className="text-sm text-muted-foreground">Supermercados</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-success bg-clip-text text-transparent mb-2">25%</div>
                <div className="text-sm text-muted-foreground">Aumento médio na margem</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-success bg-clip-text text-transparent mb-2">4.9★</div>
                <div className="text-sm text-muted-foreground">Avaliação dos clientes</div>
              </div>
            </div>
          </div>
        </section>

        {/* Seção "A Solução Nexmart" */}
        <section id="solucao" className="py-20 bg-card/20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
                Transforme Dados em Lucro
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                O Nexmart resolve os principais desafios do dia a dia do seu supermercado com uma plataforma 
                inteligente que organiza, analisa e otimiza sua operação mercadológica.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="text-center hover:shadow-xl transition-all duration-300 group hover-scale border-border/50">
                <CardHeader>
                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Database className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl mb-3">Estrutura Padronizada</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    Receba uma base mercadológica completa e otimizada, pronta para implementar no seu supermercado.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-xl transition-all duration-300 group hover-scale border-border/50">
                <CardHeader>
                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-success/20 to-success/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <BarChart3 className="h-8 w-8 text-success" />
                  </div>
                  <CardTitle className="text-xl mb-3">Dashboard Inteligente</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    Visualize KPIs em tempo real e tome decisões estratégicas baseadas em dados precisos.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-xl transition-all duration-300 group hover-scale border-border/50">
                <CardHeader>
                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-warning/20 to-warning/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <FileText className="h-8 w-8 text-warning" />
                  </div>
                  <CardTitle className="text-xl mb-3">Relatórios Estratégicos</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    Gere análises profissionais em segundos com exportação automática em PDF e Excel.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-xl transition-all duration-300 group hover-scale border-border/50">
                <CardHeader>
                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500/20 to-purple-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Upload className="h-8 w-8 text-purple-500" />
                  </div>
                  <CardTitle className="text-xl mb-3">Importação Simplificada</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    Conecte seus dados do ERP ou planilhas de forma rápida e fácil, sem complicações.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Seção "Benefícios Exclusivos" */}
        <section id="beneficios" className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
                Por que o Nexmart é ideal para o seu negócio?
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
                Descubra os benefícios exclusivos que fazem do Nexmart a escolha certa para supermercados que querem crescer.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="flex items-start space-x-4 p-6 rounded-xl bg-card/40 hover:bg-card/60 transition-all duration-300 hover-scale">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-success/20 to-success/10 rounded-xl flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-success" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Aumento de Lucratividade</h3>
                  <p className="text-muted-foreground">Otimize margens e mix de produtos com análises precisas e recomendações inteligentes.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-6 rounded-xl bg-card/40 hover:bg-card/60 transition-all duration-300 hover-scale">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Redução de Perdas</h3>
                  <p className="text-muted-foreground">Identifique rupturas e quebras rapidamente com alertas automáticos e dashboards visuais.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-6 rounded-xl bg-card/40 hover:bg-card/60 transition-all duration-300 hover-scale">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-warning/20 to-warning/10 rounded-xl flex items-center justify-center">
                  <Brain className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Decisões Baseadas em Dados</h3>
                  <p className="text-muted-foreground">Saia do "achismo" com informações precisas e análises fundamentadas em inteligência artificial.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-6 rounded-xl bg-card/40 hover:bg-card/60 transition-all duration-300 hover-scale">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-500/20 to-purple-500/10 rounded-xl flex items-center justify-center">
                  <Clock className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Economia de Tempo</h3>
                  <p className="text-muted-foreground">Automatize análises e relatórios que antes levavam horas para serem feitos manualmente.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-6 rounded-xl bg-card/40 hover:bg-card/60 transition-all duration-300 hover-scale">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Fácil de Usar</h3>
                  <p className="text-muted-foreground">Interface intuitiva e amigável, sem necessidade de treinamento complexo ou conhecimento técnico.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-6 rounded-xl bg-card/40 hover:bg-card/60 transition-all duration-300 hover-scale">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-green-500/20 to-green-500/10 rounded-xl flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Escalável</h3>
                  <p className="text-muted-foreground">Cresça com o Nexmart, adaptando-se às necessidades do seu negócio conforme ele evolui.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Seção "Planos e Preços" */}
        <section id="precos" className="py-20 bg-card/20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
                Escolha o plano ideal para o seu supermercado
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                Planos flexíveis que se adaptam ao porte e necessidades do seu negócio.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Plano Essencial */}
              <Card className="relative hover:shadow-xl transition-all duration-300 hover-scale">
                <CardHeader className="text-center">
                  <Badge variant="secondary" className="w-fit mx-auto mb-4">Ideal para organizar</Badge>
                  <CardTitle className="text-2xl">Plano Essencial</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-foreground">R$ 79,90</span>
                    <span className="text-muted-foreground">/loja/mês</span>
                  </div>
                  <CardDescription>ou R$ 799,00/ano (2 meses grátis)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                    <span className="text-sm">Dashboard com KPIs estratégicos</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                    <span className="text-sm">Gestão da Estrutura Mercadológica</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                    <span className="text-sm">Importação de dados via planilha</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                    <span className="text-sm">Relatórios em PDF e Excel</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                    <span className="text-sm">Suporte via e-mail</span>
                  </div>
                  <Button className="w-full mt-6" variant="outline" asChild>
                    <Link to="/auth">Comece Grátis</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Plano Pro - Destacado */}
              <Card className="relative border-2 border-primary shadow-xl hover:shadow-2xl transition-all duration-300 hover-scale">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-primary to-success text-white px-6 py-2">Mais Completo</Badge>
                </div>
                <CardHeader className="text-center pt-8">
                  <Badge variant="secondary" className="w-fit mx-auto mb-4">Ideal para acelerar</Badge>
                  <CardTitle className="text-2xl">Plano Pro</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-foreground">R$ 149,90</span>
                    <span className="text-muted-foreground">/loja/mês</span>
                  </div>
                  <CardDescription>ou R$ 1.499,00/ano (2 meses grátis)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                    <span className="text-sm font-medium">Tudo do Essencial +</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                    <span className="text-sm font-bold text-primary">Alertas Inteligentes (IA)</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                    <span className="text-sm font-bold text-primary">Importação Avançada</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                    <span className="text-sm">Benchmarks de Mercado (em breve)</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                    <span className="text-sm">Suporte Prioritário via WhatsApp</span>
                  </div>
                  <Button className="w-full mt-6 bg-gradient-to-r from-primary to-success hover:opacity-90" asChild>
                    <Link to="/auth">Comece Grátis</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="text-center mt-12">
              <p className="text-muted-foreground mb-4">
                🎯 Todos os planos incluem 7 dias grátis e podem ser cancelados a qualquer momento
              </p>
            </div>
          </div>
        </section>

        {/* Seção "Depoimentos" */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
                O que nossos clientes dizem
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground">
                Resultados reais de supermercados que transformaram sua gestão com o Nexmart.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="hover:shadow-xl transition-all duration-300 hover-scale">
                <CardHeader>
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-warning text-warning" />)}
                  </div>
                  <Quote className="w-8 h-8 text-muted-foreground mb-4" />
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-6 italic">
                    "Aumentei minha margem em 22% nos primeiros 3 meses. O Nexmart me mostrou onde eu estava perdendo dinheiro sem perceber."
                  </p>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-success rounded-full flex items-center justify-center text-white font-bold">
                      MS
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Maria Silva</p>
                      <p className="text-sm text-muted-foreground">Supermercado Família, SP</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-xl transition-all duration-300 hover-scale">
                <CardHeader>
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-warning text-warning" />)}
                  </div>
                  <Quote className="w-8 h-8 text-muted-foreground mb-4" />
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-6 italic">
                    "Nunca tive tanta clareza sobre meu estoque. Os relatórios são perfeitos para apresentar aos fornecedores."
                  </p>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-success rounded-full flex items-center justify-center text-white font-bold">
                      JS
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">João Santos</p>
                      <p className="text-sm text-muted-foreground">Mercado Central, RJ</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-xl transition-all duration-300 hover-scale">
                <CardHeader>
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-warning text-warning" />)}
                  </div>
                  <Quote className="w-8 h-8 text-muted-foreground mb-4" />
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-6 italic">
                    "Economizo 5 horas por semana em análises. Agora posso focar no que realmente importa: atender meus clientes."
                  </p>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-success rounded-full flex items-center justify-center text-white font-bold">
                      AL
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Ana Lima</p>
                      <p className="text-sm text-muted-foreground">Supermercado Bom Preço, MG</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Seção FAQ */}
        <section className="py-20 bg-card/20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
                Perguntas Frequentes
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground">
                Tire suas dúvidas sobre o Nexmart e como ele pode transformar seu supermercado.
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <Accordion type="single" collapsible className="space-y-4">
                <AccordionItem value="item-1" className="border rounded-lg px-6">
                  <AccordionTrigger className="text-left font-semibold">
                    Como funciona a importação de dados?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pt-4">
                    A importação é super simples! Você pode conectar diretamente seu ERP ou enviar planilhas Excel/CSV. 
                    Nossa plataforma reconhece automaticamente os campos principais e mapeia seus dados para a estrutura do Nexmart. 
                    Todo o processo leva menos de 10 minutos.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2" className="border rounded-lg px-6">
                  <AccordionTrigger className="text-left font-semibold">
                    Existe suporte técnico disponível?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pt-4">
                    Sim! Oferecemos suporte completo por email (Plano Básico) e suporte prioritário via chat e telefone (Plano Pro). 
                    Nossa equipe está sempre pronta para ajudar você a aproveitar ao máximo o Nexmart.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3" className="border rounded-lg px-6">
                  <AccordionTrigger className="text-left font-semibold">
                    Posso cancelar a qualquer momento?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pt-4">
                    Absolutamente! Não há fidelidade ou multa por cancelamento. Você pode cancelar sua assinatura a qualquer 
                    momento através do painel administrativo, e terá acesso aos recursos até o final do período pago.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4" className="border rounded-lg px-6">
                  <AccordionTrigger className="text-left font-semibold">
                    Meus dados ficam seguros na plataforma?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pt-4">
                    Segurança é nossa prioridade! Utilizamos criptografia de ponta a ponta, backups automáticos diários e 
                    hospedagem em servidores certificados. Seus dados são 100% privados e protegidos, atendendo às normas da LGPD.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5" className="border rounded-lg px-6">
                  <AccordionTrigger className="text-left font-semibold">
                    Preciso de conhecimento técnico para usar?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pt-4">
                    Não! O Nexmart foi desenvolvido pensando na simplicidade. Se você consegue usar WhatsApp, consegue usar o Nexmart. 
                    A interface é intuitiva e oferecemos tutoriais em vídeo para todos os recursos principais.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="py-20 bg-gradient-to-r from-primary via-success to-primary">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-4xl mx-auto text-white">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                Pronto para revolucionar seu supermercado?
              </h2>
              <p className="text-lg md:text-xl mb-12 opacity-90">
                Junte-se a mais de 1000 supermercados que já transformaram sua gestão com o Nexmart. 
                Comece seu teste gratuito hoje mesmo!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto">
                <Button size="lg" className="h-14 px-8 bg-white text-primary hover:bg-white/90 text-lg font-semibold hover-scale" asChild>
                  <Link to="/auth">
                    Experimente Grátis por 7 Dias
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
              <p className="text-sm mt-6 opacity-75">
                Sem cartão de crédito • Cancelamento gratuito • Suporte incluído
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Rodapé */}
      <footer className="bg-card border-t border-border">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-success rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
                  Nexmart
                </span>
              </div>
              <p className="text-muted-foreground mb-6 max-w-md">
                A plataforma de gestão mercadológica que leva supermercados para o próximo nível. 
                Transforme dados em lucro com inteligência e simplicidade.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center cursor-pointer hover:bg-primary hover:text-white transition-colors">
                  <span className="text-sm font-bold">f</span>
                </div>
                <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center cursor-pointer hover:bg-primary hover:text-white transition-colors">
                  <span className="text-sm font-bold">in</span>
                </div>
                <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center cursor-pointer hover:bg-primary hover:text-white transition-colors">
                  <span className="text-sm font-bold">ig</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-4">Empresa</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Sobre Nós</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contato</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Carreiras</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-4">Legal</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Termos de Uso</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Política de Privacidade</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">LGPD</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Cookies</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border mt-12 pt-8 text-center text-muted-foreground">
            <p>&copy; 2025 Nexmart. Todos os direitos reservados. Feito com ❤️ para supermercados brasileiros.</p>
          </div>
        </div>
      </footer>
    </div>;
};
export default Index;