import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  TrendingUp, 
  Shield, 
  Zap, 
  CheckCircle, 
  Star,
  Menu,
  ArrowRight,
  PieChart,
  Target,
  Users,
  Building2,
  Sparkles,
  Brain,
  ChartBar,
  Globe
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const Index = () => {
  const [email, setEmail] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implementar captura de lead
    console.log("Email capturado:", email);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-foreground">Mercadológico SaaS</span>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#inicio" className="text-muted-foreground hover:text-primary transition-colors">Home</a>
              <a href="#sobre" className="text-muted-foreground hover:text-primary transition-colors">Sobre</a>
              <a href="#beneficios" className="text-muted-foreground hover:text-primary transition-colors">Benefícios</a>
              <a href="#precos" className="text-muted-foreground hover:text-primary transition-colors">Preços</a>
              <Button variant="outline" size="sm" asChild>
                <Link to="/auth">Entrar</Link>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </nav>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-border pt-4">
              <div className="flex flex-col space-y-4">
                <a href="#inicio" className="text-muted-foreground hover:text-primary transition-colors">Home</a>
                <a href="#sobre" className="text-muted-foreground hover:text-primary transition-colors">Sobre</a>
                <a href="#beneficios" className="text-muted-foreground hover:text-primary transition-colors">Benefícios</a>
                <a href="#precos" className="text-muted-foreground hover:text-primary transition-colors">Preços</a>
                <Button variant="outline" size="sm" className="w-fit" asChild>
                  <Link to="/auth">Entrar</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

      <main>
        {/* Hero Section - Redesigned */}
        <section id="inicio" className="relative py-24 lg:py-36 overflow-hidden">
          {/* Background with gradient and subtle animation */}
          <div className="absolute inset-0 bg-gradient-to-br from-background via-secondary/30 to-primary/10"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-success/5 rounded-full blur-3xl"></div>
          
          <div className="relative container mx-auto px-4 text-center">
            <div className="mb-6 flex justify-center">
              <Badge variant="secondary" className="px-4 py-2 text-sm font-medium bg-gradient-primary text-primary-foreground">
                <Sparkles className="w-4 h-4 mr-2" />
                Novo: IA Integrada para Análise Preditiva
              </Badge>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold text-foreground mb-8 leading-tight tracking-tight">
              Transforme seu<br />
              <span className="bg-gradient-primary bg-clip-text text-transparent">Supermercado</span><br />
              em uma máquina de lucros
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-4xl mx-auto leading-relaxed">
              A plataforma de gestão mercadológica mais avançada do Brasil.<br />
              <strong className="text-foreground">Estrutura + KPIs + IA</strong> para supermercados até R$ 4MM/ano.
            </p>

            {/* CTA Section */}
            <div className="max-w-lg mx-auto mb-12">
              <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row gap-4 mb-6">
                <Input
                  type="email"
                  placeholder="seu-email@supermercado.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="text-center sm:text-left h-14 text-lg bg-card border-2 border-border focus:border-primary"
                  required
                />
                <Button type="submit" size="lg" className="h-14 px-8 text-lg bg-gradient-primary hover:opacity-90 shadow-strong">
                  Começar Grátis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </form>

              <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  Teste 14 dias grátis
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-success" />
                  Sem cartão
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-success" />
                  Setup em 3 min
                </div>
              </div>
            </div>

            {/* Social proof numbers */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">500+</div>
                <div className="text-sm text-muted-foreground">Supermercados</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-success mb-2">18%</div>
                <div className="text-sm text-muted-foreground">Aumento médio na margem</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-warning mb-2">4.9★</div>
                <div className="text-sm text-muted-foreground">Avaliação média</div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section id="beneficios" className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Por que escolher o Mercadológico SaaS?
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Transforme seu supermercado com a estrutura mercadológica mais completa do Brasil
              </p>
            </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center hover:shadow-strong transition-all duration-300 group">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl mb-2">Estrutura Padronizada</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  Base mercadológica completa: Departamentos → Categorias → Subcategorias → Produtos. 
                  <strong className="text-foreground">Pronta para usar!</strong>
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-strong transition-all duration-300 group">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-success/20 to-success/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Brain className="h-8 w-8 text-success" />
                </div>
                <CardTitle className="text-xl mb-2">IA Integrada</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  KPIs em tempo real com análise preditiva: margens, quebras, mix de marcas. 
                  <strong className="text-foreground">Alertas inteligentes</strong> para decisões rápidas.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-strong transition-all duration-300 group">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-warning/20 to-warning/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <ChartBar className="h-8 w-8 text-warning" />
                </div>
                <CardTitle className="text-xl mb-2">Relatórios Avançados</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  Análises comparativas, benchmarks do setor e relatórios personalizados com IA. 
                  <strong className="text-foreground">Export automático</strong> PDF/Excel.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-strong transition-all duration-300 group">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-accent/30 to-primary/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Globe className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl mb-2">Multi-plataforma</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  Acesse de qualquer lugar: web, tablet, mobile. 
                  <strong className="text-foreground">Sincronização automática</strong> entre dispositivos.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="precos" className="py-20 bg-secondary/20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Planos que se adaptam ao seu negócio
              </h2>
              <p className="text-xl text-muted-foreground">
                Escolha o plano ideal para o porte do seu supermercado
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Plano Básico */}
              <Card className="relative">
                <CardHeader>
                  <CardTitle className="text-center">Básico</CardTitle>
                  <CardDescription className="text-center">Perfeito para mercados iniciantes</CardDescription>
                  <div className="text-center mt-4">
                    <span className="text-3xl font-bold text-foreground">R$ 97</span>
                    <span className="text-muted-foreground">/mês</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-success" />
                    <span className="text-sm">Até 1.000 produtos</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-success" />
                    <span className="text-sm">Dashboard básico</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-success" />
                    <span className="text-sm">Relatórios mensais</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-success" />
                    <span className="text-sm">Suporte por email</span>
                  </div>
                  <Button className="w-full" variant="outline" asChild>
                    <Link to="/auth">Começar Teste Grátis</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Plano Pro - Destacado */}
              <Card className="relative border-primary shadow-strong">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-primary text-primary-foreground">Mais Popular</Badge>
                </div>
                <CardHeader>
                  <CardTitle className="text-center">Pro</CardTitle>
                  <CardDescription className="text-center">Ideal para mercados em crescimento</CardDescription>
                  <div className="text-center mt-4">
                    <span className="text-3xl font-bold text-foreground">R$ 197</span>
                    <span className="text-muted-foreground">/mês</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-success" />
                    <span className="text-sm">Até 5.000 produtos</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-success" />
                    <span className="text-sm">Dashboard avançado com IA</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-success" />
                    <span className="text-sm">Relatórios semanais</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-success" />
                    <span className="text-sm">Alertas automáticos</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-success" />
                    <span className="text-sm">Suporte prioritário</span>
                  </div>
                  <Button className="w-full bg-gradient-primary hover:opacity-90 shadow-medium" asChild>
                    <Link to="/auth">Começar Teste Grátis</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Plano Enterprise */}
              <Card className="relative">
                <CardHeader>
                  <CardTitle className="text-center">Enterprise</CardTitle>
                  <CardDescription className="text-center">Para redes e grandes mercados</CardDescription>
                  <div className="text-center mt-4">
                    <span className="text-3xl font-bold text-foreground">R$ 397</span>
                    <span className="text-muted-foreground">/mês</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-success" />
                    <span className="text-sm">Produtos ilimitados</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-success" />
                    <span className="text-sm">Múltiplas lojas</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-success" />
                    <span className="text-sm">BI personalizado</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-success" />
                    <span className="text-sm">API completa</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-success" />
                    <span className="text-sm">Gerente de sucesso</span>
                  </div>
                  <Button className="w-full" variant="outline" asChild>
                    <Link to="/auth">Falar com Vendas</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                O que nossos clientes dizem
              </h2>
              <p className="text-xl text-muted-foreground">
                Supermercados que já transformaram seus resultados
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <Card className="bg-card hover:shadow-medium transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary-light/20 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Carlos Silva</CardTitle>
                      <CardDescription>Supermercado Bom Preço - SP</CardDescription>
                    </div>
                  </div>
                  <div className="flex space-x-1 mt-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-warning text-warning" />
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    "Aumentamos nossa margem média em 18% nos primeiros 3 meses. 
                    O dashboard mostra exatamente onde estávamos perdendo dinheiro."
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card hover:shadow-medium transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-success-light rounded-full flex items-center justify-center">
                      <Target className="h-6 w-6 text-success" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Maria Santos</CardTitle>
                      <CardDescription>Rede Família - RJ (3 lojas)</CardDescription>
                    </div>
                  </div>
                  <div className="flex space-x-1 mt-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-warning text-warning" />
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    "Finalmente conseguimos padronizar nossas 3 lojas. Os relatórios 
                    automáticos economizam 10 horas por semana da minha equipe."
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card hover:shadow-medium transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-warning-light rounded-full flex items-center justify-center">
                      <Shield className="h-6 w-6 text-warning" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">João Oliveira</CardTitle>
                      <CardDescription>Mercado Central - MG</CardDescription>
                    </div>
                  </div>
                  <div className="flex space-x-1 mt-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-warning text-warning" />
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    "Sistema muito fácil de usar. Em 2 semanas já tinha todos os 
                    produtos organizados e os primeiros insights aparecendo."
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <BarChart3 className="h-6 w-6 text-primary" />
                <span className="text-lg font-bold text-foreground">Mercadológico SaaS</span>
              </div>
              <p className="text-muted-foreground text-sm">
                A plataforma completa para gestão mercadológica de supermercados.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Produto</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Funcionalidades</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Preços</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Roadmap</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Changelog</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Sobre nós</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Carreiras</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contato</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Suporte</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Documentação</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Status</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Entrar</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © 2025 Mercadológico SaaS. Todos os direitos reservados.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Política de Privacidade
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Termos de Uso
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
