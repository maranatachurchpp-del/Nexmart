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
  Building2
} from "lucide-react";
import { useState } from "react";

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
              <Button variant="outline" size="sm">Entrar</Button>
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
                <Button variant="outline" size="sm" className="w-fit">Entrar</Button>
              </div>
            </div>
          )}
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section id="inicio" className="py-20 lg:py-32 bg-gradient-to-br from-background to-secondary/20">
          <div className="container mx-auto px-4 text-center">
            <Badge variant="secondary" className="mb-6">🚀 Novo: Dashboard Inteligente com IA</Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Domine sua Estrutura<br />
              <span className="bg-gradient-primary bg-clip-text text-transparent">Mercadológica</span><br />
              e Lucre Mais
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              O SaaS completo para supermercados até R$ 4 milhões/ano. 
              Estruture departamentos, categorias e produtos com indicadores estratégicos automatizados.
            </p>

            {/* Email Capture Form */}
            <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto mb-8">
              <Input
                type="email"
                placeholder="Digite seu e-mail profissional"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="text-center sm:text-left"
                required
              />
              <Button type="submit" size="lg" className="bg-gradient-primary hover:opacity-90">
                Teste Grátis 7 dias
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>

            <p className="text-sm text-muted-foreground">
              ✅ Sem cartão de crédito • ✅ Configuração em 5 minutos • ✅ Suporte dedicado
            </p>
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
              <Card className="text-center hover:shadow-medium transition-shadow">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 bg-primary-light/20 rounded-lg flex items-center justify-center mb-4">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Estrutura Padronizada</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Base mercadológica completa: Departamentos → Categorias → Subcategorias → Produtos. 
                    Pronta para usar!
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-medium transition-shadow">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 bg-success-light rounded-lg flex items-center justify-center mb-4">
                    <PieChart className="h-6 w-6 text-success" />
                  </div>
                  <CardTitle className="text-lg">Dashboard Inteligente</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    KPIs em tempo real: margens, quebras, mix de marcas. 
                    Alertas automáticos para tomada de decisão rápida.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-medium transition-shadow">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 bg-warning-light rounded-lg flex items-center justify-center mb-4">
                    <TrendingUp className="h-6 w-6 text-warning" />
                  </div>
                  <CardTitle className="text-lg">Relatórios Estratégicos</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Análises comparativas, benchmarks do setor e relatórios personalizados. 
                    Exporte em PDF/Excel.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-medium transition-shadow">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 bg-accent rounded-lg flex items-center justify-center mb-4">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Fácil de Usar</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Interface intuitiva, mesmo para pequenos mercados. 
                    Configuração completa em menos de 5 minutos.
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
                  <Button className="w-full mt-6" variant="outline">
                    Começar Teste Grátis
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
                  <Button className="w-full mt-6 bg-gradient-primary hover:opacity-90">
                    Começar Teste Grátis
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
                  <Button className="w-full mt-6" variant="outline">
                    Falar com Vendas
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
